"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { UserCheck, Clock, Loader2, Mail } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useLang } from "@/lib/langContext";

export default function AuthorPage() {
  const params = useParams();
  const id = params?.id;
  const { lang, t } = useLang();

  const [author, setAuthor] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      apiFetch(`/api/users/${id}`),
      apiFetch(`/api/articles?author=${id}&status=published`),
    ])
      .then(([uRes, aRes]) => {
        if (uRes.success) setAuthor(uRes.user);
        if (aRes.success) setArticles(aRes.articles || []);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  if (!author) return <div className="p-16 text-center">Author not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Author Profile Header */}
      <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img
          src={author.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
          alt=""
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-red-600 shrink-0 shadow-lg"
        />
        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {author.name}
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full inline-block self-center sm:self-auto">
              {author.role}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            {lang === "hi" && author.bioHi ? author.bioHi : author.bio || "Senior Journalist at Swar Media."}
          </p>

          <p className="text-xs text-slate-400 font-semibold pt-1">
            {articles.length} published stories in news archive
          </p>
        </div>
      </div>

      {/* Authored Stories Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-900 dark:text-white border-b-2 border-red-600 pb-2">
          Published Dispatches & Reports
        </h2>

        {articles.length === 0 ? (
          <p className="p-8 text-center text-xs text-slate-400 italic">No published articles yet.</p>
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
