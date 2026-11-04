"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Tv,
  Radio,
  Eye,
  Share2,
  Heart,
  MessageSquare,
  Sparkles,
  MapPin,
  User,
  Clock,
  Play,
  Check,
  Send,
  Loader2,
  ExternalLink,
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

  // Live interaction state (Real DB data, default 0)
  const [reactions, setReactions] = useState({ heart: 0, fire: 0, clap: 0, shock: 0 });
  const [activeReactionAnim, setActiveReactionAnim] = useState([]);
  const [copied, setCopied] = useState(false);

  // Live chat messages (Real DB data, default empty)
  const [chatMessages, setChatMessages] = useState([]);
  const [newChatText, setNewChatText] = useState("");
  const [senderName, setSenderName] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const chatBottomRef = useRef(null);

  const fetchLiveStream = async () => {
    try {
      const res = await apiFetch("/api/live-stream");
      if (res.success && res.liveStream) {
        const s = res.liveStream;
        setStream(s);
        if (s.reactions) {
          setReactions(s.reactions);
        }
        if (Array.isArray(s.chatMessages)) {
          setChatMessages(s.chatMessages);
        }
      }
    } catch (e) {
      console.error("fetchLiveStream error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveStream();

    // Poll live stream updates every 5 seconds so viewers get latest broadcast video & comments
    const interval = setInterval(() => {
      fetchLiveStream();
    }, 5000);

    // Fetch related live blogs & videos
    apiFetch("/api/live-blogs")
      .then((r) => r.success && setLiveBlogs(r.liveBlogs?.slice(0, 3) || []))
      .catch((e) => console.error(e));

    apiFetch("/api/videos?limit=4")
      .then((r) => r.success && setRecentVideos(r.videos || []))
      .catch((e) => console.error(e));

    return () => {
      clearInterval(interval);
    };
  }, []);

  const triggerReaction = async (type, emoji) => {
    // Optimistic UI increment
    setReactions((prev) => ({ ...prev, [type]: (prev[type] || 0) + 1 }));
    const id = Date.now() + Math.random();
    setActiveReactionAnim((prev) => [...prev, { id, emoji, x: Math.random() * 80 + 10 }]);
    setTimeout(() => {
      setActiveReactionAnim((prev) => prev.filter((item) => item.id !== id));
    }, 1800);

    try {
      const res = await apiFetch("/api/live-stream/reaction", {
        method: "POST",
        body: JSON.stringify({ type }),
      });
      if (res.success && res.reactions) {
        setReactions(res.reactions);
      }
    } catch (err) {
      console.error("Reaction error:", err);
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!newChatText.trim() || sendingChat) return;

    const currentText = newChatText.trim();
    const currentSender = user?.name || senderName.trim() || (lang === "hi" ? "दर्शक" : "Viewer");

    setSendingChat(true);
    setNewChatText("");

    // Optimistic message append
    const tempMsg = {
      _id: `temp_${Date.now()}`,
      user: currentSender,
      text: currentText,
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      createdAt: new Date(),
    };
    setChatMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await apiFetch("/api/live-stream/chat", {
        method: "POST",
        body: JSON.stringify({ text: currentText, user: currentSender }),
      });
      if (res.success && Array.isArray(res.chatMessages)) {
        setChatMessages(res.chatMessages);
      }
    } catch (err) {
      console.error("Send chat error:", err);
    } finally {
      setSendingChat(false);
      if (chatBottomRef.current) {
        chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
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
    <div className="bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen py-6 sm:py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 space-y-6">
        {/* Top Channel Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-red-600 text-white shadow-md shadow-red-600/30">
              <Tv className="w-5 h-5" />
              {isLive && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full animate-ping" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {lang === "hi" ? "स्वर मीडिया 24x7 सीधा प्रसारण" : "Swar Media 24x7 Live Stream"}
                </h1>
                {isLive ? (
                  <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black tracking-widest uppercase animate-pulse">
                    LIVE
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold tracking-widest uppercase">
                    OFFLINE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === "hi"
                  ? "ग्राउंड जीरो से संवाददाताओं की लाइव रिपोर्टिंग एवं ब्रेकिंग डिबेट"
                  : "Live field reporter dispatches, breaking debate, and continuous news streaming"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* If user is an Admin/Reporter, give direct link to live broadcast studio */}
            {canBroadcast && (
              <Link
                href="/swar-media-admin/live-broadcast"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs"
                title="एडमिन लाइव ब्रॉडकास्ट स्टूडियो"
              >
                <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                <span>{lang === "hi" ? "एडमिन स्टूडियो" : "Admin Studio"}</span>
              </Link>
            )}

            {/* Real Viewers Counter */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Eye className="w-4 h-4 text-red-500 animate-pulse" />
              <span>
                {Number(stream?.viewers || 0).toLocaleString("en-IN")}{" "}
                <span className="text-slate-500 dark:text-slate-400 font-normal">
                  {lang === "hi" ? "लाइव दर्शक" : "Watching"}
                </span>
              </span>
            </div>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? (lang === "hi" ? "लिंक कॉपी!" : "Copied!") : (lang === "hi" ? "शेयर" : "Share")}</span>
            </button>
          </div>
        </div>

        {/* Main Broadcast Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Main Video Screen (Viewer Mode) */}
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

              {/* VIDEO PLAYER VIEWPORT */}
              {isLive ? (
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
                    /* Journalist Camera Standby / Live sync */
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
                          {stream?.reporterLocation || "ग्राउंड जीरो"} से लाइव कैमरा व ऑडियो स्ट्रीम हो रहा है।
                        </p>
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
                    <p className="text-xs text-slate-500">एडमिन स्टूडियो से प्रसारण शुरू होने का इंतज़ार करें।</p>
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

            {/* Broadcast Details & Real Reactions */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    {lang === "hi" ? stream?.titleHi || stream?.title : stream?.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 text-red-600 font-semibold">
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

                {/* Real Reaction Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => triggerReaction("fire", "🔥")}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 border border-slate-200 dark:border-slate-700 transition-all hover:scale-105 cursor-pointer"
                    title="आग / फायर"
                  >
                    <span>🔥</span>
                    <span>{reactions.fire || 0}</span>
                  </button>

                  <button
                    onClick={() => triggerReaction("heart", "❤️")}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-slate-700 transition-all hover:scale-105 cursor-pointer"
                    title="पसंद / लाइक"
                  >
                    <span>❤️</span>
                    <span>{reactions.heart || 0}</span>
                  </button>

                  <button
                    onClick={() => triggerReaction("clap", "👏")}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 transition-all hover:scale-105 cursor-pointer"
                    title="सराहना / ताली"
                  >
                    <span>👏</span>
                    <span>{reactions.clap || 0}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Real Live Chat & Viewer Q&A */}
          <div className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs h-[560px]">
            {/* Chat Header */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-red-600" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  {lang === "hi" ? "लाइव दर्शक संवाद (Live Chat)" : "Live Viewer Chat"}
                </h3>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>

            {/* Chat Messages List */}
            {chatMessages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                  <MessageSquare className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {lang === "hi" ? "अभी तक कोई टिप्पणी नहीं है" : "No live comments yet"}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                  {lang === "hi"
                    ? "नीचे अपनी राय लिखें या रिपोर्टर से सवाल पूछें।"
                    : "Be the first to share your thoughts or ask a question."}
                </p>
              </div>
            ) : (
              <div className="flex-1 p-4 overflow-y-auto space-y-3 scroll-smooth">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={msg._id || msg.id || idx}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/40 space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-amber-600 dark:text-amber-400">{msg.user}</span>
                      <span className="text-slate-400">{msg.time || "अभी"}</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">{msg.text}</p>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>
            )}

            {/* Real Chat Input */}
            <form onSubmit={handleSendChat} className="p-3 bg-slate-50 dark:bg-slate-800/90 border-t border-slate-200 dark:border-slate-700/60 space-y-2">
              {user?.name ? (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-200/60 dark:bg-slate-700/60 rounded-md text-[11px] text-slate-600 dark:text-slate-300">
                  <User className="w-3 h-3 text-red-500" />
                  <span>{user.name}</span>
                </div>
              ) : (
                <input
                  type="text"
                  placeholder={lang === "hi" ? "आपका नाम (वैकल्पिक)..." : "Your name (optional)..."}
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
                />
              )}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={lang === "hi" ? "पत्रकार से सवाल पूछें / अपनी राय दें..." : "Ask reporter a question..."}
                  value={newChatText}
                  onChange={(e) => setNewChatText(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
                />
                <button
                  type="submit"
                  disabled={sendingChat || !newChatText.trim()}
                  className="p-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl transition-colors shrink-0 shadow-sm cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Section: Top Video Bulletins */}
        {recentVideos.length > 0 && (
          <div className="pt-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {lang === "hi" ? "विशेष वीडियो बुलेटिन" : "Special Video Bulletins"}
                </h3>
              </div>
              <Link
                href="/videos"
                className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
              >
                {lang === "hi" ? "सभी वीडियो देखें →" : "View All Videos →"}
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {recentVideos.map((v) => (
                <Link
                  key={v._id}
                  href="/videos"
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-red-500 transition-all shadow-xs group"
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
                    <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-red-600 transition-colors">
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
