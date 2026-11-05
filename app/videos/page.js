"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Play,
  Clock,
  Loader2,
  ThumbsUp,
  MessageSquare,
  Share2,
  Send,
  CheckCircle2,
  SlidersHorizontal,
  X,
  Search,
  Sparkles,
  ChevronRight,
  Filter,
  Volume2,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useLang } from "@/lib/langContext";

export default function VideosPage() {
  const { lang, t } = useLang();

  const [videos, setVideos] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search & Category Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Social interactions for active video
  const [likesMap, setLikesMap] = useState({});
  const [userLikedMap, setUserLikedMap] = useState({});
  const [commentsMap, setCommentsMap] = useState({
    default: [
      { id: 1, name: "विकास सिंह", text: "शानदार ग्राउंड रिपोर्टिंग!", time: "1 घंटा पहले" },
      { id: 2, name: "पूजा शर्मा", text: "सत्य और निष्पक्ष विश्लेषण।", time: "30 मिनट पहले" },
      { id: 3, name: "अमित कुमार", text: "स्वर मीडिया की निष्पक्ष पत्रकारिता सराहनीय है।", time: "15 मिनट पहले" },
    ],
  });
  const [newComment, setNewComment] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  useEffect(() => {
    apiFetch("/api/videos?limit=30")
      .then((res) => {
        if (res.success && res.videos && res.videos.length > 0) {
          setVideos(res.videos);
          setActiveVideo(res.videos[0]);

          // Init mock/persisted likes
          const initialLikes = {};
          res.videos.forEach((v, idx) => {
            initialLikes[v._id] = 18 + idx * 6;
          });
          setLikesMap(initialLikes);
        }
      })
      .catch((e) => console.error("Failed to load videos:", e))
      .finally(() => setLoading(false));
  }, []);

  // Filtered videos based on search & category
  const filteredVideos = useMemo(() => {
    return videos.filter((vid) => {
      const title = (vid.titleHi || vid.title || "").toLowerCase();
      const matchesSearch = !searchQuery.trim() || title.includes(searchQuery.toLowerCase().trim());
      const catSlug = vid.category?.slug || "";
      const matchesCat = selectedCategory === "all" || catSlug === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [videos, searchQuery, selectedCategory]);

  // Unique categories from video list for filter chips
  const videoCategories = useMemo(() => {
    const map = new Map();
    videos.forEach((v) => {
      if (v.category?.slug) {
        map.set(v.category.slug, v.category.nameHi || v.category.name);
      }
    });
    return Array.from(map.entries());
  }, [videos]);

  const handleLike = (vidId) => {
    const isLiked = userLikedMap[vidId];
    setUserLikedMap((prev) => ({ ...prev, [vidId]: !isLiked }));
    setLikesMap((prev) => ({
      ...prev,
      [vidId]: isLiked ? Math.max(0, (prev[vidId] || 1) - 1) : (prev[vidId] || 0) + 1,
    }));
  };

  const handleAddComment = (vidId) => {
    if (!newComment.trim()) return;
    const author = commentAuthor.trim() || (lang === "hi" ? "दर्शक" : "Viewer");
    const currentComments = commentsMap[vidId] || commentsMap["default"] || [];
    const updated = [
      {
        id: Date.now(),
        name: author,
        text: newComment.trim(),
        time: lang === "hi" ? "अभी" : "Just now",
      },
      ...currentComments,
    ];
    setCommentsMap({ ...commentsMap, [vidId]: updated });
    setNewComment("");
  };

  const handleShare = (vidTitle) => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: vidTitle || "Swar Media Video", url });
    } else {
      navigator.clipboard.writeText(url);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    }
  };

  const selectVideo = (vid) => {
    setActiveVideo(vid);
    setMobileDrawerOpen(false);
  };

  // Convert YouTube link to embed autoplay URL
  const getAutoplayUrl = (url) => {
    if (!url) return "";
    let embedUrl = url;
    if (url.includes("youtube.com/watch?v=")) {
      const vid = url.split("watch?v=")[1]?.split("&")[0];
      embedUrl = `https://www.youtube.com/embed/${vid}`;
    } else if (url.includes("youtu.be/")) {
      const vid = url.split("youtu.be/")[1]?.split("?")[0];
      embedUrl = `https://www.youtube.com/embed/${vid}`;
    }

    if (embedUrl.includes("youtube.com/embed/")) {
      const sep = embedUrl.includes("?") ? "&" : "?";
      // Autoplay=1 with sound ON (mute=0), playsinline=1
      return `${embedUrl}${sep}autoplay=1&mute=0&playsinline=1&enablejsapi=1`;
    }
    return embedUrl;
  };

  const currentVidComments = activeVideo
    ? commentsMap[activeVideo._id] || commentsMap["default"]
    : [];

  // Playlist Items Subcomponent (Reused in Left Panel and Mobile Drawer)
  const PlaylistItems = () => (
    <div className="space-y-2">
      {filteredVideos.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
          कोई वीडियो नहीं मिला
        </div>
      ) : (
        filteredVideos.map((vid, idx) => {
          const isActive = activeVideo?._id === vid._id;
          const displayTitle = lang === "hi" && vid.titleHi ? vid.titleHi : vid.title;

          return (
            <div
              key={vid._id}
              onClick={() => selectVideo(vid)}
              className={`group flex items-start gap-3 p-2.5 rounded-2xl cursor-pointer transition-all border ${
                isActive
                  ? "bg-red-50/90 dark:bg-red-950/40 border-red-500 shadow-sm"
                  : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-red-400 hover:bg-slate-50 dark:hover:bg-slate-800/60"
              }`}
            >
              {/* Thumbnail with duration */}
              <div className="relative w-28 aspect-video rounded-xl overflow-hidden shrink-0 bg-slate-950">
                <img
                  src={
                    vid.thumbnail ||
                    "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=600&q=80"
                  }
                  alt={displayTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div
                  className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                    isActive ? "bg-red-950/50" : "bg-black/30 group-hover:bg-black/10"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md ${
                      isActive ? "bg-red-600 text-white" : "bg-white/80 text-slate-900 group-hover:bg-red-600 group-hover:text-white"
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </div>
                </div>
                <span className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded bg-black/80 text-[9px] font-mono font-bold text-white">
                  {vid.duration || "03:30"}
                </span>
              </div>

              {/* Title & Category Info */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {vid.category?.nameHi || vid.category?.name || "न्यूज़"}
                  </span>
                  {isActive && (
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-red-600 text-white animate-pulse flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      चल रहा है
                    </span>
                  )}
                </div>

                <h4
                  className={`text-xs font-bold line-clamp-2 leading-snug transition-colors ${
                    isActive
                      ? "text-red-600 dark:text-red-400 font-extrabold"
                      : "text-slate-800 dark:text-slate-200 group-hover:text-red-600"
                  }`}
                >
                  {displayTitle}
                </h4>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div className="w-full max-w-full px-2.5 sm:px-4 lg:px-6 xl:px-8 py-4 space-y-4">
      {/* Toast Notification */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>वीडियो लिंक कॉपी हो गया! आप इसे शेयर कर सकते हैं।</span>
        </div>
      )}

      {/* Header Bar with Title & Mobile Filter/Playlist Button */}
      <div className="flex items-center justify-between gap-3 border-b-2 border-red-600 pb-3">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md shrink-0">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>{t("videos")} • Swar Media Video Desk</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-1">
              ग्राउंड रिपोर्ट, डिबेट, और वीडियो बुलेटिन (लाइव व विशेष प्रसारण)
            </p>
          </div>
        </div>

        {/* Mobile View: Filter Icon Button (Replaces Left Panel on Phone) */}
        <div className="lg:hidden flex items-center shrink-0">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/30 transition-transform active:scale-95"
            title="वीडियो प्लेलिस्ट व फ़िल्टर"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden xs:inline">वीडियो फ़िल्टर</span>
            <span className="bg-white/25 px-1.5 py-0.2 rounded-full text-[10px]">
              {filteredVideos.length}
            </span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-3">
          <Loader2 className="w-9 h-9 animate-spin text-red-600" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            वीडियो बुलेटिन लोड हो रहे हैं...
          </p>
        </div>
      ) : (
        /* Main 2-Column Grid: Left Panel (Video Titles) + Center Video (Auto-playing) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* ============================================================== */}
          {/* COLUMN 1: LEFT PANEL - VIDEO TITLES PLAYLIST (STICKY DESKTOP) */}
          {/* ============================================================== */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-4 lg:sticky lg:top-[105px] lg:h-[calc(100vh-125px)] lg:overflow-y-auto no-scrollbar space-y-3 self-start">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
              {/* Left Panel Title */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    वीडियो सूची (Playlist)
                  </h3>
                </div>
                <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600">
                  {filteredVideos.length} वीडियो
                </span>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="शीर्षक खोजें (Search)..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter Chips */}
              {videoCategories.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("all")}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-colors ${
                      selectedCategory === "all"
                        ? "bg-red-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    सभी
                  </button>
                  {videoCategories.map(([slug, name]) => (
                    <button
                      key={slug}
                      type="button"
                      onClick={() => setSelectedCategory(slug)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-colors ${
                        selectedCategory === slug
                          ? "bg-red-600 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}

              {/* Video Items List */}
              <div className="max-h-[calc(100vh-270px)] overflow-y-auto no-scrollbar pr-0.5 space-y-2">
                <PlaylistItems />
              </div>
            </div>
          </aside>

          {/* ============================================================== */}
          {/* COLUMN 2: CENTER AREA - AUTOPLAYING VIDEO PLAYER & DETAILS     */}
          {/* ============================================================== */}
          <main className="lg:col-span-8 xl:col-span-8 space-y-4 min-w-0">
            {activeVideo ? (
              <div className="bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl space-y-0">
                {/* 16:9 Player with Auto-Play */}
                <div className="aspect-video w-full bg-black relative flex items-center justify-center">
                  {activeVideo.videoUrl.startsWith("/uploads/") ||
                  activeVideo.videoUrl.match(/\.(mp4|webm|mov)$/i) ? (
                    <video
                      key={activeVideo.videoUrl}
                      src={activeVideo.videoUrl}
                      controls
                      autoPlay
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <iframe
                      key={activeVideo.videoUrl}
                      src={getAutoplayUrl(activeVideo.videoUrl)}
                      title={activeVideo.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  )}
                </div>

                {/* Active Video Info & Social Interaction Bar */}
                <div className="p-4 sm:p-6 bg-slate-900 border-t border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-black uppercase tracking-wider">
                          {activeVideo.category?.nameHi || activeVideo.category?.name || "विशेष बुलेटिन"}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {activeVideo.duration || "04:15"}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                          <Volume2 className="w-3 h-3" />
                          <span>साउंड ऑन (Sound ON)</span>
                        </span>
                      </div>
                      <h2 className="text-base sm:text-xl font-black text-white leading-snug">
                        {lang === "hi" && activeVideo.titleHi ? activeVideo.titleHi : activeVideo.title}
                      </h2>
                    </div>
                  </div>

                  {/* Social Action Buttons: Like, Comment, Share */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      {/* Like Button */}
                      <button
                        type="button"
                        onClick={() => handleLike(activeVideo._id)}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-transform active:scale-95 cursor-pointer ${
                          userLikedMap[activeVideo._id]
                            ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                        }`}
                      >
                        <ThumbsUp
                          className={`w-4 h-4 ${
                            userLikedMap[activeVideo._id] ? "fill-white" : ""
                          }`}
                        />
                        <span>{likesMap[activeVideo._id] || 24} पसंद</span>
                      </button>

                      {/* Comment Toggle Button */}
                      <button
                        type="button"
                        onClick={() => setShowComments(!showComments)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{currentVidComments.length} टिप्पणियां</span>
                      </button>
                    </div>

                    {/* Share Button */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleShare(activeVideo.title)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-colors shadow-xs cursor-pointer"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>शेयर करें</span>
                      </button>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {showComments && (
                    <div className="pt-4 border-t border-slate-800 space-y-4 animate-in fade-in">
                      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        दर्शक टिप्पणियां ({currentVidComments.length})
                      </h3>

                      {/* Comment Input */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={commentAuthor}
                          onChange={(e) => setCommentAuthor(e.target.value)}
                          placeholder="आपका नाम (वैकल्पिक)..."
                          className="sm:w-48 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
                        />
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddComment(activeVideo._id);
                          }}
                          placeholder="वीडियो पर अपनी राय या टिप्पणी लिखें..."
                          className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddComment(activeVideo._id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>भेजें</span>
                        </button>
                      </div>

                      {/* Comments List */}
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {currentVidComments.map((c) => (
                          <div
                            key={c.id}
                            className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 space-y-1 text-xs"
                          >
                            <div className="flex items-center justify-between text-slate-400 text-[11px]">
                              <span className="font-bold text-amber-400">{c.name}</span>
                              <span>{c.time}</span>
                            </div>
                            <p className="text-slate-200">{c.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </main>
        </div>
      )}

      {/* ============================================================== */}
      {/* MOBILE SLIDE-OVER PLAYLIST & FILTER DRAWER                      */}
      {/* ============================================================== */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer container from Left */}
          <div className="relative w-5/6 max-w-sm h-full bg-white dark:bg-slate-900 shadow-2xl p-4 overflow-y-auto z-10 flex flex-col space-y-3 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-xs">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    वीडियो सूची व फ़िल्टर
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    {filteredVideos.length} वीडियो उपलब्ध
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="शीर्षक खोजें (Search)..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            {videoCategories.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-colors ${
                    selectedCategory === "all"
                      ? "bg-red-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                  }`}
                >
                  सभी
                </button>
                {videoCategories.map(([slug, name]) => (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => setSelectedCategory(slug)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-colors ${
                      selectedCategory === slug
                        ? "bg-red-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}

            {/* Playlist Items */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
              <PlaylistItems />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
