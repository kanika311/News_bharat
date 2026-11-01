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
    <div className="bg-red-600 text-white border-y border-red-700 text-xs overflow-hidden select-none relative shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center">
        {/* Aaj Tak Style BREAKING NEWS Badge */}
        <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-red-800 font-black tracking-wider uppercase shrink-0 shadow-md z-10">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white animate-ping shrink-0" />
          <span className="text-white font-black tracking-wide text-[10px] sm:text-xs">
            {lang === "hi" ? "BREAKING" : "BREAKING"}
          </span>
        </div>

        {/* Marquee Track */}
        <div className="overflow-hidden whitespace-nowrap flex-1 py-1 sm:py-1.5 relative text-[11px] sm:text-xs">
          <div className="animate-ticker inline-flex items-center gap-8 sm:gap-12 font-medium">
            {tickers.concat(tickers).map((item, idx) => {
              const displayContent = lang === "hi" && item.textHi ? item.textHi : item.text;
              return (
                <Link
                  key={idx}
                  href={item.link || "#"}
                  className="hover:text-yellow-200 hover:underline flex items-center gap-1.5 sm:gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60 inline-block shrink-0" />
                  <span className={lang === "hi" ? "font-hindi font-semibold" : ""}>
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
          className="px-2 sm:px-3 py-1.5 sm:py-2 text-white/80 hover:text-white hover:bg-red-700 transition-colors shrink-0"
          title="Close breaking news"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
}
