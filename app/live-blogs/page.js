"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Flame,
  Clock,
  Radio,
  ArrowRight,
  Loader2,
  Sparkles,
  MessageSquare,
  Share2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Search,
  X,
  SlidersHorizontal,
  ThumbsUp,
  CheckCircle2,
  Send,
  RefreshCw,
  Bookmark,
  Check,
  Calendar,
  User,
  ShieldCheck,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useLang } from "@/lib/langContext";
import AdSlot from "@/components/public/AdSlot";

export default function LiveBlogsDirectoryPage() {
  const { lang, t } = useLang();
  const params = useParams();
  const pathSlug = params?.slug;

  const [blogs, setBlogs] = useState([]);
  const [activeBlog, setActiveBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isFullWidth, setIsFullWidth] = useState(false);

  // Social interactions for active blog
  const [likesMap, setLikesMap] = useState({});
  const [userLikedMap, setUserLikedMap] = useState({});
  const [shareToast, setShareToast] = useState(false);
  const [commentsMap, setCommentsMap] = useState({
    default: [
      { id: 1, name: "अनिल मिश्रा", text: "लाइव अपडेट्स बहुत तेज़ और सटीक हैं!", time: "10 मिनट पहले" },
      { id: 2, name: "सुमन रॉय", text: "ग्राउंड कवरेज के लिए बधाई।", time: "5 मिनट पहले" },
      { id: 3, name: "विकास सिंह", text: "हर महत्वपूर्ण घटनाक्रम पर सटीक विश्लेषण।", time: "2 मिनट पहले" },
    ],
  });
  const [commentText, setCommentText] = useState("");
  const [commentName, setCommentName] = useState("");
  const [showComments, setShowComments] = useState(false);

  // Fetch blogs list
  const fetchBlogs = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await apiFetch("/api/live-blogs");
      if (res.success && res.liveBlogs && res.liveBlogs.length > 0) {
        setBlogs(res.liveBlogs);

        // Keep active blog or set the matching/first one
        setActiveBlog((prev) => {
          if (pathSlug) {
            const foundByPath = res.liveBlogs.find((b) => b.slug === pathSlug || b._id === pathSlug);
            if (foundByPath) return foundByPath;
          }
          if (!prev) {
            // Check url param ?slug=
            if (typeof window !== "undefined") {
              const urlParams = new URLSearchParams(window.location.search);
              const slugParam = urlParams.get("slug");
              if (slugParam) {
                const found = res.liveBlogs.find((b) => b.slug === slugParam || b._id === slugParam);
                if (found) return found;
              }
            }
            return res.liveBlogs[0];
          }
          const updated = res.liveBlogs.find((b) => b._id === prev._id);
          return updated || prev;
        });

        // Init mock/saved likes
        const initLikes = {};
        res.liveBlogs.forEach((b, idx) => {
          initLikes[b._id] = 45 + idx * 12;
        });
        setLikesMap((prev) => ({ ...initLikes, ...prev }));
      }
    } catch (e) {
      console.error("Failed to load live blogs:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBlogs();

    // Auto poll live updates every 20 seconds
    const interval = setInterval(() => {
      fetchBlogs(true);
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  // Filtered blogs based on search
  const filteredBlogs = useMemo(() => {
    if (!searchQuery.trim()) return blogs;
    const q = searchQuery.toLowerCase().trim();
    return blogs.filter((b) => {
      const title = (b.titleHi || b.title || "").toLowerCase();
      const cat = (b.category?.nameHi || b.category?.name || "").toLowerCase();
      return title.includes(q) || cat.includes(q);
    });
  }, [blogs, searchQuery]);

  // Prev & Next blog calculation
  const currentIndex = useMemo(() => {
    if (!activeBlog) return -1;
    return filteredBlogs.findIndex((b) => b._id === activeBlog._id);
  }, [activeBlog, filteredBlogs]);

  const prevBlog = currentIndex > 0 ? filteredBlogs[currentIndex - 1] : null;
  const nextBlog = currentIndex >= 0 && currentIndex < filteredBlogs.length - 1 ? filteredBlogs[currentIndex + 1] : null;

  const handleSelectBlog = (blog) => {
    setActiveBlog(blog);
    setMobileDrawerOpen(false);
    // Smooth scroll to content top
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  const handleLike = (blogId) => {
    const isLiked = userLikedMap[blogId];
    setUserLikedMap((prev) => ({ ...prev, [blogId]: !isLiked }));
    setLikesMap((prev) => ({
      ...prev,
      [blogId]: isLiked ? Math.max(0, (prev[blogId] || 1) - 1) : (prev[blogId] || 0) + 1,
    }));
  };

  const handleShare = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share && activeBlog) {
      navigator.share({
        title: activeBlog.titleHi || activeBlog.title || "Swar Media Live Blog",
        url,
      });
    } else {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(url);
      }
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim() || !activeBlog) return;
    const author = commentName.trim() || (lang === "hi" ? "पाठक" : "Reader");
    const currentComments = commentsMap[activeBlog._id] || commentsMap["default"] || [];
    const newC = {
      id: Date.now(),
      name: author,
      text: commentText.trim(),
      time: lang === "hi" ? "अभी" : "Just now",
    };
    setCommentsMap({
      ...commentsMap,
      [activeBlog._id]: [newC, ...currentComments],
    });
    setCommentText("");
  };

  const currentComments = activeBlog
    ? commentsMap[activeBlog._id] || commentsMap["default"]
    : [];

  // Playlist Items Subcomponent (Reused in Left Panel and Mobile Drawer)
  const BlogListItems = () => (
    <div className="space-y-2.5">
      {filteredBlogs.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
          कोई ब्लॉग नहीं मिला
        </div>
      ) : (
        filteredBlogs.map((b) => {
          const isActive = activeBlog?._id === b._id;
          const isLive = b.status === "live";
          const displayTitle = lang === "hi" && b.titleHi ? b.titleHi : b.title;
          const catName = b.category?.nameHi || b.category?.name || "लाइव ब्लॉग";
          const formattedDate = new Date(b.createdAt).toLocaleDateString("hi-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          return (
            <div
              key={b._id}
              onClick={() => handleSelectBlog(b)}
              className={`group p-3.5 rounded-2xl cursor-pointer transition-all border ${
                isActive
                  ? "bg-red-50/80 dark:bg-red-950/40 border-red-500 shadow-xs"
                  : "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-red-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-2xs"
              }`}
            >
              {/* Category & Status */}
              <div className="flex items-center justify-between gap-1.5 mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400">
                  {catName}
                </span>

                {isLive ? (
                  <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-red-600 text-white animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    LIVE
                  </span>
                ) : (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    ENDED
                  </span>
                )}
              </div>

              {/* Title */}
              <h4
                className={`text-xs font-black line-clamp-2 leading-snug transition-colors mb-2 ${
                  isActive
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-800 dark:text-slate-200 group-hover:text-red-600"
                }`}
              >
                {displayTitle}
              </h4>

              {/* Date & Indicator */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{formattedDate}</span>
                </span>
                {isActive && (
                  <div className="flex items-center gap-1 text-red-600 font-extrabold text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                    <span>सक्रिय</span>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div className="w-full max-w-full px-2.5 sm:px-4 lg:px-6 xl:px-8 py-3 space-y-3.5">
      {/* Toast Notification */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>ब्लॉग लिंक कॉपी हो गया! आप इसे साझा कर सकते हैं।</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. UPPER STICKY NAVIGATION BAR (PREV / NEXT / BREADCRUMB / SHARE)*/}
      {/* ============================================================== */}
      <div className="sticky top-[96px] z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xs px-3 sm:px-4 py-2 rounded-2xl flex items-center justify-between gap-3">
        {/* Left Controls: Prev / Next Buttons & Mobile Drawer Trigger */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile Filter / Drawer Trigger ("converted into filter icon") */}
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="lg:hidden flex items-center gap-1 px-2.5 py-1.5 bg-red-600 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95"
            title="ब्लॉग्स सूची खोलें"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">ब्लॉग्स</span>
            <span className="bg-white/20 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {filteredBlogs.length}
            </span>
          </button>

          {/* Prev Button */}
          <button
            type="button"
            disabled={!prevBlog}
            onClick={() => prevBlog && handleSelectBlog(prevBlog)}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title={prevBlog ? prevBlog.titleHi || prevBlog.title : "पहला ब्लॉग"}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Next Button */}
          <button
            type="button"
            disabled={!nextBlog}
            onClick={() => nextBlog && handleSelectBlog(nextBlog)}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title={nextBlog ? nextBlog.titleHi || nextBlog.title : "अंतिम ब्लॉग"}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center: Breadcrumbs (Home > Blogs > Active Blog) */}
        <div className="min-w-0 flex-1 hidden md:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-red-600 transition-colors shrink-0">
            {t("home") || "होम"}
          </Link>
          <span className="text-slate-300 dark:text-slate-600">&gt;</span>
          <span className="hover:text-red-600 transition-colors shrink-0 font-medium">
            ब्लॉग्स
          </span>
          <span className="text-slate-300 dark:text-slate-600">&gt;</span>
          <span className="truncate font-bold text-slate-800 dark:text-slate-200">
            {activeBlog ? (lang === "hi" && activeBlog.titleHi ? activeBlog.titleHi : activeBlog.title) : "लोड हो रहा है..."}
          </span>
        </div>

        {/* Right Controls: Full Window Toggle & Share Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsFullWidth(!isFullWidth)}
            className={`hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isFullWidth
                ? "bg-red-50 text-red-600 border-red-300 dark:bg-red-950/40 dark:border-red-800"
                : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
            }`}
            title="विस्तृत व्यू (Full Window)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Full Window</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
            title="ब्लॉग शेयर करें"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-3">
          <Loader2 className="w-9 h-9 animate-spin text-red-600" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            लाइव ब्लॉग्स लोड हो रहे हैं...
          </p>
        </div>
      ) : (
        /* ============================================================== */
        /* 2. MAIN 3-PANEL LAYOUT (LEFT BLOGS, CENTER CONTENT, RIGHT ADS)  */
        /* ============================================================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* ========================================================== */}
          {/* COLUMN 1: LEFT PANEL - BLOG TITLES LIST (STICKY ON DESKTOP) */}
          {/* ========================================================== */}
          {!isFullWidth && (
            <aside className="hidden lg:block lg:col-span-3 xl:col-span-3 lg:sticky lg:top-[160px] lg:h-[calc(100vh-175px)] lg:overflow-y-auto no-scrollbar space-y-3 self-start">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
                {/* Left Panel Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Blogs
                    </h3>
                  </div>
                  <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600">
                    {filteredBlogs.length}
                  </span>
                </div>

                {/* Search Box */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search article titles..."
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

                {/* Scrollable Blog Titles List */}
                <div className="max-h-[calc(100vh-290px)] overflow-y-auto no-scrollbar pr-0.5 space-y-2">
                  <BlogListItems />
                </div>
              </div>
            </aside>
          )}

          {/* ========================================================== */}
          {/* COLUMN 2: CENTER AREA - ACTIVE BLOG CONTENT & TIMELINE     */}
          {/* ========================================================== */}
          <main
            className={`${
              isFullWidth
                ? "lg:col-span-9 xl:col-span-9"
                : "lg:col-span-6 xl:col-span-6"
            } min-w-0 space-y-4`}
          >
            {activeBlog ? (
              <div className="space-y-4">
                {/* 1. Main Cover & Headline Card */}
                <article className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                  {/* Cover Image / Banner */}
                  {activeBlog.coverImage && (
                    <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full bg-slate-950 overflow-hidden">
                      <img
                        src={activeBlog.coverImage}
                        alt={activeBlog.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Status Badge on Cover */}
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        {activeBlog.status === "live" ? (
                          <span className="flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white rounded-full text-xs font-black uppercase tracking-wider shadow-md animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-white" />
                            LIVE UPDATES
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-slate-800/90 text-slate-200 rounded-full text-xs font-bold uppercase">
                            ENDED
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Blog Details Info */}
                  <div className="p-4 sm:p-6 space-y-4">
                    <div className="space-y-2">
                      <span className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40">
                        {activeBlog.category?.nameHi || activeBlog.category?.name || "विशेष कवरेज"}
                      </span>

                      <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                        {lang === "hi" && activeBlog.titleHi ? activeBlog.titleHi : activeBlog.title}
                      </h1>
                    </div>

                    {/* Metadata Row: Date, Author, Read time */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-500 dark:text-slate-400 py-3 border-y border-slate-100 dark:border-slate-800">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(activeBlog.createdAt).toLocaleDateString("hi-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </span>

                      <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                        <User className="w-3.5 h-3.5 text-red-600" />
                        <span>Rajesh Sharma (प्रधान संपादक)</span>
                      </span>

                      <span className="flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>3 min read</span>
                      </span>

                      {/* Manual Refresh Button */}
                      <button
                        type="button"
                        onClick={() => fetchBlogs(true)}
                        disabled={refreshing}
                        className="ml-auto flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 transition-colors"
                        title="ताज़ा अपडेट्स रिफ्रेश करें"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                        <span>{refreshing ? "अपडेट हो रहा है..." : "रिफ्रेश"}</span>
                      </button>
                    </div>

                    {/* Reader Actions: Like, Comment, Total updates */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        {/* Like Button */}
                        <button
                          type="button"
                          onClick={() => handleLike(activeBlog._id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            userLikedMap[activeBlog._id]
                              ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-50 hover:text-red-600"
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{likesMap[activeBlog._id] || 45} पसंद</span>
                        </button>

                        {/* Comments Toggle */}
                        <button
                          type="button"
                          onClick={() => setShowComments(!showComments)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{currentComments.length} टिप्पणियां</span>
                        </button>
                      </div>

                      <span className="text-xs font-bold text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-xl">
                        {activeBlog.entries?.length || 0} ताज़ा अपडेट्स
                      </span>
                    </div>

                    {/* Comments Dropdown */}
                    {showComments && (
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-in fade-in">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                          पाठक संवाद व प्रतिक्रियाएं
                        </h4>

                        {/* Comment Input */}
                        <form onSubmit={handleAddComment} className="space-y-2">
                          <input
                            type="text"
                            value={commentName}
                            onChange={(e) => setCommentName(e.target.value)}
                            placeholder="आपका नाम (वैकल्पिक)..."
                            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
                          />
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder="इस लाइव कवरेज पर अपनी राय लिखें..."
                              className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
                            />
                            <button
                              type="submit"
                              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>भेजें</span>
                            </button>
                          </div>
                        </form>

                        {/* Comments List */}
                        <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar pr-1 pt-1">
                          {currentComments.map((c) => (
                            <div
                              key={c.id}
                              className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1 text-xs"
                            >
                              <div className="flex items-center justify-between text-slate-400 text-[10px]">
                                <span className="font-bold text-slate-900 dark:text-amber-400">{c.name}</span>
                                <span>{c.time}</span>
                              </div>
                              <p className="text-slate-700 dark:text-slate-300">{c.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </article>

                {/* 2. Live Updates Timeline (Min-by-Min updates) */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        मिनट-दर-मिनट घटनाक्रम (Live Timeline)
                      </h3>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">
                      Auto-Refresh On
                    </span>
                  </div>

                  {activeBlog.entries && activeBlog.entries.length > 0 ? (
                    <div className="relative border-l-2 border-red-500/40 ml-3.5 sm:ml-4 space-y-6 pl-4 sm:pl-6 pt-1">
                      {activeBlog.entries.map((entry, idx) => (
                        <div key={entry._id || idx} className="relative space-y-2">
                          {/* Timeline dot */}
                          <div className="absolute -left-[23px] sm:-left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-white dark:bg-slate-900 border-2 border-red-600 flex items-center justify-center shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                          </div>

                          {/* Time & Author */}
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-red-600 dark:text-red-400 font-bold font-mono">
                              {new Date(entry.timestamp).toLocaleTimeString("hi-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <span>•</span>
                            <span className="text-slate-600 dark:text-slate-300 font-semibold">
                              {entry.authorName || "स्वर मीडिया डेस्क"}
                            </span>
                          </div>

                          {/* Update Title */}
                          <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug">
                            {entry.title}
                          </h4>

                          {/* Update Content */}
                          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                            {entry.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400">
                      इस लाइव ब्लॉग में अभी कोई नया अपडेट नहीं है। बने रहें।
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </main>

          {/* ========================================================== */}
          {/* COLUMN 3: RIGHT PANEL - SPONSORED ADS (STICKY ON DESKTOP)  */}
          {/* ========================================================== */}
          {!isFullWidth && (
            <aside className="lg:col-span-3 xl:col-span-3 lg:sticky lg:top-[160px] lg:h-[calc(100vh-175px)] lg:overflow-y-auto no-scrollbar space-y-4 self-start">
              {/* Sponsored Ad Slot (Matches Yogsathi ref image with premium sponsor ad) */}
              <AdSlot slot="sidebar" />

              {/* Trending Topics / Quick Links Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-black text-slate-900 dark:text-white">
                    स्वर मीडिया आचार संहिता
                  </h3>
                </div>
                <ul className="space-y-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>प्रत्येक लाइव अपडेट की तथ्यात्मक पुष्टि के बाद ही प्रसारण।</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>निष्पक्ष, निर्भीक और सटीक ग्राउंड रिपोर्टिंग।</span>
                  </li>
                </ul>
              </div>
            </aside>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. MOBILE SLIDE-OVER DRAWER (FOR BLOGS LIST / TITLES)          */}
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
                    ब्लॉग्स सूची
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    {filteredBlogs.length} लाइव ब्लॉग्स उपलब्ध
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300"
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
                placeholder="Search article titles..."
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

            {/* Drawer Blog Items List */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2.5 pr-0.5">
              <BlogListItems />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
