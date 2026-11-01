"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Clock, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useLang } from "@/lib/langContext";

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const { lang, t } = useLang();

  const [query, setQuery] = useState(q);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const performSearch = (searchTerm) => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    apiFetch(`/api/articles?search=${encodeURIComponent(searchTerm)}&status=published&limit=20`)
      .then((res) => {
        if (res.success) setArticles(res.articles || []);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (q) {
      setQuery(q);
      performSearch(q);
    }
  }, [q]);

  const handleSubmit = (e) => {
    e.preventDefault();
    performSearch(query);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Search Header */}
      <div className="max-w-3xl mx-auto space-y-4 text-center">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          News Search Engine • खबर खोजें
        </h1>
        <p className="text-xs text-slate-500">
          Find breaking stories, archived reports, and opinions across India and the globe
        </p>

        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full pl-12 pr-28 py-3 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          <button
            type="submit"
            className="absolute right-2 top-2 px-5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            Search
          </button>
        </form>
      </div>

      {/* Results */}
      <div>
        {query && (
          <p className="text-xs text-slate-500 font-semibold mb-4">
            Found {articles.length} result(s) for "{query}"
          </p>
        )}

        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-red-600" />
            Searching archive...
          </div>
        ) : articles.length === 0 && query ? (
          <div className="p-16 text-center text-slate-400 italic">
            No matching articles found. Try different keywords.
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
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white bg-red-600">
                    {art.category?.name}
                  </span>
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
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-red-600" />
          Loading search portal...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
