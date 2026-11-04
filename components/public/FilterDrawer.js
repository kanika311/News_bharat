"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SlidersHorizontal,
  X,
  Flame,
  Tv,
  Newspaper,
  Video,
  LayoutDashboard,
  Tag,
  MapPin,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Layers,
  Check,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useLang } from "@/lib/langContext";

export default function FilterDrawer({ isOpen, onClose, onSelectCategory, selectedCategory = "all" }) {
  const pathname = usePathname();
  const { lang } = useLang();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    apiFetch("/api/categories")
      .then((res) => {
        if (res.success && res.categories) setCategories(res.categories);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen]);

  const handleCategoryClick = (e, slug) => {
    if (onSelectCategory) {
      e.preventDefault();
      onSelectCategory(slug);
      onClose();
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
      {/* Dark Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Red Left Drawer */}
      <div className="relative w-80 max-w-[85vw] h-full bg-gradient-to-b from-[#b91c1c] via-[#991b1b] to-[#1e1b4b] text-white shadow-2xl flex flex-col justify-between overflow-hidden z-10 border-r border-red-500/30 animate-in slide-in-from-left duration-300">
        {/* Drawer Header */}
        <div className="p-4 bg-black/20 backdrop-blur-md border-b border-white/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-white">
              <SlidersHorizontal className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight leading-tight">
                {lang === "hi" ? "फ़िल्टर एवं श्रेणियां" : "Filters & Categories"}
              </h2>
              <p className="text-[10px] text-red-200">
                {lang === "hi" ? "त्वरित नेविगेशन व ग्राउंड टॉपिक्स" : "Quick News Navigation"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="बंद करें"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
          {/* Section 1: Main Feature Links */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-red-200 block">
              {lang === "hi" ? "मुख्य आकर्षण (Featured)" : "Featured Desks"}
            </span>
            <div className="space-y-1">
              <Link
                href="/live"
                onClick={onClose}
                className="flex items-center justify-between p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors font-bold"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                  <Tv className="w-4 h-4 text-red-300" />
                  <span>{lang === "hi" ? "लाइव न्यूज़ प्रसारण" : "Live Broadcast TV"}</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500 text-white font-black">
                  LIVE
                </span>
              </Link>

              <Link
                href="/epaper"
                onClick={onClose}
                className="flex items-center justify-between p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors font-bold"
              >
                <div className="flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-amber-300" />
                  <span>{lang === "hi" ? "आज का अखबार ई-पेपर" : "Today's e-Paper"}</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black">
                  PDF
                </span>
              </Link>

              <Link
                href="/videos"
                onClick={onClose}
                className="flex items-center justify-between p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors font-bold"
              >
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-emerald-300" />
                  <span>{lang === "hi" ? "विशेष वीडियो बुलेटिन" : "Video Bulletins"}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>

              <Link
                href="/live-blogs"
                onClick={onClose}
                className="flex items-center justify-between p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors font-bold"
              >
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span>{lang === "hi" ? "लाइव ब्लॉग्स कवरेज" : "Live Blogs"}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>

              <Link
                href="/dashboard"
                onClick={onClose}
                className="flex items-center justify-between p-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 transition-colors font-black"
              >
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-white" />
                  <span>{lang === "hi" ? "नागरिक पत्रकार डैशबोर्ड" : "Citizen Journalist Desk"}</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-white text-red-700 font-black">
                  NEW
                </span>
              </Link>
            </div>
          </div>

          {/* Section 2: News Categories Filter */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-red-200 block">
              {lang === "hi" ? "विषय एवं श्रेणियां (Filter by Topic)" : "Filter by Topic"}
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={(e) => handleCategoryClick(e, "all")}
                className={`p-2 rounded-xl font-bold transition-all flex items-center justify-between text-left cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-white text-red-900 shadow-md ring-2 ring-white/60 font-black"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Flame className={`w-3.5 h-3.5 shrink-0 ${selectedCategory === "all" ? "text-red-600 fill-red-600" : "text-amber-400"}`} />
                  <span className="truncate">टॉप न्यूज़</span>
                </div>
                {selectedCategory === "all" ? (
                  <Check className="w-3.5 h-3.5 text-red-700 shrink-0" />
                ) : (
                  <ChevronRight className="w-3 h-3 opacity-60 shrink-0" />
                )}
              </button>

              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.slug || selectedCategory === String(cat._id);
                const label = lang === "hi" && cat.nameHi ? cat.nameHi : cat.name;

                return (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={(e) => handleCategoryClick(e, cat.slug)}
                    className={`p-2 rounded-xl font-bold transition-all flex items-center justify-between text-left truncate cursor-pointer ${
                      isSelected
                        ? "bg-white text-red-900 shadow-md ring-2 ring-white/60 font-black"
                        : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                  >
                    <span className="truncate">{label}</span>
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5 text-red-700 shrink-0" />
                    ) : (
                      <ChevronRight className="w-3 h-3 opacity-60 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Trending Ground Hashtags */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-red-200 block">
              {lang === "hi" ? "ट्रेंडिंग मुद्दे (Topics)" : "Trending Topics"}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { tag: "#सुल्तानपुर", q: "सुल्तानपुर" },
                { tag: "#लखनऊ", q: "लखनऊ" },
                { tag: "#किसान_एमएसपी", q: "किसान" },
                { tag: "#वाराणसी", q: "वाराणसी" },
                { tag: "#अयोध्या", q: "अयोध्या" },
                { tag: "#क्रिकेट", q: "क्रिकेट" },
                { tag: "#स्मार्ट_सिटी", q: "स्मार्ट सिटी" },
              ].map((item, idx) => (
                <Link
                  key={idx}
                  href={`/search?q=${encodeURIComponent(item.q)}`}
                  onClick={onClose}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/25 text-[11px] font-bold text-red-100 hover:text-white transition-colors"
                >
                  {item.tag}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-3 bg-black/30 border-t border-white/15 flex items-center justify-between text-[11px] text-red-200">
          <p className="font-hindi font-medium">स्वर मीडिया • सत्य, सुर और सरोकार</p>
          <button
            onClick={onClose}
            className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white font-bold cursor-pointer"
          >
            बंद करें
          </button>
        </div>
      </div>
    </div>
  );
}

