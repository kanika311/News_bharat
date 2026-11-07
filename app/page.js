"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Flame,
  Clock,
  Eye,
  Heart,
  MessageSquare,
  TrendingUp,
  Play,
  Image as ImageIcon,
  ChevronRight,
  Share2,
  Calendar,
  Sparkles,
  ArrowRight,
  Loader2,
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
  SlidersHorizontal,
} from "lucide-react";
import { useLang } from "@/lib/langContext";
import { apiFetch } from "@/lib/api";
import AdSlot from "@/components/public/AdSlot";
import FilterDrawer from "@/components/public/FilterDrawer";

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

  const [allArticles, setAllArticles] = useState([]);
  const [leadArticles, setLeadArticles] = useState([]);
  const [topStories, setTopStories] = useState([]);
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Category / Topic Filter in Left Sidebar
  const [selectedTopic, setSelectedTopic] = useState("all"); // 'all' for Top News or category slug/id
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [copiedId, setCopiedId] = useState(null);
  const [likedArticles, setLikedArticles] = useState(new Set());
  const [likesMap, setLikesMap] = useState({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const likedSet = new Set();
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("liked_article_")) {
            likedSet.add(key.replace("liked_article_", ""));
          }
        }
        setLikedArticles(likedSet);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    // Safety timer: Never block visitor for more than 1.2s on loading screen
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    async function loadHomeContent() {
      try {
        const safeFetch = async (url) => {
          try {
            return await apiFetch(url, { timeout: 4000 });
          } catch (err) {
            console.error("Home fetch failed:", url, err);
            return {};
          }
        };

        const [
          articlesRes,
          catsRes,
          settingsRes,
        ] = await Promise.all([
          safeFetch("/api/articles?status=published&limit=30"),
          safeFetch("/api/categories"),
          safeFetch("/api/settings"),
        ]);

        const rawArticles = articlesRes.articles || [];
        // Sort strictly by latest updated/published news first (Last updated on top)
        const all = [...rawArticles].sort((a, b) => {
          const timeA = new Date(a.updatedAt || a.publishedAt || a.createdAt || 0).getTime();
          const timeB = new Date(b.updatedAt || b.publishedAt || b.createdAt || 0).getTime();
          return timeB - timeA;
        });

        const cats = catsRes.categories || [];

        setAllArticles(all);
        setCategories(cats);

        // Simple: Latest updated news is directly at the top (main lead)
        setLeadArticles(all.slice(0, 5));

        // Top Stories
        const tops = all.slice(1, 5);
        setTopStories(tops);

        // Trending Articles (Most views)
        const sortedByViews = [...all].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        setTrendingArticles(sortedByViews.length ? sortedByViews.slice(0, 5) : all.slice(0, 5));
      } catch (err) {
        console.error("Home loading error:", err);
      } finally {
        clearTimeout(safetyTimer);
        setLoading(false);
      }
    }

    loadHomeContent();

    return () => clearTimeout(safetyTimer);
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

  const handleLikeArticle = async (e, art) => {
    e.preventDefault();
    e.stopPropagation();
    const artId = art._id;
    const isLiked = likedArticles.has(artId);

    const currentLikes = likesMap[artId] ?? art.likesCount ?? 0;
    const newCount = isLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;

    setLikesMap((prev) => ({ ...prev, [artId]: newCount }));
    setLikedArticles((prev) => {
      const next = new Set(prev);
      if (isLiked) {
        next.delete(artId);
        try { localStorage.removeItem(`liked_article_${artId}`); } catch (err) {}
      } else {
        next.add(artId);
        try { localStorage.setItem(`liked_article_${artId}`, "true"); } catch (err) {}
      }
      return next;
    });

    try {
      const res = await apiFetch(`/api/articles/${artId}/like`, {
        method: "POST",
        body: JSON.stringify({ action: isLiked ? "unlike" : "like" }),
      });
      if (res.success && typeof res.likesCount === "number") {
        setLikesMap((prev) => ({ ...prev, [artId]: res.likesCount }));
      }
    } catch (err) {
      console.error("Like action failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-4">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          {lang === "hi" ? "खबरें लोड हो रही हैं..." : "Loading The Swar Media Headlines..."}
        </p>
      </div>
    );
  }

  const mainLead = leadArticles[0];
  const sideLeads = leadArticles.slice(1, 5);

  return (
    <div className="w-full space-y-0">
      {/* 2. 3-COLUMN LAYOUT: LEFT & RIGHT STICKY, CENTER SCROLLS (LEFT COMPACT 2-COLS, CENTER EXPANDED 7-COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-start w-full">
        {/* ============================================================== */}
        {/* COLUMN 1: LEFT SIDEBAR - FIXED ON DESKTOP (Categories)         */}
        {/* ============================================================== */}
        <aside className="hidden lg:block lg:col-span-2 lg:sticky lg:top-[96px] lg:h-[calc(100vh-96px)] overflow-y-auto no-scrollbar self-start z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
          <div className="p-2 sm:p-2.5 space-y-3">
            {/* 1. Categories Header */}
            <div className="flex items-center justify-between pb-2 mb-1 border-b border-amber-200/60 dark:border-amber-900/40">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <h2 className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white tracking-wide uppercase">
                  विषय (CATEGORIES)
                </h2>
              </div>
            </div>

            {/* Topics Filter Navigation */}
            <div className="space-y-0.5">
              {/* Option 1: Top News (Default) */}
              <button
                type="button"
                onClick={() => setSelectedTopic("all")}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  selectedTopic === "all"
                    ? "bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-slate-900 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-xs"
                    : "text-slate-700 dark:text-slate-300 hover:bg-amber-50/60 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Flame className={`w-3.5 h-3.5 shrink-0 ${selectedTopic === "all" ? "text-amber-500 fill-amber-500" : "text-slate-400"}`} />
                  <span className="truncate">टॉप न्यूज़</span>
                </div>
                {selectedTopic === "all" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
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
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-slate-900 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-xs font-black"
                        : "text-slate-700 dark:text-slate-300 hover:bg-amber-50/60 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-amber-600 dark:text-amber-400" : "text-slate-400"}`} />
                      <span className="truncate">{label}</span>
                    </div>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* ============================================================== */}
        {/* COLUMN 2: CENTER - NEWS FEED (EXPANDED TO 7 COLS)              */}
        {/* ============================================================== */}
        <main className="lg:col-span-7 space-y-4 min-w-0 px-3 sm:px-4 py-3 bg-slate-50 dark:bg-slate-950">
          {/* Mobile Filter & Trending Strip (Swarnim Dastavej Style - Mobile Only) */}
          <div className="lg:hidden flex items-center justify-between gap-2.5 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-amber-200/60 dark:border-slate-800 shadow-xs">
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-600 hover:to-yellow-500 active:scale-95 shadow-sm ring-1 ring-amber-400/80 transition-all cursor-pointer shrink-0"
              title="विषय एवं फ़िल्टर"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>फ़िल्टर</span>
            </button>

            {/* Mobile Trending Strip */}
            <div className="flex-1 flex items-center gap-1.5 text-xs overflow-hidden truncate">
              <span className="text-red-600 font-extrabold shrink-0 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-red-600 text-red-600" />
                <span>ट्रेंडिंग:</span>
              </span>
              <span className="text-slate-700 dark:text-slate-300 font-semibold truncate">
                {trendingArticles[0]?.title || "ताज़ा जमीनी खबरें एवं अपडेट्स"}
              </span>
            </div>
          </div>
          {/* Top Featured Lead Story (integrated into center column) */}
          {selectedTopic === "all" && mainLead && (
            <Link
              href={`/${mainLead.category?.slug || "news"}/${mainLead.slug}`}
              className="group block relative rounded-3xl overflow-hidden bg-slate-900 shadow-sm hover:shadow-xl transition-all border border-amber-300/40 dark:border-slate-800 hover:border-amber-400"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden">
                <img
                  src={
                    mainLead.featuredImage?.url ||
                    "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80"
                  }
                  alt={mainLead.title}
                  className="w-full h-full object-cover object-top sm:object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none" />
                <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 shadow-md ring-1 ring-amber-400">
                  {lang === "hi" && mainLead.category?.nameHi ? mainLead.category.nameHi : mainLead.category?.name}
                </span>
                {mainLead.location && (
                  <span className="absolute top-3.5 right-3.5 px-2.5 py-1 rounded-lg text-[10px] font-bold text-amber-300 bg-[#070e1e]/85 backdrop-blur-md border border-amber-400/50 shadow">
                    📍 {mainLead.location}
                  </span>
                )}
                <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 space-y-1.5 text-white">
                  <h2 className="text-base sm:text-xl font-black leading-snug tracking-tight group-hover:text-amber-300 transition-colors line-clamp-2">
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
          <div className="flex items-center justify-between pb-2 border-b-2 border-amber-500">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
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
                const isArtLiked = likedArticles.has(art._id);
                const artLikesCount = likesMap[art._id] ?? art.likesCount ?? 0;

                return (
                  <article
                    key={art._id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 p-4 sm:p-5 shadow-xs hover:shadow-lg hover:border-amber-400/80 transition-all group flex flex-col sm:flex-row gap-4 sm:gap-5"
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
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-[#070e1e]/85 backdrop-blur-md text-amber-300 font-extrabold text-[11px] rounded-lg border border-amber-400/40 shadow-md">
                        {art.location || (catSlug === "state-city" ? "राज्य-शहर" : catLabel)}
                      </span>
                    </Link>

                    {/* Right: Info, Headline, Excerpt & Actions */}
                    <div className="flex-1 flex flex-col justify-between space-y-2 min-w-0">
                      <div className="space-y-1.5">
                        {/* Category & Desk */}
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-extrabold text-amber-600 dark:text-amber-400 capitalize">
                            {catSlug}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500 text-[11px]">
                            {art.author?.name || "Editorial Desk"}
                          </span>
                        </div>

                        {/* Bold Red / Gold Headline */}
                        <Link href={`/${catSlug}/${art.slug}`}>
                          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 leading-snug line-clamp-2 transition-colors">
                            {art.title}
                          </h3>
                        </Link>

                        {/* Summary / Excerpt */}
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {art.excerpt || art.subtitle || (art.content ? art.content.replace(/<[^>]+>/g, "").slice(0, 130) + "..." : "")}
                        </p>
                      </div>

                      {/* Footer Actions: Reading time, Like, Comment, Bookmark, Share, Read more */}
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                        <div className="flex items-center gap-2.5 sm:gap-3.5">
                          <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{art.readingTime || 2} मिनट</span>
                          </span>

                          {/* Reader Like Button */}
                          <button
                            type="button"
                            onClick={(e) => handleLikeArticle(e, art)}
                            className={`flex items-center gap-1 text-[11px] font-bold transition-all py-0.5 px-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer ${
                              isArtLiked ? "text-red-600 bg-red-50/80 dark:bg-red-950/40" : "text-slate-600 dark:text-slate-400 hover:text-red-600"
                            }`}
                            title={isArtLiked ? "पसंद किया (Liked)" : "पसंद करें (Like)"}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isArtLiked ? "fill-red-600 text-red-600" : ""}`} />
                            <span>{artLikesCount}</span>
                          </button>

                          {/* Reader Comment Button */}
                          <Link
                            href={`/${catSlug}/${art.slug}#comments`}
                            className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 hover:text-amber-600 transition-colors py-0.5 px-1.5 rounded-lg hover:bg-amber-50/50 dark:hover:bg-slate-800"
                            title="टिप्पणी करें या पढ़ें"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                            <span>टिप्पणी</span>
                          </Link>
                        </div>

                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <button
                            type="button"
                            onClick={() => toggleBookmark(art._id)}
                            className={`p-1 transition-colors ${isSaved ? "text-amber-500" : "hover:text-amber-500"}`}
                            title="Bookmark"
                          >
                            <Bookmark className={`w-4 h-4 ${isSaved ? "fill-amber-500 text-amber-500" : ""}`} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleShareArticle(art)}
                            className="p-1 hover:text-amber-500 transition-colors"
                            title="Share"
                          >
                            {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                          </button>

                          <Link
                            href={`/${catSlug}/${art.slug}`}
                            className="font-black text-amber-600 dark:text-amber-400 flex items-center gap-0.5 hover:translate-x-0.5 transition-transform"
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
        {/* COLUMN 3: RIGHT SIDEBAR - FIXED ON DESKTOP (Ads & Trending)    */}
        {/* ============================================================== */}
        <aside className="lg:col-span-3 lg:sticky lg:top-[96px] lg:h-[calc(100vh-96px)] overflow-y-auto no-scrollbar self-start z-10 bg-white dark:bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800">
          <div className="p-3 sm:p-4 space-y-4">
            {/* 1. Sponsored Ad Slider Card (Full height / carousel) */}
            <AdSlot slot="sidebar" />

            {/* 2. Trending / Most Read Widget */}
            {trendingArticles.length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-amber-200/50 dark:border-slate-800">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-500" />
                    <span>{t("mostRead")}</span>
                  </h3>
                  <span className="text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-300/60 dark:bg-amber-950/40 dark:text-amber-300 px-2 py-0.5 rounded-full uppercase">
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
                          idx === 0
                            ? "text-amber-500"
                            : idx === 1
                            ? "text-red-600"
                            : idx === 2
                            ? "text-blue-600"
                            : "text-slate-400"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                          {art.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 block">
                          {art.category?.name || "न्यूज़"} • {art.readingTime || 2} मिनट
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

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

      {/* Mobile Filter Drawer (Opens when user taps mobile "फ़िल्टर" button) */}
      <FilterDrawer
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        onSelectCategory={(slug) => setSelectedTopic(slug)}
        selectedCategory={selectedTopic}
      />
    </div>
  );
}
