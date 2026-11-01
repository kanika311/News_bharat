"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Flame, Clock, RefreshCw, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useLang } from "@/lib/langContext";

export default function LiveBlogDetailPage() {
  const params = useParams();
  const slug = params?.slug;
  const { lang, t } = useLang();

  const [liveBlog, setLiveBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      {/* Live Blog Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-red-700 via-red-800 to-slate-900 rounded-3xl text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white font-black text-xs uppercase tracking-wider">
            {liveBlog.status === "live" && <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />}
            <span>{liveBlog.status === "live" ? "LIVE COVERAGE" : "COVERAGE CONCLUDED"}</span>
          </span>

          <button
            onClick={handleManualRefresh}
            className="flex items-center gap-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-1 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
          {lang === "hi" && liveBlog.titleHi ? liveBlog.titleHi : liveBlog.title}
        </h1>
        <p className="text-xs text-red-100">
          Auto-updating timeline • Real-time minute-by-minute reporting from Bharat Varta editorial desk
        </p>
      </div>

      {/* Timeline Stream */}
      <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {(!liveBlog.entries || liveBlog.entries.length === 0) ? (
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
