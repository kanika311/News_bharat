"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Radio, ChevronRight, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useLang } from "@/lib/langContext";

export default function Ticker() {
  const [tickers, setTickers] = useState([]);
  const [dismissed, setDismissed] = useState(false);
  const { lang, t } = useLang();

  useEffect(() => {
    apiFetch("/api/ticker?activeOnly=true")
      .then((res) => {
        if (res.success) setTickers(res.tickers || []);
      })
      .catch(() => {});
  }, []);

  if (tickers.length === 0 || dismissed) return null;

  return (
    <div className="bg-red-600 text-white border-y border-red-700 text-xs overflow-hidden select-none relative shadow-xs h-9 sm:h-10 flex items-center">
      <div className="w-full max-w-7xl mx-auto flex items-center h-full">
        {/* Aaj Tak Style BREAKING NEWS Badge */}
        <div className="h-full flex items-center gap-1.5 px-3 sm:px-4 bg-red-800 text-white font-black tracking-wider uppercase shrink-0 shadow-md z-10 border-r border-red-700/60">
          <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
          <span className="text-white font-black tracking-wide text-[10px] sm:text-xs whitespace-nowrap">
            {lang === "hi" ? "बड़ी खबर" : "BREAKING"}
          </span>
        </div>

        {/* Marquee Track (Guaranteed single horizontal scrolling line) */}
        <div className="overflow-hidden whitespace-nowrap flex-1 h-full flex items-center relative text-[11px] sm:text-xs min-w-0">
          <div className="animate-ticker inline-flex items-center font-medium h-full flex-nowrap whitespace-nowrap">
            {[...tickers, ...tickers, ...tickers, ...tickers].map((item, idx) => {
              const displayContent = lang === "hi" && item.textHi ? item.textHi : item.text;
              return (
                <Link
                  key={idx}
                  href={item.link || "#"}
                  className="inline-flex items-center gap-2 shrink-0 whitespace-nowrap px-4 hover:text-yellow-200 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 inline-block shrink-0" />
                  <span className={`whitespace-nowrap shrink-0 ${lang === "hi" ? "font-hindi font-semibold" : ""}`}>
                    {displayContent}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Aaj Tak Style Close 'x' button */}
        <button
          onClick={() => setDismissed(true)}
          className="h-full px-2.5 sm:px-3 flex items-center justify-center text-white/80 hover:text-white hover:bg-red-700 transition-colors shrink-0 z-10 border-l border-red-700/40"
          title="Close breaking news"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
}
