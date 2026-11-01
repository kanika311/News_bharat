"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Image as ImageIcon, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useLang } from "@/lib/langContext";

export default function PhotoGalleryDetailPage() {
  const params = useParams();
  const slug = params?.slug;
  const { lang, t } = useLang();

  const [gallery, setGallery] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    apiFetch(`/api/galleries/${slug}`)
      .then((res) => {
        if (res.success && res.gallery) setGallery(res.gallery);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  if (!gallery) return <div className="p-16 text-center">Gallery not found.</div>;

  const photos = gallery.photos || [];
  const currentPhoto = photos[currentIndex] || { url: gallery.coverImage, caption: "" };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="space-y-2">
        <span className="text-xs font-black uppercase text-red-600">
          Photo Story • {currentIndex + 1} of {photos.length}
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {lang === "hi" && gallery.titleHi ? gallery.titleHi : gallery.title}
        </h1>
        {gallery.description && (
          <p className="text-sm text-slate-600 dark:text-slate-300">{gallery.description}</p>
        )}
      </div>

      {/* Main Slide Viewer */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-950 aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center shadow-2xl">
        <img
          src={currentPhoto.url}
          alt={currentPhoto.caption || gallery.title}
          className="max-h-full max-w-full object-contain"
        />

        {photos.length > 1 && (
          <>
            <button
              onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-sm"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0))}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-sm"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {currentPhoto.caption && (
        <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl italic border-l-4 border-red-600">
          {currentPhoto.caption}
        </p>
      )}

      {/* Thumbnails row */}
      <div className="flex items-center gap-3 overflow-x-auto py-2">
        {photos.map((p, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
              currentIndex === idx ? "border-red-600 scale-105 shadow-md" : "border-transparent opacity-60 hover:opacity-100"
            }`}
          >
            <img src={p.url} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
