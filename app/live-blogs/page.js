"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Flame, Clock, Radio, ArrowRight, Loader2, Sparkles, MessageSquare } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useLang } from "@/lib/langContext";

export default function LiveBlogsDirectoryPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { lang } = useLang();

  useEffect(() => {
    apiFetch("/api/live-blogs")
      .then((res) => {
        if (res.success && res.liveBlogs) {
          setBlogs(res.liveBlogs);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-red-600 to-rose-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black tracking-wider uppercase">
            <Flame className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>{lang === "hi" ? "रियल-टाइम कवरेज" : "MINUTE-BY-MINUTE REPORTING"}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            {lang === "hi" ? "लाइव ब्लॉग्स • पल-पल की ताजा खबरें" : "Live Blogs • Real-time Minute-by-Minute Updates"}
          </h1>
          <p className="text-sm sm:text-base text-white/90 leading-relaxed">
            {lang === "hi"
              ? "देश, राजनीति, बजट, खेल और विशेष आयोजनों की मिनट-दर-मिनट लाइव टेक्स्ट कवरेज स्वर मीडिया एडिटोरियल डेस्क द्वारा।"
              : "Comprehensive real-time reporting, key statements, and instant news flashes from Swar Media's dedicated reporting desk."}
          </p>
        </div>
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-3" />
          <p className="text-xs text-slate-500 font-semibold">लोड हो रहा है...</p>
        </div>
      ) : blogs.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <Flame className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300">
            {lang === "hi" ? "वर्तमान में कोई सक्रिय लाइव ब्लॉग नहीं है" : "No live blogs currently active"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {lang === "hi" ? "अगले बड़े इवेंट की कवरेज जल्द शुरू होगी।" : "Coverage for upcoming major events will begin shortly."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((b) => {
            const isLive = b.status === "live";
            const latestEntry = b.entries && b.entries.length > 0 ? b.entries[b.entries.length - 1] : null;

            return (
              <Link
                key={b._id}
                href={`/live/${b.slug}`}
                className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-red-500 hover:shadow-xl transition-all overflow-hidden"
              >
                {/* Header Strip with Cover or Gradient */}
                <div className="h-44 bg-slate-950 relative overflow-hidden">
                  {b.coverImage ? (
                    <img
                      src={b.coverImage}
                      alt={b.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-red-950 flex items-center justify-center">
                      <Flame className="w-12 h-12 text-red-500/40" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    {isLive ? (
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white rounded-full text-[11px] font-black tracking-wider uppercase shadow-md animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        LIVE
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-slate-800/90 text-slate-300 rounded-full text-[11px] font-bold uppercase">
                        ENDED
                      </span>
                    )}

                    <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white rounded-full text-[11px] font-bold flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-amber-400" />
                      <span>{b.entries?.length || 0} {lang === "hi" ? "अपडेट्स" : "updates"}</span>
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-red-600 transition-colors line-clamp-2">
                      {lang === "hi" ? b.titleHi || b.title : b.title}
                    </h2>

                    {latestEntry && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-red-600 dark:text-red-400">
                          <span>{latestEntry.authorName || "Swar Media"}</span>
                          <span>
                            {new Date(latestEntry.timestamp).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
                          {latestEntry.title}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-red-600 dark:text-red-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span>{lang === "hi" ? "लाइव कवरेज पढ़ें" : "Read Live Coverage"}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
