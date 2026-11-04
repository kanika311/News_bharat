"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Video,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  Play,
  ExternalLink,
  Eye,
  Search,
  Filter,
  Share2,
  CheckCircle2,
  X,
  Clock,
  Sparkles,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import ConfirmModal from "@/components/admin/ConfirmModal";

export default function AdminVideosListPage() {
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Modals
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });
  const [previewVideo, setPreviewVideo] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2800);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [vRes, cRes] = await Promise.all([
        apiFetch("/api/videos"),
        apiFetch("/api/categories"),
      ]);
      if (vRes.success) setVideos(vRes.videos || []);
      if (cRes.success) setCategories(cRes.categories || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const confirmDelete = async () => {
    const idToDelete = confirmModal.id;
    if (!idToDelete) return;
    try {
      const res = await apiFetch(`/api/videos/${idToDelete}`, { method: "DELETE" });
      if (res && res.success === false) {
        throw new Error(res.message || "Failed to delete video");
      }
      setVideos((prev) => prev.filter((v) => v._id !== idToDelete));
      setConfirmModal({ isOpen: false, id: null });
      showToast("वीडियो सफलतापूर्वक हटा दिया गया।");
    } catch (e) {
      console.error("Delete video error:", e);
      alert("Error deleting video: " + (e.message || "Could not delete video."));
      setConfirmModal({ isOpen: false, id: null });
    }
  };

  // Social Share Handlers
  const handleShareFacebook = (v) => {
    const shareUrl = `${window.location.origin}/videos`;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(
        v.titleHi || v.title
      )}`,
      "_blank",
      "width=600,height=500"
    );
  };

  const handleShareInstagram = (v) => {
    const textToCopy = `${v.titleHi || v.title}\n\nपूरी वीडियो देखने के लिए स्वर मीडिया पर जाएं:\n${window.location.origin}/videos\n\n#SwarMedia #News #BreakingNews`;
    navigator.clipboard.writeText(textToCopy);
    showToast("इंस्टाग्राम कैप्शन और लिंक क्लिपबोर्ड में कॉपी हो गया!");
  };

  const handleShareYouTube = (v) => {
    if (v.videoUrl && (v.videoUrl.includes("youtube.com") || v.videoUrl.includes("youtu.be"))) {
      window.open(v.videoUrl, "_blank");
    } else if (v.socialLinks?.youtube) {
      window.open(v.socialLinks.youtube, "_blank");
    } else {
      window.open("https://www.youtube.com", "_blank");
    }
  };

  const handleShareTelegram = (v) => {
    const shareUrl = `${window.location.origin}/videos`;
    const text = `${v.titleHi || v.title}\n\nस्वर मीडिया न्यूज़ बुलेटिन:`;
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  const handleShareWhatsApp = (v) => {
    const shareUrl = `${window.location.origin}/videos`;
    const text = `*${v.titleHi || v.title}*\n\nस्वर मीडिया पर यह वीडियो बुलेटिन देखें:\n${shareUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  // Filtered Videos
  const filteredVideos = videos.filter((v) => {
    const matchesSearch =
      !search ||
      v.title?.toLowerCase().includes(search.toLowerCase()) ||
      v.titleHi?.includes(search);
    const matchesCategory =
      !categoryFilter ||
      (v.category?._id || v.category) === categoryFilter ||
      v.category?.slug === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header with + Add Video Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/30">
              <Video className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Video Stories & Bulletins
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Embed YouTube reports, news studio clips, ground coverage, and video bulletins
          </p>
        </div>

        {/* Link to New Page Creator */}
        <Link
          href="/swar-media-admin/videos/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-red-600/30 transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Video</span>
        </Link>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search videos by headline..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.nameHi || c.name})
              </option>
            ))}
          </select>

          <span className="text-xs font-bold text-slate-500 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0">
            Total: {filteredVideos.length}
          </span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* HORIZONTAL VIDEOS LIST (Sleek Horizontal Card Rows)            */}
      {/* ============================================================== */}
      {loading ? (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-semibold">Loading video library...</p>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <Video className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No videos found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click "+ Add New Video" to publish your first video news bulletin with media upload and auto WebP compression.
          </p>
          <Link
            href="/swar-media-admin/videos/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Video</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredVideos.map((vid) => (
            <div
              key={vid._id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
            >
              {/* Left: Thumbnail & Duration */}
              <div
                onClick={() => setPreviewVideo(vid)}
                className="relative w-full lg:w-56 aspect-video bg-black rounded-xl overflow-hidden shrink-0 group cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <img
                  src={
                    vid.thumbnail ||
                    "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=600&q=80"
                  }
                  alt={vid.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                  <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  </div>
                </div>
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-mono font-bold">
                  {vid.duration || "03:15"}
                </span>
              </div>

              {/* Center: Metadata & Headlines */}
              <div className="flex-1 min-w-0 space-y-1.5 w-full">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/60">
                    {vid.category?.name || "News"}
                  </span>
                  {vid.isFeatured && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                      ★ Featured
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(vid.createdAt).toLocaleDateString("hi-IN")}</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-bold">
                    • {(vid.views || 0).toLocaleString()} Views
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white line-clamp-1">
                  {vid.titleHi || vid.title}
                </h3>
                {vid.titleHi && vid.title && vid.titleHi !== vid.title && (
                  <p className="text-xs text-slate-500 line-clamp-1 font-medium">
                    {vid.title}
                  </p>
                )}

                <p className="text-[10px] text-slate-400 truncate font-mono">
                  Source: {vid.videoUrl}
                </p>
              </div>

              {/* Right: Actions & Social Share Suite */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 shrink-0 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                {/* Action Buttons: View, Edit, Delete */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewVideo(vid)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
                    title="Play Preview"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>

                  <Link
                    href={`/swar-media-admin/videos/edit/${vid._id}`}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 transition-colors"
                    title="Edit Video"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setConfirmModal({ isOpen: true, id: vid._id })}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 transition-colors"
                    title="Delete Video"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>

                {/* Social Share Suite */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
                    Share:
                  </span>

                  {/* Facebook */}
                  <button
                    type="button"
                    onClick={() => handleShareFacebook(vid)}
                    className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-xs"
                    title="Share on Facebook"
                  >
                    <span className="font-bold text-xs">f</span>
                  </button>

                  {/* Instagram */}
                  <button
                    type="button"
                    onClick={() => handleShareInstagram(vid)}
                    className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-xs"
                    title="Copy for Instagram"
                  >
                    <span className="font-bold text-[10px]">IG</span>
                  </button>

                  {/* YouTube */}
                  <button
                    type="button"
                    onClick={() => handleShareYouTube(vid)}
                    className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-xs"
                    title="Open on YouTube"
                  >
                    <Play className="w-3 h-3 fill-white ml-0.5" />
                  </button>

                  {/* Telegram */}
                  <button
                    type="button"
                    onClick={() => handleShareTelegram(vid)}
                    className="w-7 h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-xs"
                    title="Share on Telegram"
                  >
                    <span className="font-bold text-[10px]">TG</span>
                  </button>

                  {/* WhatsApp */}
                  <button
                    type="button"
                    onClick={() => handleShareWhatsApp(vid)}
                    className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-xs"
                    title="Share on WhatsApp"
                  >
                    <span className="font-bold text-[10px]">WA</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Video?"
        message="Are you sure you want to permanently delete this video clip from Swar Media?"
        confirmText="Delete Video"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmModal({ isOpen: false, id: null })}
      />

      {/* Quick Video Player Preview Modal */}
      {previewVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewVideo(null)}
        >
          <div
            className="bg-slate-900 text-white rounded-3xl overflow-hidden max-w-3xl w-full border border-slate-800 shadow-2xl space-y-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 flex items-center justify-between border-b border-slate-800">
              <h3 className="text-sm font-bold truncate pr-4">
                {previewVideo.titleHi || previewVideo.title}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewVideo(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video w-full bg-black">
              {previewVideo.videoUrl.startsWith("/uploads/") ||
              previewVideo.videoUrl.match(/\.(mp4|webm|mov)$/i) ? (
                <video
                  src={previewVideo.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <iframe
                  src={
                    previewVideo.videoUrl.includes("youtube.com/watch?v=")
                      ? previewVideo.videoUrl.replace("watch?v=", "embed/") + "?autoplay=1"
                      : previewVideo.videoUrl.includes("youtu.be/")
                      ? `https://www.youtube.com/embed/${previewVideo.videoUrl.split("youtu.be/")[1]}?autoplay=1`
                      : previewVideo.videoUrl
                  }
                  title={previewVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>

            <div className="p-4 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
              <span>Duration: {previewVideo.duration || "03:15"}</span>
              <a
                href={previewVideo.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-red-400 hover:underline flex items-center gap-1 font-bold"
              >
                <span>Direct URL</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
