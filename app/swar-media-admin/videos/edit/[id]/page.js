"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Video,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import ImageUploader from "@/components/admin/ImageUploader";
import VideoUploader from "@/components/admin/VideoUploader";

export default function EditVideoPage() {
  const router = useRouter();
  const params = useParams();
  const videoId = params?.id;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [titleHi, setTitleHi] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("03:15");
  const [isFeatured, setIsFeatured] = useState(false);

  // Social Links
  const [fbLink, setFbLink] = useState("");
  const [instaLink, setInstaLink] = useState("");
  const [ytLink, setYtLink] = useState("");
  const [tgLink, setTgLink] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [cRes, vRes] = await Promise.all([
          apiFetch("/api/categories"),
          apiFetch("/api/videos"),
        ]);

        if (cRes.success) setCategories(cRes.categories || []);

        if (vRes.success && vRes.videos) {
          const current = vRes.videos.find((v) => v._id === videoId);
          if (current) {
            setTitle(current.title || "");
            setTitleHi(current.titleHi || current.title || "");
            setVideoUrl(current.videoUrl || "");
            setThumbnail(current.thumbnail || "");
            setCategory(current.category?._id || current.category || "");
            setDuration(current.duration || "03:15");
            setIsFeatured(Boolean(current.isFeatured));
            if (current.socialLinks) {
              setFbLink(current.socialLinks.facebook || "");
              setInstaLink(current.socialLinks.instagram || "");
              setYtLink(current.socialLinks.youtube || "");
              setTgLink(current.socialLinks.telegram || "");
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (videoId) loadData();
  }, [videoId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !videoUrl.trim()) {
      setError("Please provide a title and video source/URL.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        title: title.trim(),
        titleHi: titleHi.trim() || title.trim(),
        videoUrl: videoUrl.trim(),
        thumbnail: thumbnail.trim(),
        category: category || null,
        duration: duration.trim() || "03:15",
        isFeatured: Boolean(isFeatured),
        socialLinks: {
          facebook: fbLink.trim(),
          instagram: instaLink.trim(),
          youtube: ytLink.trim(),
          telegram: tgLink.trim(),
        },
      };

      const res = await apiFetch(`/api/videos/${videoId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/swar-media-admin/videos");
        }, 800);
      } else {
        setError(res.message || "Failed to update video");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header & Back Button */}
      <div className="flex items-center justify-between">
        <Link
          href="/swar-media-admin/videos"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-red-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Videos</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
                <Video className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white">
                Edit Video Bulletin
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Modify video title, media source, and WebP compressed thumbnail
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
            <span>Video updated successfully! Redirecting...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Headlines */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Headline (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Headline (Hindi)
              </label>
              <input
                type="text"
                value={titleHi}
                onChange={(e) => setTitleHi(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Video Source Uploader */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Video Source (वीडियो अपलोड या मीडिया से चुनें) <span className="text-red-500">*</span>
            </label>
            <VideoUploader
              value={videoUrl}
              onChange={(url) => setVideoUrl(url)}
              onDurationDetected={(dur) => setDuration(dur)}
            />
          </div>

          {/* Thumbnail Uploader with Auto WebP Conversion */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Custom Thumbnail (Auto WebP Compressed)
              </label>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Auto WebP Sharp Conversion</span>
              </span>
            </div>
            <ImageUploader
              value={thumbnail}
              onChange={(url) => setThumbnail(url)}
              label="Thumbnail"
            />
          </div>

          {/* Category & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
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
                Duration (mm:ss)
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-red-500 font-mono"
              />
            </div>
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <input
              type="checkbox"
              id="isFeaturedEdit"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 text-red-600 rounded focus:ring-red-500 cursor-pointer"
            />
            <label htmlFor="isFeaturedEdit" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
              Mark as Featured Video Story
            </label>
          </div>

          {/* Social Media Link Overrides (Optional) */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Social Media Distribution Channels (Optional)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <input
                type="url"
                value={fbLink}
                onChange={(e) => setFbLink(e.target.value)}
                placeholder="Facebook Video Post URL..."
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
              />
              <input
                type="url"
                value={instaLink}
                onChange={(e) => setInstaLink(e.target.value)}
                placeholder="Instagram Reel / Post URL..."
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
              />
              <input
                type="url"
                value={ytLink}
                onChange={(e) => setYtLink(e.target.value)}
                placeholder="YouTube Channel / Video URL..."
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
              />
              <input
                type="url"
                value={tgLink}
                onChange={(e) => setTgLink(e.target.value)}
                placeholder="Telegram Post / Channel URL..."
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <Link
              href="/swar-media-admin/videos"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-600/30 transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

