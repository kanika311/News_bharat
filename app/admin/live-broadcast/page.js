"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Tv,
  Radio,
  Video,
  Mic,
  MicOff,
  VideoOff,
  RefreshCw,
  ExternalLink,
  Save,
  Check,
  AlertCircle,
  Eye,
  User,
  MapPin,
  Sparkles,
  Camera,
  Play,
  Square,
  Loader2,
  Zap,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function AdminLiveBroadcastStudioPage() {
  const [streamData, setStreamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");

  // Broadcast Mode: 'camera' | 'url'
  const [broadcastMode, setBroadcastMode] = useState("camera");

  // Camera & Streaming refs and states
  const videoPreviewRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [facingMode, setFacingMode] = useState("user"); // 'user' | 'environment'
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastDuration, setBroadcastDuration] = useState(0);
  const timerRef = useRef(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [titleHi, setTitleHi] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterLocation, setReporterLocation] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [breakingHeadline, setBreakingHeadline] = useState("");
  const [viewers, setViewers] = useState(1540);
  const [isOnAir, setIsOnAir] = useState(true);

  // Load stream state from server
  const loadStreamState = async () => {
    try {
      const res = await apiFetch("/api/live-stream");
      if (res.success && res.liveStream) {
        const s = res.liveStream;
        setStreamData(s);
        setTitle(s.title || "");
        setTitleHi(s.titleHi || "");
        setReporterName(s.reporterName || "");
        setReporterLocation(s.reporterLocation || "");
        setStreamUrl(s.streamUrl || "");
        setBreakingHeadline(s.breakingHeadline || "");
        setViewers(s.viewers || 1540);
        setIsOnAir(s.isLive !== false);
        setBroadcastMode(s.streamType || "camera");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load live stream settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStreamState();
    return () => {
      stopCamera();
    };
  }, []);

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

  // Start Camera
  const startCamera = async (mode = facingMode) => {
    try {
      setError("");
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      const constraints = {
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
      setCameraActive(true);
      return stream;
    } catch (err) {
      console.error("Camera access error:", err);
      setError("कैमरा या माइक्रोफोन का एक्सेस नहीं मिला। कृपया ब्राउज़र में परमिशन दें।");
      setCameraActive(false);
      return null;
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
    setCameraActive(false);
    setIsBroadcasting(false);
  };

  // Toggle Camera Mute
  const toggleMic = () => {
    if (mediaStreamRef.current) {
      const audioTracks = mediaStreamRef.current.getAudioTracks();
      audioTracks.forEach((t) => (t.enabled = !t.enabled));
      setMicMuted(!micMuted);
    }
  };

  // Flip Camera
  const switchCamera = () => {
    const newMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newMode);
    startCamera(newMode);
  };

  // Start Live Broadcasting (Instant without needing to publish)
  const handleStartBroadcast = async () => {
    let stream = mediaStreamRef.current;
    if (!stream || !cameraActive) {
      stream = await startCamera();
    }

    if (!stream) {
      setError("कृपया कैमरा और माइक्रोफोन की अनुमति दें।");
      return;
    }

    try {
      setError("");
      setBroadcastMode("camera");
      setIsBroadcasting(true);
      setIsOnAir(true);

      // Save On Air state to server immediately so site is live right away
      await apiFetch("/api/live-stream", {
        method: "PUT",
        body: JSON.stringify({
          streamType: "camera",
          isLive: true,
          title: title || "लाइव ग्राउंड रिपोर्ट",
          titleHi: titleHi || "लाइव ग्राउंड रिपोर्ट (सीधा प्रसारण)",
          reporterName: reporterName || "वरिष्ठ संवाददाता",
          reporterLocation: reporterLocation || "ग्राउंड जीरो",
          breakingHeadline: breakingHeadline || "बड़ी खबर: स्वर मीडिया रिपोर्टर सीधे ग्राउंड जीरो से लाइव",
        }),
      });

      // Record chunks using MediaRecorder and upload to server
      let recordedChunks = [];
      const options = { mimeType: "video/webm;codecs=vp8,opus" };
      let recorder;
      try {
        recorder = new MediaRecorder(stream, options);
      } catch (e) {
        recorder = new MediaRecorder(stream);
      }

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = async (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunks.push(e.data);
          // Upload chunk to server
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

      // Request data every 3 seconds for near-realtime site updates
      recorder.start(3000);
    } catch (err) {
      console.error(err);
      setError("ब्रॉडकास्ट शुरू करने में त्रुटि: " + err.message);
      setIsBroadcasting(false);
    }
  };

  // Stop Live Broadcast
  const handleStopBroadcast = async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsBroadcasting(false);
    setIsOnAir(false);

    try {
      await apiFetch("/api/live-stream", {
        method: "PUT",
        body: JSON.stringify({ isLive: false }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError("");
    setSaveSuccess(false);

    try {
      const payload = {
        title,
        titleHi,
        reporterName,
        reporterLocation,
        streamType: broadcastMode,
        streamUrl,
        breakingHeadline,
        viewers: Number(viewers) || 1200,
        isLive: isOnAir,
      };

      const res = await apiFetch("/api/live-stream", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "सेटिंग्स सेव करने में विफलता");
    } finally {
      setSaving(false);
    }
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Tv className="w-6 h-6 text-red-600" />
            <span>Live Broadcast Studio (पत्रकार लाइव स्टूडियो)</span>
          </h1>
          <p className="text-xs text-slate-500">
            Real-time live news video streaming: Broadcast directly from your camera/phone or stream feed URL
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/live"
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <ExternalLink className="w-4 h-4 text-red-600" />
            <span>Open Public Live Page (/live)</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>लाइव ब्रॉडकास्ट सेटिंग्स सफलतापूर्वक अपडेट हो गई हैं!</span>
        </div>
      )}

      {/* ⚡ INSTANT 1-CLICK CAMERA GO-LIVE HERO BAR (बिना पब्लिश करे सीधा लाइव) */}
      <div
        className={`p-5 rounded-3xl border transition-all ${
          isBroadcasting
            ? "bg-red-950/40 border-red-600/60 shadow-xl shadow-red-900/20"
            : "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-slate-700/80 shadow-lg"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                  isBroadcasting
                    ? "bg-red-600 text-white animate-pulse"
                    : "bg-emerald-600 text-white"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                {isBroadcasting ? "🔴 YOU ARE LIVE ON SITE" : "⚡ 1-CLICK INSTANT LIVE"}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                (बिना फॉर्म भरे या पब्लिश करे तुरंत लाइव जाएं)
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white">
              {isBroadcasting
                ? "आपका कैमरा और माइक सीधे साइट (/live) पर लाइव प्रसारित हो रहा है!"
                : "सिंपल कैमरा लाइव: बस बटन दबाएं और तुरंत पूरी साइट पर लाइव प्रसारण शुरू हो जाएगा"}
            </h2>
            <p className="text-xs text-slate-400">
              {isBroadcasting
                ? `प्रसारण समय: ${formatTimer(broadcastDuration)} • दर्शक सीधे लाइव पेज (/live) पर देख रहे हैं`
                : "कोई टाइटल, विवरण या पब्लिश बटन दबाने की ज़रूरत नहीं है। एक क्लिक में कैमरा एक्सेस और सीधा ब्रॉडकास्ट।"}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isBroadcasting ? (
              <button
                type="button"
                onClick={handleStopBroadcast}
                className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-black flex items-center gap-2 shadow-xl shadow-rose-600/40 transition-all hover:scale-105 cursor-pointer"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>लाइव बंद करें (STOP LIVE)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartBroadcast}
                className="px-7 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-2xl text-sm font-black flex items-center gap-2.5 shadow-xl shadow-red-600/40 transition-all hover:scale-105 cursor-pointer"
              >
                <Camera className="w-5 h-5" />
                <span>कैमरा चालू करें और तुरंत लाइव जाएं</span>
              </button>
            )}

            <Link
              href="/live"
              target="_blank"
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-red-400" />
              <span>साइट पर देखें</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Broadcast Viewport & Camera Studio (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
            {/* Viewport Header */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isOnAir ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-600 text-white rounded-lg text-xs font-black tracking-wider uppercase shadow animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-white" />
                    ON AIR
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-slate-800 text-slate-400 rounded-lg text-xs font-bold uppercase tracking-wider">
                    OFF AIR
                  </span>
                )}
                {isBroadcasting && (
                  <span className="font-mono text-xs font-black text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-800/80">
                    REC {formatTimer(broadcastDuration)}
                  </span>
                )}
              </div>

              {/* Mode switch */}
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setBroadcastMode("camera")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    broadcastMode === "camera"
                      ? "bg-red-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Camera & Mic
                </button>
                <button
                  onClick={() => setBroadcastMode("url")}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    broadcastMode === "url"
                      ? "bg-red-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Stream Feed URL
                </button>
              </div>
            </div>

            {/* Video Canvas / Preview Container */}
            <div className="aspect-video w-full bg-black relative flex items-center justify-center overflow-hidden">
              {broadcastMode === "camera" ? (
                <>
                  <video
                    ref={videoPreviewRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${!cameraActive && "hidden"}`}
                  />
                  {!cameraActive && (
                    <div className="text-center p-8 space-y-3">
                      <Camera className="w-12 h-12 text-slate-700 mx-auto" />
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-300">कैमरा बंद है</p>
                        <p className="text-xs text-slate-500">
                          ग्राउंड रिपोर्टिंग शुरू करने के लिए नीचे कैमरा चालू करें
                        </p>
                      </div>
                      <button
                        onClick={() => startCamera()}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all border border-slate-700"
                      >
                        कैमरा चालू करें (Turn On Camera)
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* Stream URL Preview */
                streamUrl ? (
                  <iframe
                    src={
                      streamUrl.includes("youtube.com/watch?v=")
                        ? streamUrl.replace("watch?v=", "embed/") + "?autoplay=1&mute=1"
                        : streamUrl
                    }
                    title="Stream Preview"
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div className="text-center p-8 space-y-2 text-slate-500">
                    <Radio className="w-10 h-10 mx-auto text-slate-700" />
                    <p className="text-xs">कृपया दाईं ओर स्ट्रीम यूआरएल दर्ज करें</p>
                  </div>
                )
              )}

              {/* In-Studio Overlays */}
              <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
                <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase rounded border border-white/10">
                  STUDIO PREVIEW
                </span>
              </div>
            </div>

            {/* Camera / Broadcast Hardware Controls */}
            {broadcastMode === "camera" && (
              <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={cameraActive ? stopCamera : () => startCamera()}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      cameraActive
                        ? "bg-slate-800 hover:bg-slate-700 text-white"
                        : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                  >
                    {cameraActive ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                    <span>{cameraActive ? "कैमरा बंद करें" : "कैमरा शुरू करें"}</span>
                  </button>

                  {cameraActive && (
                    <>
                      <button
                        onClick={toggleMic}
                        className={`p-2 rounded-xl text-xs font-bold transition-colors ${
                          micMuted
                            ? "bg-rose-900/60 text-rose-300 border border-rose-700"
                            : "bg-slate-800 text-white hover:bg-slate-700"
                        }`}
                        title={micMuted ? "Unmute Mic" : "Mute Mic"}
                      >
                        {micMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={switchCamera}
                        className="p-2 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-700 transition-colors"
                        title="Flip Camera (Front/Back)"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                {/* BIG GO LIVE BUTTON */}
                <div>
                  {isBroadcasting ? (
                    <button
                      onClick={handleStopBroadcast}
                      className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all hover:scale-105"
                    >
                      <Square className="w-4 h-4 fill-white" />
                      <span>STOP BROADCAST (लाइव बंद करें)</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStartBroadcast}
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all hover:scale-105"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>GO LIVE NOW (लाइव ब्रॉडकास्ट शुरू करें)</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Broadcast Settings & Metadata Form (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <form
            onSubmit={handleSaveSettings}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                ब्रॉडकास्ट जानकारी (Live Details)
              </h2>

              {/* On-air toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  {isOnAir ? "🔴 On Air" : "Off Air"}
                </span>
                <input
                  type="checkbox"
                  checked={isOnAir}
                  onChange={(e) => setIsOnAir(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                />
              </label>
            </div>

            {/* Reporter Name & Bureau */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  संवाददाता का नाम (Reporter Name)
                </label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="उदा. राजेश शर्मा (वरिष्ठ संवाददाता)"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  स्थान / ब्यूरो (Location)
                </label>
                <input
                  type="text"
                  value={reporterLocation}
                  onChange={(e) => setReporterLocation(e.target.value)}
                  placeholder="उदा. संसद परिसर, नई दिल्ली"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Broadcast Title (Hindi) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                लाइव खबर का शीर्षक (Hindi Headline)
              </label>
              <input
                type="text"
                value={titleHi}
                onChange={(e) => setTitleHi(e.target.value)}
                placeholder="उदा. संसद बजट सत्र: विपक्ष की रणनीति पर वरिष्ठ संवाददाता से सीधी बातचीत"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 text-slate-900 dark:text-white font-medium"
              />
            </div>

            {/* Broadcast Title (English) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                English Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ground Report: Live Parliament Budget Coverage"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 text-slate-900 dark:text-white"
              />
            </div>

            {/* Stream URL (for URL mode) */}
            {broadcastMode === "url" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  YouTube Live या Stream Video Feed URL
                </label>
                <input
                  type="url"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 text-slate-900 dark:text-white"
                />
              </div>
            )}

            {/* Breaking News Ticker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                लाइव ब्रेकिंग पट्टी (Live Player Ticker)
              </label>
              <textarea
                rows={2}
                value={breakingHeadline}
                onChange={(e) => setBreakingHeadline(e.target.value)}
                placeholder="उदा. बड़ी खबर: वित्त मंत्री का प्रेस संबोधन शुरू, सीधे संसद परिसर से"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 text-slate-900 dark:text-white"
              />
            </div>

            {/* Viewers Counter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                लाइव दर्शक संख्या (Viewer Counter)
              </label>
              <input
                type="number"
                value={viewers}
                onChange={(e) => setViewers(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 text-slate-900 dark:text-white"
              />
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-red-600/20"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>सेव और अपडेट करें (Save & Update Live)</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
