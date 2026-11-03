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
  Vote,
  Newspaper,
  CheckCircle2,
  Bookmark,
  Building2,
  Landmark,
  Trophy,
  Film,
  GraduationCap,
  Wheat,
  Search,
  Megaphone,
  Laptop,
  FileText,
  Send,
  Check,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { useLang } from "@/lib/langContext";
import { apiFetch } from "@/lib/api";
import AdSlot from "@/components/public/AdSlot";

// Map icons to categories
const getCategoryIcon = (slug) => {
  switch (slug) {
    case "state-city":
      return Building2;
    case "politics":
    case "india":
      return Landmark;
    case "sports":
      return Trophy;
    case "business":
      return TrendingUp;
    case "entertainment":
      return Film;
    case "jobs-education":
      return GraduationCap;
    case "agriculture":
      return Wheat;
    case "fact-check":
      return Search;
    case "citizen-journalism":
      return Megaphone;
    case "technology":
      return Laptop;
    case "opinion":
      return FileText;
    default:
      return Flame;
  }
};

export default function HomePage() {
  const { lang, t } = useLang();
  const [pollVote, setPollVote] = useState(null);

  const [allArticles, setAllArticles] = useState([]);
  const [leadArticles, setLeadArticles] = useState([]);
  const [topStories, setTopStories] = useState([]);
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [videos, setVideos] = useState([]);
  const [galleries, setGalleries] = useState([]);
  const [liveBlog, setLiveBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active Category / Topic Filter in Left Sidebar
  const [selectedTopic, setSelectedTopic] = useState("all"); // 'all' for Top News or category slug/id
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    async function loadHomeContent() {
      try {
        const safeFetch = async (url) => {
          try {
            return await apiFetch(url);
          } catch (err) {
            console.error("Home fetch failed:", url, err);
            return {};
          }
        };

        const [
          articlesRes,
          catsRes,
          vidsRes,
          galsRes,
          liveRes,
          settingsRes,
        ] = await Promise.all([
          safeFetch("/api/articles?status=published&limit=50"),
          safeFetch("/api/categories"),
          safeFetch("/api/videos?limit=4"),
          safeFetch("/api/galleries?limit=3"),
          safeFetch("/api/live-blogs?status=live&limit=1"),
          safeFetch("/api/settings"),
        ]);

        const all = articlesRes.articles || [];
        const cats = catsRes.categories || [];

        setAllArticles(all);
        setCategories(cats);
        setVideos(vidsRes.videos || []);
        setGalleries(galsRes.galleries || []);
        if (liveRes.liveBlogs?.length > 0) {
          setLiveBlog(liveRes.liveBlogs[0]);
        }

        // Determine Hero & Top Stories
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

        // Top Stories
        const tops = all.filter((a) => a.isTopStory || a.isFeatured);
        setTopStories(tops.length ? tops.slice(0, 4) : all.slice(0, 4));

        // Trending Articles (Most views)
        const sortedByViews = [...all].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        setTrendingArticles(sortedByViews.length ? sortedByViews.slice(0, 5) : all.slice(0, 5));
      } catch (err) {
        console.error("Home loading error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadHomeContent();
  }, []);

  // Filtered articles for the Center Column
  const filteredArticles = React.useMemo(() => {
    if (selectedTopic === "all") {
      return allArticles;
    }
    return allArticles.filter((art) => {
      const catSlug = art.category?.slug;
      const catId = art.category?._id ? String(art.category._id) : String(art.category || "");
      return catSlug === selectedTopic || catId === selectedTopic;
    });
  }, [allArticles, selectedTopic]);

  // Selected topic name for header
  const selectedCategoryObj = categories.find(
    (c) => c.slug === selectedTopic || String(c._id) === selectedTopic
  );
  const activeTopicTitle =
    selectedTopic === "all"
      ? (lang === "hi" ? "ताज़ा सुर्खियां एवं जमीनी खबरें" : "Latest Ground Reports & Top Headlines")
      : (lang === "hi" && selectedCategoryObj?.nameHi ? selectedCategoryObj.nameHi : selectedCategoryObj?.name || "ताज़ा खबरें");

  const toggleBookmark = (id) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleShareArticle = (art) => {
    const url = `${window.location.origin}/${art.category?.slug || "news"}/${art.slug}`;
    if (navigator.share) {
      navigator.share({
        title: art.title,
        text: art.excerpt,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      setCopiedId(art._id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-4">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          {lang === "hi" ? "खबरें लोड हो रही हैं..." : "Loading Swar Media Headlines..."}
        </p>
      </div>
    );
  }

  const mainLead = leadArticles[0];
  const sideLeads = leadArticles.slice(1, 5);

  return (
    <div className="w-full space-y-0">
      {/* 1. LIVE BLOG ALERT TICKER (if any active live blog) */}
      {liveBlog && (
        <Link
          href={`/live/${liveBlog.slug}`}
          className="flex items-center gap-3 p-3 sm:p-3.5 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white shadow-sm hover:shadow-md transition-all group overflow-hidden w-full rounded-none"
        >
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] sm:text-xs font-black tracking-wider uppercase shrink-0">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            LIVE BLOG
          </span>
          <p className="text-xs sm:text-sm font-bold truncate flex-1">
            {lang === "hi" && liveBlog.titleHi ? liveBlog.titleHi : liveBlog.title}
          </p>
          <span className="text-xs font-bold text-white/90 group-hover:translate-x-1 transition-transform flex items-center gap-1 shrink-0">
            <span>{t("viewLive")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      )}

      {/* 2. 3-COLUMN LAYOUT: VISIBLE RIGHT FROM THE TOP (LEFT & RIGHT STICKY, CENTER SCROLLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch w-full">
        {/* ============================================================== */}
        {/* COLUMN 1: LEFT SIDEBAR - TOPICS / CATEGORY FILTER (3 Cols)   */}
        {/* ============================================================== */}
        <aside className="lg:col-span-3 lg:sticky lg:top-0 self-start h-full">
          <div className="bg-white dark:bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 p-3 sm:p-4 lg:min-h-[calc(100vh-9rem)] max-h-none lg:max-h-[calc(100vh-9rem)] overflow-y-auto no-scrollbar space-y-4 rounded-none shadow-none">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-1 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-wide uppercase">
                  विषय चुनें (TOPICS)
                </h2>
              </div>
            </div>

            {/* Topics Filter Navigation */}
            <div className="space-y-1">
              {/* Option 1: Top News (Default) */}
              <button
                type="button"
                onClick={() => setSelectedTopic("all")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                  selectedTopic === "all"
                    ? "bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 shadow-xs"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Flame className={`w-4 h-4 ${selectedTopic === "all" ? "text-red-600 fill-red-600" : "text-slate-400"}`} />
                  <span>टॉप न्यूज़</span>
                </div>
                {selectedTopic === "all" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                )}
              </button>

              {/* Dynamic Categories */}
              {categories.map((cat) => {
                const Icon = getCategoryIcon(cat.slug);
                const isSelected = selectedTopic === cat.slug || selectedTopic === String(cat._id);
                const label = lang === "hi" && cat.nameHi ? cat.nameHi : cat.name;

                return (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => setSelectedTopic(cat.slug)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 shadow-xs"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-red-600" : "text-slate-400"}`} />
                      <span className="truncate">{label}</span>
                    </div>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Utilities (ई-पेपर पढ़ें & खबर भेजें) */}
            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <Link
                href="/epaper"
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              >
                <Newspaper className="w-4 h-4" />
                <span>ई-पेपर पढ़ें</span>
              </Link>
              <Link
                href="/contact"
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Send className="w-4 h-4 text-slate-400" />
                <span>खबर भेजें</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* ============================================================== */}
        {/* COLUMN 2: CENTER - NEWS FEED (ONLY THIS COLUMN SCROLLS)       */}
        {/* ============================================================== */}
        <main className="lg:col-span-6 space-y-4 min-w-0 px-3 sm:px-4 py-3 bg-slate-50 dark:bg-slate-950">
          {/* Top Featured Lead Story (integrated into center column) */}
          {selectedTopic === "all" && mainLead && (
            <Link
              href={`/${mainLead.category?.slug || "news"}/${mainLead.slug}`}
              className="group block relative rounded-3xl overflow-hidden bg-slate-900 shadow-sm hover:shadow-xl transition-all border border-slate-200 dark:border-slate-800"
            >
              <div className="relative aspect-video sm:h-[320px] w-full overflow-hidden">
                <img
                  src={
                    mainLead.featuredImage?.url ||
                    "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80"
                  }
                  alt={mainLead.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-white bg-red-600 shadow-md">
                  {lang === "hi" && mainLead.category?.nameHi ? mainLead.category.nameHi : mainLead.category?.name}
                </span>
                {mainLead.location && (
                  <span className="absolute top-3.5 right-3.5 px-2.5 py-1 rounded-lg text-[10px] font-bold text-white bg-black/75 backdrop-blur-md border border-white/10 shadow">
                    📍 {mainLead.location}
                  </span>
                )}
                <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 space-y-1.5 text-white">
                  <h2 className="text-base sm:text-xl font-black leading-snug tracking-tight group-hover:text-red-400 transition-colors line-clamp-2">
                    {mainLead.title}
                  </h2>
                  <p className="text-xs text-slate-300 line-clamp-2 hidden sm:block">
                    {mainLead.excerpt || mainLead.subtitle}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                    <span>{new Date(mainLead.publishedAt || mainLead.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{mainLead.readingTime || 3} {t("minuteRead")}</span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Feed Header */}
          <div className="flex items-center justify-between pb-2 border-b-2 border-red-600">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
              <span>{activeTopicTitle}</span>
            </h2>
            <span className="text-xs text-slate-500 font-semibold">
              {filteredArticles.length} अन्य खबरें उपलब्ध
            </span>
          </div>

          {/* News Articles List (Exact Horizontal Card Design) */}
          {filteredArticles.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
              <Flame className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                इस विषय पर नई खबरें जल्द अपडेट की जाएंगी
              </p>
              <button
                onClick={() => setSelectedTopic("all")}
                className="px-4 py-1.5 bg-red-600 text-white rounded-xl text-xs font-bold"
              >
                सभी खबरें देखें
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredArticles.map((art) => {
                const catSlug = art.category?.slug || "news";
                const catLabel = lang === "hi" && art.category?.nameHi ? art.category.nameHi : art.category?.name || "समाचार";
                const isSaved = bookmarkedIds.has(art._id);
                const isCopied = copiedId === art._id;

                return (
                  <article
                    key={art._id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-red-500/40 transition-all group flex flex-col sm:flex-row gap-4 sm:gap-5"
                  >
                    {/* Left: Thumbnail with City/Location Badge */}
                    <Link
                      href={`/${catSlug}/${art.slug}`}
                      className="relative w-full sm:w-56 md:w-64 h-44 sm:h-36 rounded-2xl overflow-hidden shrink-0 bg-slate-950"
                    >
                      <img
                        src={
                          art.featuredImage?.url ||
                          "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80"
                        }
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Location Badge (Jammu, Sultanpur, Lucknow, etc.) */}
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-black/85 backdrop-blur-md text-white font-extrabold text-[11px] rounded-lg border border-white/10 shadow-md">
                        {art.location || (catSlug === "state-city" ? "राज्य-शहर" : catLabel)}
                      </span>
                    </Link>

                    {/* Right: Info, Headline, Excerpt & Actions */}
                    <div className="flex-1 flex flex-col justify-between space-y-2 min-w-0">
                      <div className="space-y-1.5">
                        {/* Category & Desk */}
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-extrabold text-red-600 dark:text-red-400 capitalize">
                            {catSlug}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500 text-[11px]">
                            {art.author?.name || "Editorial Desk"}
                          </span>
                        </div>

                        {/* Bold Red Headline */}
                        <Link href={`/${catSlug}/${art.slug}`}>
                          <h3 className="text-base sm:text-lg font-black text-red-600 dark:text-red-500 group-hover:text-red-700 dark:group-hover:text-red-400 leading-snug line-clamp-2 transition-colors">
                            {art.title}
                          </h3>
                        </Link>

                        {/* Summary / Excerpt */}
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {art.excerpt || art.subtitle || (art.content ? art.content.replace(/<[^>]+>/g, "").slice(0, 130) + "..." : "")}
                        </p>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{art.readingTime || 3} मिनट</span>
                          </span>
                          <span className="flex items-center gap-1 text-[11px]">
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            <span>{art.viewCount || 0}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleBookmark(art._id)}
                            className={`p-1 transition-colors ${isSaved ? "text-red-600" : "hover:text-red-600"}`}
                            title="Bookmark"
                          >
                            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-red-600" : ""}`} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleShareArticle(art)}
                            className="p-1 hover:text-red-600 transition-colors"
                            title="Share"
                          >
                            {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                          </button>

                          <Link
                            href={`/${catSlug}/${art.slug}`}
                            className="font-bold text-red-600 dark:text-red-400 flex items-center gap-0.5 hover:translate-x-0.5 transition-transform"
                          >
                            <span>विस्तार से</span>
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>

        {/* ============================================================== */}
        {/* COLUMN 3: RIGHT SIDEBAR - SPONSORED ADS & TRENDING (3 Cols)   */}
        {/* ============================================================== */}
        <aside className="lg:col-span-3 lg:sticky lg:top-0 self-start h-full bg-white dark:bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800">
          {/* Sticky Container so right panel stays pinned from top */}
          <div className="p-3 sm:p-4 lg:min-h-[calc(100vh-9rem)] max-h-none lg:max-h-[calc(100vh-9rem)] overflow-y-auto no-scrollbar space-y-4 rounded-none">
            {/* 1. Sponsored Ad Slider Card (Full height / carousel) */}
            <AdSlot slot="sidebar" />

            {/* 2. Trending / Most Read Widget */}
            {trendingArticles.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-red-600" />
                    <span>{t("mostRead")}</span>
                  </h3>
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full uppercase">
                    VIRAL
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {trendingArticles.slice(0, 4).map((art, idx) => (
                    <Link
                      key={art._id}
                      href={`/${art.category?.slug || "news"}/${art.slug}`}
                      className="py-2.5 flex items-start gap-2.5 group"
                    >
                      <span
                        className={`text-lg font-black shrink-0 w-5 text-center ${
                          idx === 0 ? "text-red-600" : idx === 1 ? "text-amber-500" : "text-slate-400"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                          {art.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 block">
                          {(art.viewCount || 0).toLocaleString()} व्यूज
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Reader Opinion Poll */}
            <div className="bg-gradient-to-br from-red-950 via-slate-900 to-slate-950 text-white rounded-3xl p-4 shadow-md border border-red-900/40 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-red-900/50">
                <span className="text-[10px] font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                  <Vote className="w-3.5 h-3.5 text-red-500" />
                  <span>जनमत पोल</span>
                </span>
                <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold uppercase">
                  LIVE
                </span>
              </div>

              <p className="text-xs font-bold leading-relaxed text-slate-100">
                क्या देश में जमीनी स्तर पर विकास योजनाओं का असर दिखाई दे रहा है?
              </p>

              {pollVote ? (
                <div className="space-y-1.5 pt-1 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between font-bold text-slate-200">
                      <span>हाँ</span>
                      <span>76%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-red-600 h-1.5 rounded-full" style={{ width: "76%" }} />
                    </div>
                  </div>
                  <p className="text-[10px] text-green-400 font-semibold pt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>राय दर्ज हो गई!</span>
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 pt-1">
                  {[
                    { id: "yes", label: "हाँ, पूरी तरह" },
                    { id: "no", label: "नहीं, सुधार चाहिए" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPollVote(opt.id)}
                      className="w-full py-1.5 px-3 text-xs font-bold text-left rounded-xl bg-slate-800 hover:bg-red-600 text-slate-200 hover:text-white transition-all flex items-center justify-between"
                    >
                      <span>{opt.label}</span>
                      <span className="text-[10px]">वोट →</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* 4. MULTIMEDIA VIDEO SECTION (4 Columns) */}
      {videos.length > 0 && (
        <section className="bg-slate-900 text-white rounded-none p-4 sm:p-6 space-y-6 shadow-none w-full">
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

      {/* 5. FLOATING WHATSAPP CHAT BUTTON (Bottom Right - Exactly as in screenshot) */}
      <a
        href="https://wa.me/919999999999?text=Namaste%20Swar%20Media"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp Us"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform group"
      >
        <svg
          className="w-8 h-8 fill-current"
          viewBox="0 0 24 24"
        >
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.187-2.59-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.392-10.416c-4.28 0-7.755 3.475-7.755 7.755 0 1.37.357 2.657.98 3.774l-1.042 3.805 3.902-1.024c1.077.587 2.316.924 3.637.924 4.281 0 7.755-3.475 7.755-7.755 0-4.28-3.474-7.755-7.755-7.755z" />
        </svg>
      </a>
    </div>
  );
}
