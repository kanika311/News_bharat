"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Sparkles } from "lucide-react";
import { apiFetch } from "@/lib/api";

const DEFAULT_SPONSORS = [
  {
    _id: "default-1",
    name: "Enterprise Business Analytics & Cloud",
    tagline: "Empowering Next-Gen Digital Infrastructure",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
    targetUrl: "https://bharatvarta.in",
    badge: "Tech & Cloud",
  },
  {
    _id: "default-2",
    name: "Swar Media Digital e-Paper Edition",
    tagline: "पढ़ें असली प्रिंट अख़बार, कहीं भी, कभी भी",
    imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80",
    targetUrl: "/epaper",
    badge: "Digital e-Paper",
  },
  {
    _id: "default-3",
    name: "Invest Smart • Live Market Tracker",
    tagline: "सेंसेक्स, निफ्टी और कमोडिटी का सबसे सटीक विश्लेषण",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80",
    targetUrl: "/business",
    badge: "Financial Desk",
  },
  {
    _id: "default-4",
    name: "24x7 Breaking Video Bulletins",
    tagline: "देश-दुनिया की सबसे तेज़ वीडियो खबरें व लाइव डिबेट",
    imageUrl: "https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&w=600&q=80",
    targetUrl: "/videos",
    badge: "Live Video",
  },
];

export default function AdSlot({ slot = "sidebar", className = "" }) {
  const [adList, setAdList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    apiFetch(`/api/ads/slot/${slot}`)
      .then((res) => {
        let loaded = [];
        if (res.success && res.ads && res.ads.length > 0) {
          loaded = res.ads;
        } else if (res.success && res.ad) {
          loaded = [res.ad];
        }

        // Combine with fallback sponsors if less than 2 to provide continuous auto-sliding
        if (loaded.length < 2) {
          const combined = [...loaded, ...DEFAULT_SPONSORS];
          // Deduplicate by name
          const unique = [];
          const seen = new Set();
          for (const item of combined) {
            if (!seen.has(item.name)) {
              seen.add(item.name);
              unique.push(item);
            }
          }
          setAdList(unique);
        } else {
          setAdList(loaded);
        }
      })
      .catch(() => {
        setAdList(DEFAULT_SPONSORS);
      });
  }, [slot]);

  // Auto-rotation every 4.5 seconds
  useEffect(() => {
    if (adList.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % adList.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [adList.length, isPaused]);

  if (adList.length === 0) return null;

  const currentAd = adList[currentIndex] || adList[0];

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + adList.length) % adList.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % adList.length);
  };

  const handleClick = () => {
    if (currentAd?._id && !currentAd._id.startsWith("default-")) {
      apiFetch(`/api/ads/${currentAd._id}/click`, { method: "POST" }).catch(() => {});
    }
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md ${className}`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
          <span className="text-amber-600 dark:text-amber-400 font-extrabold">Sponsored • प्रायोजित</span>
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-mono">
            {currentIndex + 1}/{adList.length}
          </span>
          <span className="text-[9px] bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded font-black">
            AD
          </span>
        </div>
      </div>

      {/* Main Slide Card */}
      <div className="relative group overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800">
        <a
          href={currentAd.targetUrl || "#"}
          target={currentAd.targetUrl?.startsWith("http") ? "_blank" : "_self"}
          rel="noopener noreferrer sponsored"
          onClick={handleClick}
          className="block"
        >
          {/* Ad Image Container with Smooth Fade Transition */}
          <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
            <img
              key={currentAd.imageUrl}
              src={currentAd.imageUrl}
              alt={currentAd.name || "Sponsored Ad"}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 animate-in fade-in zoom-in-95"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-3.5 text-white">
              <div className="flex items-center justify-between">
                {currentAd.badge && (
                  <span className="px-2 py-0.5 bg-red-600/90 text-[9px] font-black uppercase tracking-wider rounded-md shadow-sm">
                    {currentAd.badge}
                  </span>
                )}
                <span className="text-[9px] font-mono bg-black/60 px-2 py-0.5 rounded-full text-white/90">
                  Featured
                </span>
              </div>

              <div>
                <p className="text-xs sm:text-sm font-black leading-tight drop-shadow-md">
                  {currentAd.name}
                </p>
                {currentAd.tagline && (
                  <p className="text-[10px] text-white/80 line-clamp-1 mt-0.5 font-medium">
                    {currentAd.tagline}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Call to Action */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/90 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
              {currentAd.name}
            </span>
            <span className="text-[10px] font-bold text-red-600 dark:text-red-400 flex items-center gap-1 shrink-0 group-hover:translate-x-1 transition-transform">
              <span>Learn More</span>
              <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </a>

        {/* Navigation Arrows (Visible on group hover or mobile) */}
        {adList.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
              title="Previous Sponsor"
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
              title="Next Sponsor"
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Auto-Slide Indicator Dots & Pause Status */}
      {adList.length > 1 && (
        <div className="flex items-center justify-between pt-3 text-[10px] text-slate-400">
          <div className="flex items-center gap-1.5">
            {adList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all rounded-full ${
                  currentIndex === idx
                    ? "w-4 h-1.5 bg-red-600"
                    : "w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
                }`}
                title={`Go to slide ${idx + 1}`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
          <span className="text-[9px] font-medium text-slate-400 italic">
            {isPaused ? "Paused" : "Auto-Rotating"}
          </span>
        </div>
      )}
    </div>
  );
}
