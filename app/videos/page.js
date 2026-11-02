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

      {/* Featured Active Player */}
      {activeVideo && (
        <div className="bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
          <div className="aspect-video w-full bg-black relative flex items-center justify-center">
            {activeVideo.videoUrl.startsWith("/uploads/") || activeVideo.videoUrl.match(/\.(mp4|webm|mov)$/i) ? (
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
          <div className="p-4 sm:p-6 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider">
                {activeVideo.category?.name || "Now Playing"}
              </span>
              <h2 className="text-base sm:text-lg font-black text-white mt-1.5">
                {lang === "hi" && activeVideo.titleHi ? activeVideo.titleHi : activeVideo.title}
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400 bg-slate-800 px-3 py-1 rounded-xl shrink-0">
              Duration: {activeVideo.duration}
            </span>
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
                  <span className="text-[10px] text-slate-400 block">
                    {vid.category?.name || "News"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
