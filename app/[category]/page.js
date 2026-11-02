"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Clock, Eye, ChevronRight, Loader2, ChevronLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useLang } from "@/lib/langContext";
import AdSlot from "@/components/public/AdSlot";

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params?.category;
  const { lang, t } = useLang();

  const [articles, setArticles] = useState([]);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categorySlug) return;

    setLoading(true);
    apiFetch(`/api/articles?categorySlug=${categorySlug}&page=${page}&limit=12&status=published`)
      .then((res) => {
        if (res.success) {
          setArticles(res.articles || []);
          setTotal(res.total || 0);
          setTotalPages(res.totalPages || 1);
          if (res.articles?.[0]?.category) {
            setCategoryInfo(res.articles[0].category);
          }
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [categorySlug, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Category Header */}
      <div className="p-6 bg-gradient-to-r from-red-600 to-red-800 rounded-3xl text-white shadow-lg flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
            Category Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-black capitalize">
            {lang === "hi" && categoryInfo?.nameHi ? categoryInfo.nameHi : categoryInfo?.name || categorySlug}
          </h1>
          <p className="text-xs text-red-100 mt-1">
            Latest bulletins, deep analysis, and breaking stories from this desk
          </p>
        </div>
        <span className="text-xs font-bold bg-white/20 px-3 py-1.5 rounded-xl">
          {total} Stories
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Feed (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {loading ? (
            <div className="p-16 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-red-600" />
              Loading stories...
            </div>
          ) : articles.length === 0 ? (
            <div className="p-16 text-center text-slate-400 italic text-sm">
              No articles currently published in this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {articles.map((art) => (
                <Link
                  key={art._id}
                  href={`/${categorySlug}/${art.slug}`}
                  className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-lg transition-all group flex flex-col justify-between"
                >
                  <div className="relative h-44 bg-slate-800 overflow-hidden">
                    <img
                      src={art.featuredImage?.url || "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80"}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white bg-red-600">
                      {lang === "hi" && art.category?.nameHi ? art.category.nameHi : art.category?.name}
                    </span>
                  </div>
                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-red-600 transition-colors">
                      {art.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {art.excerpt || art.subtitle}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span>{new Date(art.publishedAt || art.createdAt).toLocaleDateString()}</span>
                      <span>{art.readingTime || 2} {t("minuteRead")}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-slate-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5 inline mr-1" /> Prev
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                >
                  Next <ChevronRight className="w-3.5 h-3.5 inline ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar (4 cols) */}
        <aside className="lg:col-span-4">
          <div className="sticky top-28 space-y-6">
            <AdSlot slot="sidebar" />
          </div>
        </aside>
      </div>
    </div>
  );
}
