"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Flame,
  Clock,
  Eye,
  TrendingUp,
  Play,
  Image as ImageIcon,
  ChevronRight,
  Share2,
  Calendar,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useLang } from "@/lib/langContext";
import { apiFetch } from "@/lib/api";
import AdSlot from "@/components/public/AdSlot";

export default function HomePage() {
  const { lang, t } = useLang();

  const [leadArticles, setLeadArticles] = useState([]);
  const [topStories, setTopStories] = useState([]);
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [categoryArticles, setCategoryArticles] = useState({});
  const [categories, setCategories] = useState([]);
  const [videos, setVideos] = useState([]);
  const [galleries, setGalleries] = useState([]);
  const [liveBlog, setLiveBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeContent() {
      try {
        const [
          articlesRes,
          catsRes,
          vidsRes,
          galsRes,
          liveRes,
          settingsRes,
        ] = await Promise.all([
          apiFetch("/api/articles?status=published&limit=30"),
          apiFetch("/api/categories?menuOnly=true"),
          apiFetch("/api/videos?limit=4"),
          apiFetch("/api/galleries?limit=3"),
          apiFetch("/api/live-blogs?status=live&limit=1"),
          apiFetch("/api/settings"),
        ]);

        const all = articlesRes.articles || [];
        const cats = catsRes.categories || [];

        setCategories(cats);
        setVideos(vidsRes.videos || []);
        setGalleries(galsRes.galleries || []);
        if (liveRes.liveBlogs?.length > 0) {
          setLiveBlog(liveRes.liveBlogs[0]);
        }

        // 1. Determine Lead & Side stories (Hero Section)
        const leadIds = settingsRes.settings?.leadStoryIds || [];
        let heroList = [];
        if (leadIds.length > 0) {
          heroList = leadIds
            .map((id) => {
              const targetId = typeof id === "object" && id !== null ? String(id._id || id) : String(id);
              return all.find((a) => String(a._id) === targetId);
            })
            .filter(Boolean);
        }
        if (heroList.length < 5) {
          const remaining = all.filter((a) => !heroList.some((h) => String(h._id) === String(a._id)));
          heroList = [...heroList, ...remaining.slice(0, 5 - heroList.length)];
        }
        setLeadArticles(heroList.length ? heroList : all.slice(0, 5));

        // 2. Top Stories
        const tops = all.filter((a) => a.isTopStory || a.isFeatured);
        setTopStories(tops.length ? tops.slice(0, 4) : all.slice(0, 4));

        // 3. Trending Articles (Most views)
        const sortedByViews = [...all].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        setTrendingArticles(sortedByViews.length ? sortedByViews.slice(0, 5) : all.slice(0, 5));

        // 4. Group by category with String-safe ID matching
        const grouped = {};
        cats.forEach((cat) => {
          const catIdStr = String(cat._id);
          grouped[cat._id] = all.filter((a) => {
            const artCatId = a.category?._id ? String(a.category._id) : String(a.category || "");
            return artCatId === catIdStr;
          });
        });
        setCategoryArticles(grouped);
      } catch (err) {
        console.error("Home loading error", err);
      } finally {
        setLoading(false);
      }
    }

    loadHomeContent();
  }, []);

  const mainLead = leadArticles[0];
  const sideLeads = leadArticles.slice(1, 5);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-3">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
        <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
          लोड हो रहा है • Loading Swar Media...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-6 space-y-6 sm:space-y-8">
      {/* 1. Header Leaderboard Ad */}
      <AdSlot slot="header" />

      {/* 2. Live Blog Floating Notification Bar if active */}
      {liveBlog && (
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white rounded-2xl p-3 sm:p-4 shadow-lg flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-black/30 px-2.5 py-1 rounded-full shrink-0">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping inline-block" />
              <span>LIVE BLOG</span>
            </span>
            <Link
              href={`/live/${liveBlog.slug}`}
              className="text-xs sm:text-sm font-bold hover:underline line-clamp-1"
            >
              {lang === "hi" && liveBlog.titleHi ? liveBlog.titleHi : liveBlog.title}
            </Link>
          </div>
          <Link
            href={`/live/${liveBlog.slug}`}
            className="text-xs font-bold bg-white text-red-600 px-3 py-1.5 rounded-xl shrink-0 hover:bg-yellow-300 transition-colors"
          >
            {t("viewAll")} →
          </Link>
        </div>
      )}

      {/* 3. HERO SECTION (1 Big Lead Story + 4 Side Stories) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Big Lead Story (7 cols) */}
        {mainLead && (
          <div className="lg:col-span-7 group">
            <Link
              href={`/${mainLead.category?.slug || "news"}/${mainLead.slug}`}
              className="block bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all"
            >
              <div className="relative aspect-video overflow-hidden bg-slate-800">
                <img
                  src={
                    mainLead.featuredImage?.url ||
                    "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80"
                  }
                  alt={mainLead.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase text-white bg-red-600 shadow-md">
                    {lang === "hi" && mainLead.category?.nameHi
                      ? mainLead.category.nameHi
                      : mainLead.category?.name || "News"}
                  </span>
                  {mainLead.isBreaking && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase text-white bg-yellow-600 animate-pulse">
                      BREAKING
                    </span>
                  )}
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black leading-tight tracking-tight drop-shadow-md">
                    {mainLead.title}
                  </h2>
                </div>
              </div>

              <div className="p-5 space-y-3">
                {mainLead.subtitle && (
                  <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 line-clamp-2">
                    {mainLead.subtitle}
                  </p>
                )}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span>{mainLead.author?.name || "Swar Media Desk"}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(mainLead.publishedAt || mainLead.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300">
                    <Eye className="w-3 h-3 text-red-600" />
                    {(mainLead.viewCount || 0).toLocaleString()} {t("views")}
                  </span>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* 4 Side Stories (5 cols) */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          {sideLeads.map((art) => (
            <Link
              key={art._id}
              href={`/${art.category?.slug || "news"}/${art.slug}`}
              className="flex items-start gap-4 p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all group"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-24 rounded-xl overflow-hidden bg-slate-800 shrink-0 relative">
                <img
                  src={
                    art.featuredImage?.url ||
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
                  }
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="flex-1 space-y-1">
                <span className="text-[10px] font-black uppercase text-red-600">
                  {lang === "hi" && art.category?.nameHi ? art.category.nameHi : art.category?.name}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
                  {art.title}
                </h3>
                <p className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(art.publishedAt || art.createdAt).toLocaleDateString()}</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. TOP STORIES / बड़ी खबरें STRIP */}
      {topStories.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-red-600 pb-2">
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-3 h-3 bg-red-600 rounded-xs" />
              <span>{t("topStories")}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topStories.map((art) => (
              <Link
                key={art._id}
                href={`/${art.category?.slug || "news"}/${art.slug}`}
                className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="relative h-40 bg-slate-800 overflow-hidden">
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
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span>{new Date(art.publishedAt || art.createdAt).toLocaleDateString()}</span>
                    <span>{art.readingTime || 2} {t("minuteRead")}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 5. MAIN CONTENT + SIDEBAR SPLIT (2 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Feed: Category-wise Sections (8 cols) */}
        <div className="lg:col-span-8 space-y-10">
          {categories.map((cat) => {
            const articles = categoryArticles[cat._id] || [];
            if (articles.length === 0) return null;

            const primaryStory = articles[0];
            const otherStories = articles.slice(1, 4);

            return (
              <section key={cat._id} className="space-y-4">
                <div className="flex items-center justify-between border-b-2 pb-2" style={{ borderColor: cat.color || "#dc2626" }}>
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color || "#dc2626" }} />
                    <span>{lang === "hi" ? cat.nameHi : cat.name}</span>
                  </h2>
                  <Link
                    href={`/${cat.slug}`}
                    className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <span>{t("viewAll")}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  {/* Lead of section */}
                  {primaryStory && (
                    <div className="sm:col-span-6 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xs group">
                      <Link href={`/${cat.slug}/${primaryStory.slug}`}>
                        <div className="relative h-44 bg-slate-800 overflow-hidden">
                          <img
                            src={primaryStory.featuredImage?.url || "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80"}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-4 space-y-2">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-red-600 transition-colors line-clamp-2">
                            {primaryStory.title}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {primaryStory.excerpt || primaryStory.subtitle}
                          </p>
                          <span className="text-[11px] text-slate-400 block pt-1">
                            {new Date(primaryStory.publishedAt || primaryStory.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </Link>
                    </div>
                  )}

                  {/* List of others */}
                  <div className="sm:col-span-6 space-y-3">
                    {otherStories.map((art) => (
                      <Link
                        key={art._id}
                        href={`/${cat.slug}/${art.slug}`}
                        className="flex items-start gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-red-500/40 transition-colors group"
                      >
                        {art.featuredImage?.url && (
                          <img
                            src={art.featuredImage.url}
                            alt=""
                            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-100 dark:border-slate-800"
                          />
                        )}
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-red-600 transition-colors line-clamp-2">
                            {art.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 block">
                            {new Date(art.publishedAt || art.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        {/* Sidebar: Trending Viral Stories & Ads (4 cols) */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Sidebar Ad Slot */}
          <AdSlot slot="sidebar" />

          {/* Trending / Most Read Widget */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-red-600" />
                <span>{t("mostRead")}</span>
              </h3>
              <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full uppercase">
                VIRAL
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {trendingArticles.map((art, idx) => (
                <Link
                  key={art._id}
                  href={`/${art.category?.slug || "news"}/${art.slug}`}
                  className="py-3 flex items-start gap-3 group"
                >
                  <span
                    className={`text-xl font-black shrink-0 w-6 text-center ${
                      idx === 0
                        ? "text-red-600"
                        : idx === 1
                        ? "text-amber-500"
                        : idx === 2
                        ? "text-blue-500"
                        : "text-slate-300 dark:text-slate-700"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-red-600 transition-colors line-clamp-2">
                      {art.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="text-red-600 font-semibold">{art.category?.name}</span>
                      <span>•</span>
                      <span>{(art.viewCount || 0).toLocaleString()} {t("views")}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* 6. MULTIMEDIA VIDEO SECTION (Aaj Tak Video Hub) */}
      {videos.length > 0 && (
        <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-black">
                <Play className="w-4 h-4 fill-white ml-0.5" />
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight">
                {t("videos")} • वीडियो बुलेटिन
              </h2>
            </div>
            <Link
              href="/videos"
              className="text-xs font-bold text-red-400 hover:text-white flex items-center gap-1"
            >
              <span>{t("viewAll")}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {videos.map((vid) => (
              <a
                key={vid._id}
                href={vid.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="group rounded-2xl overflow-hidden bg-slate-800/80 border border-slate-700/60 hover:border-red-600 transition-all flex flex-col justify-between"
              >
                <div className="relative aspect-video bg-black overflow-hidden">
                  <img
                    src={vid.thumbnail || "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=600&q=80"}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                    <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono font-bold">
                    {vid.duration}
                  </span>
                </div>
                <div className="p-3.5 space-y-1">
                  <h3 className="text-xs font-bold line-clamp-2 group-hover:text-red-400 transition-colors">
                    {lang === "hi" && vid.titleHi ? vid.titleHi : vid.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 block">
                    {vid.category?.name || "News"}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* 7. PHOTO GALLERIES SECTION */}
      {galleries.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-red-600 pb-2">
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-red-600" />
              <span>{t("photos")} • फोटो गैलरी</span>
            </h2>
            <Link
              href="/photos"
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <span>{t("viewAll")}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {galleries.map((gal) => (
              <Link
                key={gal._id}
                href={`/photos/${gal.slug}`}
                className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-xl transition-all"
              >
                <div className="relative h-48 bg-slate-800 overflow-hidden">
                  <img
                    src={gal.coverImage}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    {gal.photos?.length || 0} PHOTOS
                  </span>
                </div>
                <div className="p-4 space-y-1">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-red-600 transition-colors">
                    {lang === "hi" && gal.titleHi ? gal.titleHi : gal.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{gal.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
