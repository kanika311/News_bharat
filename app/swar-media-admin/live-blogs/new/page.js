"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Flame,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import ImageUploader from "@/components/admin/ImageUploader";

export default function AddNewLiveBlogPage() {
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState("");
  const [titleHi, setTitleHi] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("live");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    apiFetch("/api/categories")
      .then((res) => {
        if (res.success && res.categories) {
          setCategories(res.categories);
          if (res.categories.length > 0) setCategory(res.categories[0]._id);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide a title for the live blog.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        title: title.trim(),
        titleHi: titleHi.trim() || title.trim(),
        coverImage: coverImage.trim(),
        category: category || null,
        status,
      };

      const res = await apiFetch("/api/live-blogs", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/swar-media-admin/live-blogs");
        }, 800);
      } else {
        setError(res.message || "Failed to create live blog");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header & Back Button */}
      <div className="flex items-center justify-between">
        <Link
          href="/swar-media-admin/live-blogs"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-amber-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Live Blogs</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black">
                <Flame className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white">
                Start New Live Blog
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Create a real-time event coverage desk with automatic WebP compressed cover media
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-700 dark:text-red-300 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Live blog created successfully! Redirecting...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Headlines */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Live Blog Title (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Budget 2026 Parliament Live Coverage..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Live Blog Title (Hindi)
              </label>
              <input
                type="text"
                value={titleHi}
                onChange={(e) => setTitleHi(e.target.value)}
                placeholder="बजट सत्र 2026: पल-पल की ताजा खबरें..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.nameHi || c.name})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              >
                <option value="live">🔴 Active Live Coverage</option>
                <option value="ended">⚪ Ended / Concluded</option>
              </select>
            </div>
          </div>

          {/* Cover Banner with Auto WebP Conversion */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Cover Banner (Auto WebP Compressed)
              </label>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Auto WebP Sharp Conversion</span>
              </span>
            </div>
            <ImageUploader
              value={coverImage}
              onChange={(url) => setCoverImage(url)}
              label="Cover Image"
            />
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <Link
              href="/swar-media-admin/live-blogs"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-amber-500/30 transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Launch Live Blog</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

