"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Clock,
  Sparkles,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import RichTextEditor from "./RichTextEditor";
import ImageUploader from "./ImageUploader";

export default function ArticleForm({ initialData = null, isEdit = false }) {
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState(initialData?.title || "");
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [language, setLanguage] = useState(initialData?.language || "hi");
  const [content, setContent] = useState(initialData?.content || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [category, setCategory] = useState(initialData?.category?._id || initialData?.category || "");
  const [subCategory, setSubCategory] = useState(initialData?.subCategory?._id || initialData?.subCategory || "");
  const [tags, setTags] = useState(
    initialData?.tags?.map((t) => (typeof t === "object" ? t._id : t)) || []
  );
  const [featuredImage, setFeaturedImage] = useState(
    initialData?.featuredImage || { url: "", caption: "", alt: "" }
  );
  const [status, setStatus] = useState(initialData?.status || "draft");
  const [scheduledAt, setScheduledAt] = useState(
    initialData?.scheduledAt ? new Date(initialData.scheduledAt).toISOString().slice(0, 16) : ""
  );

  // Flags
  const [isBreaking, setIsBreaking] = useState(Boolean(initialData?.isBreaking));
  const [isFeatured, setIsFeatured] = useState(Boolean(initialData?.isFeatured));
  const [isTrending, setIsTrending] = useState(Boolean(initialData?.isTrending));
  const [isTopStory, setIsTopStory] = useState(Boolean(initialData?.isTopStory));

  // SEO Fields
  const [metaTitle, setMetaTitle] = useState(initialData?.seo?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(initialData?.seo?.metaDescription || "");
  const [keywords, setKeywords] = useState(initialData?.seo?.keywords?.join(", ") || "");

  // Metadata Dropdowns
  const [categoriesList, setCategoriesList] = useState([]);
  const [tagsList, setTagsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Fetch categories and tags
    Promise.all([
      apiFetch("/api/categories"),
      apiFetch("/api/tags"),
    ])
      .then(([cats, tgs]) => {
        if (cats.success) setCategoriesList(cats.categories || []);
        if (tgs.success) setTagsList(tgs.tags || []);
      })
      .catch((err) => console.error("Error loading categories/tags", err));
  }, []);

  const handleTitleBlur = () => {
    if (!slug && title) {
      // Auto-generate basic slug preview if empty
      const clean = title
        .toLowerCase()
        .replace(/[^a-z0-9\u0900-\u097F\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      setSlug(clean);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!title.trim() || !content.trim() || !category) {
      setError("Title, content, and category are required.");
      setLoading(false);
      return;
    }

    const payload = {
      title,
      subtitle,
      slug: slug || undefined,
      language,
      content,
      excerpt: excerpt || title,
      category,
      subCategory: subCategory || null,
      tags,
      featuredImage,
      status,
      scheduledAt: status === "scheduled" && scheduledAt ? new Date(scheduledAt) : null,
      isBreaking,
      isFeatured,
      isTrending,
      isTopStory,
      seo: {
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt || title,
        keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
      },
    };

    try {
      if (isEdit && initialData?._id) {
        await apiFetch(`/api/articles/${initialData._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setSuccess("Article successfully updated!");
      } else {
        const res = await apiFetch("/api/articles", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setSuccess("Article successfully created!");
        setTimeout(() => {
          router.push("/admin/articles");
        }, 1000);
      }
    } catch (err) {
      setError(err.message || "Failed to save article");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles"
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              {isEdit ? "Edit Article" : "Create New Story"}
            </h1>
            <p className="text-xs text-slate-500">
              {isEdit ? `ID: ${initialData?._id}` : "Publish breaking news or draft for review"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles"
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-600/30 transition-all disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isEdit ? "Update Article" : "Save Article"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 text-xs text-red-700 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 text-xs text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Headline / Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                placeholder="Enter bold, captivating news headline..."
                className="w-full px-4 py-3 text-base font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Subheading / Deck
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Key takeaway or secondary headline..."
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                URL Slug (Auto-generated or custom)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="news-article-slug-format"
                className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-600 dark:text-slate-400"
              />
            </div>

            {/* Rich Content Editor */}
            <RichTextEditor value={content} onChange={setContent} />

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Excerpt / Summary (Displays on cards and social shares)
              </label>
              <textarea
                rows={3}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Short, punchy 1-2 sentence article summary..."
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-900 dark:text-white resize-y"
              />
            </div>
          </div>

          {/* SEO Metadata Box */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red-500" />
              <span>Search Engine Optimization (SEO & Social Graph)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Defaults to article headline"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Keywords (comma separated)
                </label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="india, politics, breaking news"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Meta Description
              </label>
              <textarea
                rows={2}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Google search result snippet..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Controls (1 col) */}
        <div className="space-y-6">
          {/* Publication Status Box */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Publication Settings
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Editorial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 text-slate-800 dark:text-slate-100"
              >
                <option value="draft">Draft (Private)</option>
                <option value="pending">Pending Editorial Review</option>
                <option value="published">Published (Public)</option>
                <option value="scheduled">Scheduled for Later</option>
              </select>
            </div>

            {status === "scheduled" && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60">
                <label className="block text-xs font-semibold text-amber-900 dark:text-amber-200 mb-1">
                  Schedule Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-lg text-slate-800 dark:text-white"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Language
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLanguage("hi")}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    language === "hi"
                      ? "bg-red-600 text-white border-red-600 shadow-sm shadow-red-600/30"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  हिन्दी (Hindi)
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    language === "en"
                      ? "bg-red-600 text-white border-red-600 shadow-sm shadow-red-600/30"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  English
                </button>
              </div>
            </div>
          </div>

          {/* Editorial Highlights Flags */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Display Badges & Placement
            </h3>

            <label className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer">
              <input
                type="checkbox"
                checked={isBreaking}
                onChange={(e) => setIsBreaking(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">Breaking News</span>
                <p className="text-[10px] text-slate-400">Shows flashing red badge & ticker</p>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer">
              <input
                type="checkbox"
                checked={isTopStory}
                onChange={(e) => setIsTopStory(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">Top Lead Story</span>
                <p className="text-[10px] text-slate-400">Hero position on homepage</p>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">Featured Article</span>
                <p className="text-[10px] text-slate-400">Highlighted in grid carousels</p>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer">
              <input
                type="checkbox"
                checked={isTrending}
                onChange={(e) => setIsTrending(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">Trending Sidebar</span>
                <p className="text-[10px] text-slate-400">Right sidebar viral ranking</p>
              </div>
            </label>
          </div>

          {/* Category & Tags Box */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Categorization
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 text-slate-800 dark:text-slate-100"
              >
                <option value="">Select Category</option>
                {categoriesList.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name} ({cat.nameHi})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Associated Tags
              </label>
              <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 max-h-36 overflow-y-auto">
                {tagsList.map((tag) => {
                  const selected = tags.includes(tag._id);
                  return (
                    <button
                      key={tag._id}
                      type="button"
                      onClick={() => {
                        if (selected) {
                          setTags(tags.filter((t) => t !== tag._id));
                        } else {
                          setTags([...tags, tag._id]);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        selected
                          ? "bg-red-600 text-white"
                          : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      #{tag.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Featured Image Box */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <ImageUploader
              value={featuredImage?.url}
              onChange={(url) => setFeaturedImage({ ...featuredImage, url })}
              label="Primary Featured Media"
            />

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Image Caption / Credit
              </label>
              <input
                type="text"
                value={featuredImage?.caption || ""}
                onChange={(e) => setFeaturedImage({ ...featuredImage, caption: e.target.value })}
                placeholder="Photo Credit / Agency / Caption"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
