"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Tv,
  Radio,
  Eye,
  Flame,
  Volume2,
  VolumeX,
  Share2,
  Heart,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  MapPin,
  User,
  Clock,
  Play,
  Check,
  Send,
  Loader2,
  AlertCircle,
  Camera,
  Video,
  VideoOff,
  Mic,
  MicOff,
  RefreshCw,
  Square,
  Zap,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useLang } from "@/lib/langContext";
import { useAuth } from "@/lib/authContext";

export default function LiveStreamingNewsPage() {
  const { lang } = useLang();
  const router = useRouter();
  const { user } = useAuth();
  const canBroadcast = user && ["superadmin", "editor", "reporter", "admin"].includes(user.role);

  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liveBlogs, setLiveBlogs] = useState([]);
  const [recentVideos, setRecentVideos] = useState([]);

  // In-page 1-Click Camera Broadcast state
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [facingMode, setFacingMode] = useState("user");
  const [broadcastDuration, setBroadcastDuration] = useState(0);
  const [cameraError, setCameraError] = useState("");
  const videoSelfPreviewRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);

  // Live interaction state
  const [reactions, setReactions] = useState({ heart: 342, fire: 589, clap: 215, shock: 94 });
  const [activeReactionAnim, setActiveReactionAnim] = useState([]);
  const [copied, setCopied] = useState(false);

  // Live chat messages
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: "सुरेश वर्मा", text: "संसद से बहुत ही स्पष्ट और सटीक ग्राउंड रिपोर्टिंग!", time: "अभी" },
    { id: 2, user: "रोहित सिंह", text: "राजेश जी, वित्त मंत्री के संबोधन पर विपक्ष की क्या प्रतिक्रिया है?", time: "1 मिनट पहले" },
    { id: 3, user: "अंजलि गुप्ता", text: "स्वर मीडिया की सीधी कवरेज हमेशा सबसे पहले होती है।", time: "2 मिनट पहले" },
  ]);
  const [newChatText, setNewChatText] = useState("");
  const [senderName, setSenderName] = useState("");

  const fetchLiveStream = async () => {
    try {
      const res = await apiFetch("/api/live-stream");
      if (res.success && res.liveStream) {
        setStream(res.liveStream);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Timer effect when broadcasting
  useEffect(() => {
    if (isBroadcasting) {
      timerRef.current = setInterval(() => {
        setBroadcastDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setBroadcastDuration(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isBroadcasting]);

  useEffect(() => {
    fetchLiveStream();

    // Poll live stream status: faster when camera stream is active so new chunks load
    const intervalTime = stream?.isLive && stream?.streamType === "camera" ? 3500 : 8000;
    const interval = setInterval(() => {
      fetchLiveStream();
    }, intervalTime);

    // Fetch related live blogs & videos
    apiFetch("/api/live-blogs")
      .then((r) => r.success && setLiveBlogs(r.liveBlogs?.slice(0, 3) || []))
      .catch((e) => console.error(e));

    apiFetch("/api/videos?limit=4")
      .then((r) => r.success && setRecentVideos(r.videos || []))
      .catch((e) => console.error(e));

    return () => {
      clearInterval(interval);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [stream?.isLive, stream?.streamType]);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Start 1-Click Instant Camera Live (Bina publish kare direct live on site)
  const handleStartQuickLive = async () => {
    if (!user) {
      router.push("/admin/login?redirect=/live");
      return;
    }
    try {
      setCameraError("");
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      const constraints = {
        video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      };

      const streamObj = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = streamObj;
      if (videoSelfPreviewRef.current) {
        videoSelfPreviewRef.current.srcObject = streamObj;
      }
      setCameraActive(true);
      setIsBroadcasting(true);

      // Immediately set live state on server so viewers see it instantly
      await apiFetch("/api/live-stream", {
        method: "PUT",
        body: JSON.stringify({
          streamType: "camera",
          isLive: true,
          title: stream?.title || "लाइव ग्राउंड कवरेज",
          titleHi: stream?.titleHi || "लाइव ग्राउंड कवरेज (सीधा प्रसारण)",
          reporterName: user?.name || stream?.reporterName || "वरिष्ठ संवाददाता",
          reporterLocation: stream?.reporterLocation || "ग्राउंड जीरो",
          breakingHeadline: stream?.breakingHeadline || "बड़ी खबर: स्वर मीडिया रिपोर्टर सीधे ग्राउंड जीरो से लाइव",
        }),
      });

      // Stream chunks every 3s
      let recordedChunks = [];
      const options = { mimeType: "video/webm;codecs=vp8,opus" };
      let recorder;
      try {
        recorder = new MediaRecorder(streamObj, options);
      } catch (e) {
        recorder = new MediaRecorder(streamObj);
      }

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = async (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunks.push(e.data);
          const blob = new Blob(recordedChunks, { type: "video/webm" });
          const formData = new FormData();
          formData.append("video", blob, `live_${Date.now()}.webm`);

          try {
            const headers = {};
            if (typeof window !== "undefined") {
              const token = localStorage.getItem("token");
              if (token) headers["Authorization"] = `Bearer ${token}`;
            }
            await fetch("/api/live-stream/upload-chunk", {
              method: "POST",
              headers,
              credentials: "include",
              body: formData,
            });
          } catch (uploadErr) {
            console.error("Chunk upload error:", uploadErr);
          }
        }
      };

      recorder.start(3000);
      fetchLiveStream();
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError("कैमरा या माइक्रोफोन की परमिशन नहीं मिली। कृपया ब्राउज़र सेटिंग्स में अनुमति दें।");
      setIsBroadcasting(false);
      setCameraActive(false);
    }
  };

  // Stop Instant Camera Live
  const handleStopQuickLive = async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (videoSelfPreviewRef.current) {
      videoSelfPreviewRef.current.srcObject = null;
    }
    setCameraActive(false);
    setIsBroadcasting(false);

    try {
      await apiFetch("/api/live-stream", {
        method: "PUT",
        body: JSON.stringify({ isLive: false }),
      });
      fetchLiveStream();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleMic = () => {
    if (mediaStreamRef.current) {
      const audioTracks = mediaStreamRef.current.getAudioTracks();
      audioTracks.forEach((t) => (t.enabled = !t.enabled));
      setMicMuted(!micMuted);
    }
  };

  const switchCamera = async () => {
    const newMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newMode);
    if (isBroadcasting) {
      try {
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        }
        const streamObj = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: newMode, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
        mediaStreamRef.current = streamObj;
        if (videoSelfPreviewRef.current) {
          videoSelfPreviewRef.current.srcObject = streamObj;
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const triggerReaction = (type, emoji) => {
    setReactions((prev) => ({ ...prev, [type]: prev[type] + 1 }));
    const id = Date.now() + Math.random();
    setActiveReactionAnim((prev) => [...prev, { id, emoji, x: Math.random() * 80 + 10 }]);
    setTimeout(() => {
      setActiveReactionAnim((prev) => prev.filter((item) => item.id !== id));
    }, 1800);
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!newChatText.trim()) return;

    const user = senderName.trim() || (lang === "hi" ? "दर्शक" : "Viewer");
    const msg = {
      id: Date.now(),
      user,
      text: newChatText.trim(),
      time: lang === "hi" ? "अभी" : "Just now",
    };
    setChatMessages((prev) => [msg, ...prev]);
    setNewChatText("");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: stream?.title || "Swar Media Live News",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-3">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          {lang === "hi" ? "लाइव प्रसारण लोड हो रहा है..." : "Connecting to Live Broadcast..."}
        </p>
      </div>
    );
  }

  const isLive = stream?.isLive !== false;
  const isCameraStream = stream?.streamType === "camera";

  return (
    <div className="bg-slate-950 text-white min-h-screen py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 space-y-6">
        {/* Top Channel Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-red-600 text-white shadow-lg shadow-red-600/30">
              <Tv className="w-5 h-5" />
              {isLive && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full animate-ping" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {lang === "hi" ? "स्वर मीडिया 24x7 सीधा प्रसारण" : "Swar Media 24x7 Live Stream"}
                </h1>
                {isLive ? (
                  <span className="px-2 py-0.5 rounded-full bg-red-600 text-[10px] font-black tracking-widest uppercase animate-pulse">
                    LIVE
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-700 text-[10px] font-bold tracking-widest uppercase">
                    OFFLINE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {lang === "hi"
                  ? "ग्राउंड जीरो से संवाददाताओं की लाइव रिपोर्टिंग एवं ब्रेकिंग डिबेट"
                  : "Live field reporter dispatches, breaking debate, and continuous news streaming"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Quick 1-Click Camera Go Live Button */}
            {isBroadcasting ? (
              <button
                onClick={handleStopQuickLive}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-lg shadow-rose-600/30 transition-all hover:scale-105 animate-pulse cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>लाइव बंद करें ({formatTimer(broadcastDuration)})</span>
              </button>
            ) : (
              <button
                onClick={handleStartQuickLive}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-black shadow-lg shadow-red-600/30 transition-all hover:scale-105 cursor-pointer"
                title="बिना फॉर्म भरे सीधे कैमरा से लाइव जाएं"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{user ? "कैमरा से तुरंत लाइव जाएं" : "कैमरा लाइव (Go Live)"}</span>
              </button>
            )}

            {/* Viewers Counter */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-xl border border-slate-700 text-xs font-bold text-slate-200">
              <Eye className="w-4 h-4 text-red-500 animate-pulse" />
              <span>
                {stream?.viewers ? Number(stream.viewers).toLocaleString("en-IN") : "1,420"}{" "}
                <span className="text-slate-400 font-normal">{lang === "hi" ? "लाइव दर्शक" : "Watching"}</span>
              </span>
            </div>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? (lang === "hi" ? "लिंक कॉपी!" : "Copied!") : (lang === "hi" ? "शेयर" : "Share")}</span>
            </button>
          </div>
        </div>

        {cameraError && (
          <div className="p-3 bg-red-950/80 border border-red-800 rounded-2xl text-xs text-red-300 flex items-center justify-between gap-2">
            <span>{cameraError}</span>
            <button onClick={() => setCameraError("")} className="text-red-400 font-bold hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Main Broadcast Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Main Video Screen */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative aspect-video w-full bg-black rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
              {/* Floating Reaction Animation Emojis */}
              <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                {activeReactionAnim.map((a) => (
                  <span
                    key={a.id}
                    className="absolute bottom-16 text-3xl animate-bounce duration-1000"
                    style={{ left: `${a.x}%` }}
                  >
                    {a.emoji}
                  </span>
                ))}
              </div>

              {/* VIDEO STREAM CONTAINER */}
              {isBroadcasting ? (
                /* LIVE SELF-BROADCASTING VIEWPORT */
                <div className="relative w-full h-full bg-black">
                  <video
                    ref={videoSelfPreviewRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Floating Live Indicator */}
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-red-600 text-white font-black text-xs rounded-lg uppercase tracking-wider flex items-center gap-1.5 shadow-lg animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-white" />
                      YOU ARE LIVE ON SITE
                    </span>
                    <span className="px-2 py-0.5 bg-black/70 backdrop-blur-md text-red-400 font-mono text-xs font-bold rounded border border-red-500/30">
                      REC {formatTimer(broadcastDuration)}
                    </span>
                  </div>

                  {/* Hardware Controls */}
                  <div className="absolute bottom-14 right-4 z-30 flex items-center gap-2 bg-black/80 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-xl">
                    <button
                      type="button"
                      onClick={toggleMic}
                      className={`p-2 rounded-xl text-xs font-bold transition-colors ${
                        micMuted ? "bg-rose-900/80 text-rose-300" : "bg-slate-800 text-white hover:bg-slate-700"
                      }`}
                      title={micMuted ? "Unmute Mic" : "Mute Mic"}
                    >
                      {micMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={switchCamera}
                      className="p-2 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-700 transition-colors"
                      title="Flip Camera (Front/Back)"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleStopQuickLive}
                      className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5 fill-white" />
                      <span>Stop Live</span>
                    </button>
                  </div>
                </div>
              ) : isLive ? (
                isCameraStream ? (
                  stream?.cameraVideoUrl ? (
                    <video
                      key={stream.cameraVideoUrl}
                      src={stream.cameraVideoUrl}
                      autoPlay
                      playsInline
                      loop
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    /* Journalist Camera Standby / Live Broadcast active */
                    <div className="w-full h-full bg-radial from-slate-900 to-black flex flex-col items-center justify-center p-6 text-center space-y-4">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center animate-ping" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Radio className="w-10 h-10 text-red-500" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-black tracking-widest uppercase">
                          🔴 पत्रकार लाइव प्रसारण पर हैं
                        </span>
                        <h3 className="text-xl font-bold text-white pt-2">
                          {stream?.reporterName || "वरिष्ठ संवाददाता"}
                        </h3>
                        <p className="text-xs text-slate-400 max-w-md">
                          {stream?.reporterLocation || "ग्राउंड जीरो"} से लाइव कैमरा व ऑडियो सिंक हो रहा है।
                        </p>
                        <button
                          type="button"
                          onClick={handleStartQuickLive}
                          className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105 cursor-pointer"
                        >
                          <Camera className="w-4 h-4" />
                          <span>अपना कैमरा जोड़ें और लाइव हों</span>
                        </button>
                      </div>
                    </div>
                  )
                ) : stream?.streamUrl ? (
                  /* Live URL / YouTube stream */
                  <iframe
                    key={stream.streamUrl}
                    src={
                      stream.streamUrl.includes("youtube.com/watch?v=")
                        ? stream.streamUrl.replace("watch?v=", "embed/") + "?autoplay=1&mute=0"
                        : stream.streamUrl.includes("youtu.be/")
                        ? `https://www.youtube.com/embed/${stream.streamUrl.split("youtu.be/")[1]}?autoplay=1`
                        : stream.streamUrl
                    }
                    title="Live News Stream"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div className="text-center p-8 space-y-3">
                    <Radio className="w-12 h-12 text-slate-600 mx-auto" />
                    <p className="text-sm font-bold text-slate-400">स्ट्रीम यूआरएल सेट नहीं है</p>
                    <button
                      type="button"
                      onClick={handleStartQuickLive}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>कैमरा से तुरंत लाइव शुरू करें</span>
                    </button>
                  </div>
                )
              ) : (
                /* OFFLINE SCREEN */
                <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <Tv className="w-14 h-14 text-slate-600" />
                  <h3 className="text-lg font-black text-white">लाइव प्रसारण अभी उपलब्ध नहीं है</h3>
                  <p className="text-xs text-slate-400 max-w-md">
                    संवाददाता का अगला लाइव बुलेटिन जल्द प्रसारित होगा।
                  </p>
                  <button
                    type="button"
                    onClick={handleStartQuickLive}
                    className="mt-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all hover:scale-105 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>कैमरा चालू करें और तुरंत साइट पर लाइव हों</span>
                  </button>
                </div>
              )}

              {/* OVERLAYS (Channel Watermark & Live Indicators) */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
                <span className="px-2.5 py-1 bg-red-600/95 backdrop-blur-md text-white font-black text-xs rounded-lg uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  LIVE
                </span>
                <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-slate-200 font-bold text-xs rounded-lg border border-white/10">
                  SWAR NEWS
                </span>
              </div>

              {/* Reporter Location Bug (Bottom-Left) */}
              <div className="absolute bottom-12 left-4 z-20 pointer-events-none">
                <div className="bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2 shadow-xl">
                  <User className="w-3.5 h-3.5 text-red-500" />
                  <div className="text-left">
                    <p className="text-xs font-black text-white leading-none">
                      {stream?.reporterName || "राजेश शर्मा"}
                    </p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 leading-tight mt-0.5">
                      <MapPin className="w-2.5 h-2.5 text-red-400" />
                      <span>{stream?.reporterLocation || "नई दिल्ली"}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Crawling Breaking News Ticker (Bottom of Player) */}
              <div className="absolute bottom-0 inset-x-0 bg-red-700/95 backdrop-blur-md py-1.5 px-3 z-20 flex items-center gap-3 overflow-hidden border-t border-red-500/50">
                <span className="px-2 py-0.5 bg-black text-white text-[10px] font-black uppercase tracking-wider rounded shrink-0">
                  BREAKING
                </span>
                <div className="whitespace-nowrap overflow-hidden text-xs font-bold text-white tracking-wide animate-marquee">
                  {stream?.breakingHeadline || "संसद बजट सत्र: महत्वपूर्ण घोषणाओं पर स्वर मीडिया की विशेष ग्राउंड कवरेज जारी"}
                </div>
              </div>
            </div>

            {/* Broadcast Details & Quick Reactions */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-white tracking-tight">
                    {lang === "hi" ? stream?.titleHi || stream?.title : stream?.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-red-400 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {lang === "hi" ? "प्रसारण समय: " : "Broadcasted: "}
                        {new Date(stream?.startedAt || Date.now()).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </span>
                    <span>•</span>
                    <span>{stream?.reporterLocation || "नई दिल्ली"}</span>
                  </div>
                </div>

                {/* Reaction Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => triggerReaction("fire", "🔥")}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-amber-400 border border-slate-700 transition-all hover:scale-105"
                  >
                    <span>🔥</span>
                    <span>{reactions.fire}</span>
                  </button>

                  <button
                    onClick={() => triggerReaction("heart", "❤️")}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-rose-400 border border-slate-700 transition-all hover:scale-105"
                  >
                    <span>❤️</span>
                    <span>{reactions.heart}</span>
                  </button>

                  <button
                    onClick={() => triggerReaction("clap", "👏")}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-emerald-400 border border-slate-700 transition-all hover:scale-105"
                  >
                    <span>👏</span>
                    <span>{reactions.clap}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Live Chat & Viewer Q&A */}
          <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl h-[560px]">
            {/* Chat Header */}
            <div className="p-4 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-black text-white">
                  {lang === "hi" ? "लाइव दर्शक संवाद (Live Chat)" : "Live Viewer Chat"}
                </h3>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>

            {/* Chat Messages List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 scroll-smooth">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/40 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-amber-400">{msg.user}</span>
                    <span className="text-slate-500">{msg.time}</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="p-3 bg-slate-800/90 border-t border-slate-700/60 space-y-2">
              <input
                type="text"
                placeholder={lang === "hi" ? "आपका नाम (वैकल्पिक)..." : "Your name (optional)..."}
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={lang === "hi" ? "पत्रकार से सवाल पूछें / अपनी राय दें..." : "Ask reporter a question..."}
                  value={newChatText}
                  onChange={(e) => setNewChatText(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
                <button
                  type="submit"
                  className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors shrink-0 shadow"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Section: Live Blogs (Minute-by-minute Text coverage) */}
        {liveBlogs.length > 0 && (
          <div className="pt-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-black text-white">
                  {lang === "hi" ? "लाइव ब्लॉग्स (मिनट-दर-मिनट टेक्स्ट कवरेज)" : "Live Blogs (Minute-by-Minute Text Coverage)"}
                </h3>
              </div>
              <Link
                href="/live-blogs"
                className="text-xs font-bold text-red-500 hover:text-red-400 transition-colors"
              >
                {lang === "hi" ? "सभी लाइव ब्लॉग देखें →" : "View All Live Blogs →"}
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {liveBlogs.map((b) => (
                <Link
                  key={b._id}
                  href={`/live/${b.slug}`}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500 transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      LIVE BLOG
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {b.entries?.length || 0} {lang === "hi" ? "अपडेट्स" : "updates"}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-400 line-clamp-2 transition-colors">
                    {lang === "hi" ? b.titleHi || b.title : b.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Section: Top Video Bulletins */}
        {recentVideos.length > 0 && (
          <div className="pt-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-black text-white">
                  {lang === "hi" ? "विशेष वीडियो बुलेटिन" : "Special Video Bulletins"}
                </h3>
              </div>
              <Link
                href="/videos"
                className="text-xs font-bold text-red-500 hover:text-red-400 transition-colors"
              >
                {lang === "hi" ? "सभी वीडियो देखें →" : "View All Videos →"}
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {recentVideos.map((v) => (
                <Link
                  key={v._id}
                  href="/videos"
                  className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden hover:border-red-500 transition-all group"
                >
                  <div className="aspect-video bg-black relative">
                    <img
                      src={v.thumbnail || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80"}
                      alt={v.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-bold text-white line-clamp-2 group-hover:text-red-400 transition-colors">
                      {lang === "hi" ? v.titleHi || v.title : v.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
