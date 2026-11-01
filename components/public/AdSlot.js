"use client";

import React, { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

export default function AdSlot({ slot = "header", className = "" }) {
  const [ad, setAd] = useState(null);

  useEffect(() => {
    apiFetch(`/api/ads/slot/${slot}`)
      .then((res) => {
        if (res.success && res.ad) {
          setAd(res.ad);
        }
      })
      .catch(() => {});
  }, [slot]);

  if (!ad || !ad.isActive) return null;

  const handleClick = () => {
    if (ad._id) {
      apiFetch(`/api/ads/${ad._id}/click`, { method: "POST" }).catch(() => {});
    }
  };

  return (
    <div className={`my-4 flex flex-col items-center justify-center ${className}`}>
      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
        Advertisement • विज्ञापन
      </span>

      {ad.type === "image" && ad.imageUrl ? (
        <a
          href={ad.targetUrl || "#"}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleClick}
          className="block overflow-hidden rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 hover:opacity-95 transition-opacity"
        >
          <img
            src={ad.imageUrl}
            alt={ad.name}
            className={`object-cover ${
              slot === "header"
                ? "max-h-[90px] w-auto max-w-full"
                : slot === "sidebar"
                ? "w-[300px] h-[250px]"
                : "max-h-[160px] w-full"
            }`}
          />
        </a>
      ) : ad.scriptCode ? (
        <div
          dangerouslySetInnerHTML={{ __html: ad.scriptCode }}
          className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 p-2"
        />
      ) : null}
    </div>
  );
}
