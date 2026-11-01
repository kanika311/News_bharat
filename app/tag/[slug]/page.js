"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Tags, Clock, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useLang } from "@/lib/langContext";

export default function TagPage() {
  const params = useParams();
  const slug = params?.slug;
  const { lang, t } = useLang();

  const [articles, setArticles] = useState([]);
  const [tagInfo, setTagInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    apiFetch(`/api/tags`)
      .then((res) => {
        const found = res.tags?.find((t) => t.slug === slug);
        if (found) {
          setTagInfo(found);
          return apiFetch(`/api/articles?tag=${found._id}&status=published`);
        }
      })
      .then((artRes) => {
        if (artRes && artRes.success) setArticles(artRes.articles || []);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3 border-b-2 border-red-600 pb-3">
        <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center">
          <Tags className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            #{tagInfo?.name || slug} {tagInfo?.nameHi ? `(${tagInfo.nameHi})` : ""}
          </h1>
          <p className="text-xs text-slate-500">
            Curated coverage and stories tagged under this topic
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-red-600" />
          Loading topic stories...
        </div>
      ) : articles.length === 0 ? (
        <div className="p-16 text-center text-slate-400 italic">
          No stories currently filed under this topic.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {articles.map((art) => (
            <Link
              key={art._id}
              href={`/${art.category?.slug || "news"}/${art.slug}`}
              className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-lg transition-all group flex flex-col justify-between"
            >
              <div className="relative h-44 bg-slate-800 overflow-hidden">
                <img
                  src={art.featuredImage?.url || "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80"}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-red-600 transition-colors">
                  {art.title}
                </h3>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>{new Date(art.publishedAt || art.createdAt).toLocaleDateString()}</span>
                  <span>{art.readingTime || 2} {t("minuteRead")}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
