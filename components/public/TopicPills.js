"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { useLang } from "@/lib/langContext";

export default function TopicPills() {
  const { lang } = useLang();
  const scrollRef = useRef(null);

  const topicsHi = [
    { label: "माइक्रोड्रामा", query: "माइक्रोड्रामा", isHot: true },
    { label: "उठो अनारकली", query: "अनारकली" },
    { label: "राहुल गांधी", query: "राहुल गांधी" },
    { label: "इंडिया ब्लॉक", query: "इंडिया ब्लॉक" },
    { label: "ज्ञानेश कुमार", query: "ज्ञानेश कुमार" },
    { label: "अहोई अष्टमी", query: "अहोई अष्टमी" },
    { label: "मल्लिकार्जुन खड़गे", query: "खड़गे" },
    { label: "चुनाव आयोग", query: "चुनाव आयोग" },
    { label: "पीएम मोदी", query: "मोदी" },
    { label: "वायु प्रदूषण", query: "प्रदूषण" },
    { label: "शेयर बाजार", query: "शेयर बाजार" },
    { label: "सोना-चांदी भाव", query: "सोना भाव" },
    { label: "T20 वर्ल्ड कप", query: "क्रिकेट" },
    { label: "AI टेक्नोलॉजी", query: "AI" },
  ];

  const topicsEn = [
    { label: "Microdrama", query: "microdrama", isHot: true },
    { label: "Parliament Session", query: "parliament" },
    { label: "Rahul Gandhi", query: "Rahul Gandhi" },
    { label: "INDIA Bloc", query: "INDIA bloc" },
    { label: "Election Commission", query: "election" },
    { label: "PM Modi", query: "Modi" },
    { label: "Air Pollution", query: "pollution" },
    { label: "Stock Market Rally", query: "sensex" },
    { label: "ISRO Space Mission", query: "isro" },
    { label: "Gold & Silver Rate", query: "gold" },
    { label: "Cricket Updates", query: "cricket" },
    { label: "AI Innovations", query: "AI" },
  ];

  const topics = lang === "hi" ? topicsHi : topicsEn;

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 260;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="bg-amber-50/40 dark:bg-slate-900/90 border-b border-amber-200/50 dark:border-amber-900/30 select-none py-1.5 px-2 sm:px-4 transition-colors">
      <div className="w-full flex items-center gap-1.5 sm:gap-2">
        {/* Left Scroll Button (Desktop) */}
        <button
          onClick={() => scroll("left")}
          className="hidden sm:flex w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-xs items-center justify-center text-slate-700 dark:text-slate-300 hover:border-amber-400 hover:text-amber-600 shrink-0"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Pills Container */}
        <div
          ref={scrollRef}
          className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth py-0.5 w-full"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
        >
          {topics.map((topic, idx) => (
            <Link
              key={idx}
              href={`/search?q=${encodeURIComponent(topic.query)}`}
              className={`px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs rounded-full whitespace-nowrap font-medium transition-all duration-150 ${
                topic.isHot
                  ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-xs border border-amber-400 hover:brightness-105"
                  : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-amber-400 hover:text-amber-700 dark:hover:text-amber-400"
              }`}
            >
              {topic.label}
            </Link>
          ))}
        </div>

        {/* Right Scroll Button (Desktop) */}
        <button
          onClick={() => scroll("right")}
          className="hidden sm:flex w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-xs items-center justify-center text-slate-700 dark:text-slate-300 hover:border-amber-400 hover:text-amber-600 shrink-0"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
