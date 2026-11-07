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
    <div className="bg-gradient-to-r from-[#070e1e] via-[#0f1d3b] to-[#070e1e] text-white border-y-2 border-amber-400 text-xs overflow-hidden select-none relative shadow-md h-9 sm:h-10 flex items-center">
      <div className="w-full flex items-center h-full">
        {/* The Swar Media Royal Crimson & Gold BREAKING NEWS Badge */}
        <div className="h-full flex items-center gap-1.5 px-3 sm:px-4 bg-gradient-to-r from-[#b30d12] to-[#dc2626] text-amber-300 font-black tracking-wider uppercase shrink-0 shadow-lg z-10 border-r-2 border-amber-400">
          <span className="w-2 h-2 rounded-full bg-yellow-300 animate-ping shrink-0" />
          <span className="text-yellow-300 font-black tracking-wider text-[10px] sm:text-xs whitespace-nowrap">
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
                  className="inline-flex items-center gap-2 shrink-0 whitespace-nowrap px-4 hover:text-amber-300 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-xs shadow-yellow-400/80 inline-block shrink-0" />
                  <span className={`whitespace-nowrap shrink-0 text-white hover:text-amber-300 ${lang === "hi" ? "font-hindi font-semibold" : ""}`}>
                    {displayContent}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Close 'x' button */}
        <button
          onClick={() => setDismissed(true)}
          className="h-full px-2.5 sm:px-3 flex items-center justify-center text-amber-300 hover:text-white hover:bg-white/10 transition-colors shrink-0 z-10 border-l border-amber-400/50"
          title="Close breaking news"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
}
