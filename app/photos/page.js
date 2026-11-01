"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useLang } from "@/lib/langContext";

export default function PhotosPage() {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { lang, t } = useLang();

  useEffect(() => {
    apiFetch("/api/galleries?limit=24")
      .then((res) => {
        if (res.success && res.galleries) setGalleries(res.galleries);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      <div className="flex items-center gap-3 border-b-2 border-red-600 pb-3">
        <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center">
          <ImageIcon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t("photos")} • Visual Essays & Photo Stories
          </h1>
          <p className="text-xs text-slate-500">
            High-definition photographic stories capturing culture, politics, sports, and human moments
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-red-600" />
          Loading photo galleries...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {galleries.map((gal) => (
            <Link
              key={gal._id}
              href={`/photos/${gal.slug}`}
              className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-xl transition-all"
            >
              <div className="relative h-56 bg-slate-800 overflow-hidden">
                <img
                  src={gal.coverImage}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase flex items-center gap-1.5 shadow-md">
                  <ImageIcon className="w-3.5 h-3.5" />
                  {gal.photos?.length || 0} PHOTOS
                </span>
              </div>
              <div className="p-5 space-y-1.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-red-600 transition-colors">
                  {lang === "hi" && gal.titleHi ? gal.titleHi : gal.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2">{gal.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
