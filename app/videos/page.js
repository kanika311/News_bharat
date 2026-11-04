"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  Clock,
  Eye,
  Loader2,
  ThumbsUp,
  MessageSquare,
  Share2,
  Send,
  CheckCircle2,
  Heart,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useLang } from "@/lib/langContext";

export default function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const { lang, t } = useLang();

  // Social interactions for active video
  const [likesMap, setLikesMap] = useState({});
  const [userLikedMap, setUserLikedMap] = useState({});
  const [commentsMap, setCommentsMap] = useState({
    default: [
      { id: 1, name: "विकास सिंह", text: "शानदार ग्राउंड रिपोर्टिंग!", time: "1 घंटा पहले" },
      { id: 2, name: "पूजा शर्मा", text: "सत्य और निष्पक्ष विश्लेषण।", time: "30 मिनट पहले" },
    ],
  });
  const [newComment, setNewComment] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  useEffect(() => {
    apiFetch("/api/videos?limit=24")
      .then((res) => {
        if (res.success && res.videos) {
          setVideos(res.videos);
          if (res.videos.length > 0) {
            setActiveVideo(res.videos[0]);
            // Init default likes
            const initialLikes = {};
            res.videos.forEach((v, idx) => {
              initialLikes[v._id] = 24 + idx * 7;
            });
            setLikesMap(initialLikes);
          }
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleLike = (vidId) => {
    const isLiked = userLikedMap[vidId];
    setUserLikedMap({ ...userLikedMap, [vidId]: !isLiked });
    setLikesMap({
      ...likesMap,
      [vidId]: isLiked ? (likesMap[vidId] || 1) - 1 : (likesMap[vidId] || 0) + 1,
    });
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

  const currentVidComments = activeVideo
    ? commentsMap[activeVideo._id] || commentsMap["default"]
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Toast Notification */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>वीडियो लिंक कॉपी हो गया! आप इसे शेयर कर सकते हैं।</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex items-center gap-3 border-b-2 border-red-600 pb-3">
        <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center">
          <Play className="w-5 h-5 fill-white ml-0.5" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t("videos")} • Swar Media Video Desk
          </h1>
          <p className="text-xs text-slate-500">
            Exclusive ground reports, prime time debates, and video bulletins
          </p>
        </div>
      </div>

      {/* Featured Active Player */}
      {activeVideo && (
        <div className="bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl space-y-0">
          <div className="aspect-video w-full bg-black relative flex items-center justify-center">
            {activeVideo.videoUrl.startsWith("/uploads/") ||
            activeVideo.videoUrl.match(/\.(mp4|webm|mov)$/i) ? (
              <video
                key={activeVideo.videoUrl}
                src={activeVideo.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            ) : (
              <iframe
                key={activeVideo.videoUrl}
                src={
                  activeVideo.videoUrl.includes("youtube.com/watch?v=")
                    ? activeVideo.videoUrl.replace("watch?v=", "embed/")
                    : activeVideo.videoUrl.includes("youtu.be/")
                    ? activeVideo.videoUrl.replace("youtu.be/", "www.youtube.com/embed/")
                    : activeVideo.videoUrl
                }
                title={activeVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>

          {/* Active Video Info & Social Interaction Bar */}
          <div className="p-4 sm:p-6 bg-slate-900 border-t border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider">
                  {activeVideo.category?.name || "Now Playing"}
                </span>
                <h2 className="text-base sm:text-xl font-black text-white mt-1.5">
                  {lang === "hi" && activeVideo.titleHi ? activeVideo.titleHi : activeVideo.title}
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-slate-800 px-3 py-1 rounded-xl shrink-0 self-start sm:self-center">
                Duration: {activeVideo.duration}
              </span>
            </div>

            {/* Social Action Buttons: Like, Comment, Share */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                {/* Like Button */}
                <button
                  type="button"
                  onClick={() => handleLike(activeVideo._id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-transform active:scale-95 ${
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
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors"
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
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-colors shadow-xs"
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
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shrink-0"
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
      )}

      {loading ? (
        <div className="p-16 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-red-600" />
          Loading video feeds...
        </div>
      ) : (
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
            {lang === "hi" ? "सभी वीडियो बुलेटिन" : "All Video Bulletins"} ({videos.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {videos.map((vid) => (
              <div
                key={vid._id}
                onClick={() => {
                  setActiveVideo(vid);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`group cursor-pointer bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border transition-all flex flex-col justify-between ${
                  activeVideo?._id === vid._id
                    ? "border-red-600 ring-2 ring-red-600/30 shadow-lg"
                    : "border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-xl hover:border-red-500"
                }`}
              >
                <div className="relative aspect-video bg-black overflow-hidden">
                  <img
                    src={vid.thumbnail || "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=600&q=80"}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                    <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-mono font-bold text-white">
                    {vid.duration}
                  </span>
                </div>
                <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-red-600 transition-colors">
                    {lang === "hi" && vid.titleHi ? vid.titleHi : vid.title}
                  </h3>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>{vid.category?.name || "News"}</span>
                    <span className="flex items-center gap-1 text-red-500 font-bold">
                      <ThumbsUp className="w-3 h-3" />
                      {likesMap[vid._id] || 24}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
