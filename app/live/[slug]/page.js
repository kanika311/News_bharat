"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Flame,
  Clock,
  RefreshCw,
  Loader2,
  ThumbsUp,
  MessageSquare,
  Share2,
  Send,
  CheckCircle2,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useLang } from "@/lib/langContext";

export default function LiveBlogDetailPage() {
  const params = useParams();
  const slug = params?.slug;
  const { lang, t } = useLang();

  const [liveBlog, setLiveBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Likes & Social Interactions
  const [likesCount, setLikesCount] = useState(38);
  const [isLiked, setIsLiked] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [comments, setComments] = useState([
    { id: 1, name: "अनिल मिश्रा", text: "लाइव अपडेट्स बहुत तेज़ और सटीक हैं!", time: "10 मिनट पहले" },
    { id: 2, name: "सुमन रॉय", text: "ग्राउंड कवरेज के लिए बधाई।", time: "5 मिनट पहले" },
  ]);
  const [commentText, setCommentText] = useState("");
  const [commentName, setCommentName] = useState("");
  const [showComments, setShowComments] = useState(false);

  const fetchLiveBlog = async () => {
    try {
      const res = await apiFetch(`/api/live-blogs/${slug}`);
      if (res.success && res.liveBlog) {
        setLiveBlog(res.liveBlog);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!slug) return;
    fetchLiveBlog();

    // Auto poll live updates every 15 seconds
    const interval = setInterval(() => {
      fetchLiveBlog();
    }, 15000);

    return () => clearInterval(interval);
  }, [slug]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchLiveBlog();
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: liveBlog?.title || "Swar Media Live Blog",
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const author = commentName.trim() || (lang === "hi" ? "पाठक" : "Reader");
    const newC = {
      id: Date.now(),
      name: author,
      text: commentText.trim(),
      time: lang === "hi" ? "अभी" : "Just now",
    };
    setComments([newC, ...comments]);
    setCommentText("");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  if (!liveBlog) return <div className="p-16 text-center">Live blog not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Toast Notification */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>लाइव ब्लॉग लिंक कॉपी हो गया! आप इसे शेयर कर सकते हैं।</span>
        </div>
      )}

      {/* Live Blog Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-red-700 via-red-800 to-slate-900 rounded-3xl text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white font-black text-xs uppercase tracking-wider">
            {liveBlog.status === "live" && <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />}
            <span>{liveBlog.status === "live" ? "LIVE COVERAGE" : "COVERAGE CONCLUDED"}</span>
          </span>

          <button
            onClick={handleManualRefresh}
            className="flex items-center gap-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-1 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
          {lang === "hi" && liveBlog.titleHi ? liveBlog.titleHi : liveBlog.title}
        </h1>
        <p className="text-xs text-red-100">
          Auto-updating timeline • Real-time minute-by-minute reporting from Swar Media editorial desk
        </p>

        {/* Social Action Bar (Like, Comment, Share) */}
        <div className="flex items-center justify-between pt-3 border-t border-white/20 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-transform active:scale-95 ${
                isLiked
                  ? "bg-white text-red-600 shadow-md"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${isLiked ? "fill-red-600" : ""}`} />
              <span>{likesCount} पसंद</span>
            </button>

            <button
              type="button"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{comments.length} टिप्पणियां</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold transition-colors shadow-sm cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>शेयर करें</span>
          </button>
        </div>
      </div>

      {/* Interactive Comments Drawer */}
      {showComments && (
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 animate-in fade-in">
          <h3 className="text-sm font-black text-slate-900 dark:text-white">
            लाइव दर्शक संवाद एवं टिप्पणियां ({comments.length})
          </h3>

          <form onSubmit={handleAddComment} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={commentName}
              onChange={(e) => setCommentName(e.target.value)}
              placeholder="आपका नाम..."
              className="sm:w-48 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
            />
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="लाइव ब्लॉग पर अपनी प्रतिक्रिया लिखें..."
              className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>पोस्ट करें</span>
            </button>
          </form>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 max-h-60 overflow-y-auto">
            {comments.map((c) => (
              <div
                key={c.id}
                className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1 text-xs"
              >
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span className="font-bold text-slate-900 dark:text-white">{c.name}</span>
                  <span>{c.time}</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline Stream */}
      <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {!liveBlog.entries || liveBlog.entries.length === 0 ? (
          <p className="text-xs text-slate-400 italic pl-10">No live updates posted yet.</p>
        ) : (
          liveBlog.entries.map((entry, idx) => (
            <div key={idx} className="relative pl-10 space-y-2">
              <div className="absolute left-2.5 top-2 w-3.5 h-3.5 rounded-full bg-red-600 border-4 border-white dark:border-slate-900 shadow-md shrink-0" />
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5 text-red-500" />
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span>•</span>
                <span>{entry.authorName}</span>
              </div>

              <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{entry.title}</h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {entry.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
