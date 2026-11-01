"use client";

import React, { useState, useEffect } from "react";
import { Play, Clock, Eye, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useLang } from "@/lib/langContext";

export default function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const { lang, t } = useLang();

  useEffect(() => {
    apiFetch("/api/videos?limit=24")
      .then((res) => {
        if (res.success && res.videos) {
          setVideos(res.videos);
          if (res.videos.length > 0) setActiveVideo(res.videos[0]);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
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

      {loading ? (
        <div className="p-16 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-red-600" />
          Loading video feeds...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {videos.map((vid) => (
            <a
              key={vid._id}
              href={vid.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-xl transition-all flex flex-col justify-between"
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
                <span className="text-[10px] text-slate-400 block">
                  {vid.category?.name || "News"}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
