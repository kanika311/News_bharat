"use client";

import React, { useState, useEffect } from "react";
import { Video, Plus, Trash2, Edit2, Loader2, Save, Play, ExternalLink } from "lucide-react";
import { apiFetch } from "@/lib/api";
import ImageUploader from "@/components/admin/ImageUploader";
import ConfirmModal from "@/components/admin/ConfirmModal";

export default function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [title, setTitle] = useState("");
  const [titleHi, setTitleHi] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("03:15");
  const [isFeatured, setIsFeatured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });

  const loadData = async () => {
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

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setTitleHi("");
    setVideoUrl("");
    setThumbnail("");
    setCategory("");
    setDuration("03:15");
    setIsFeatured(false);
    setError("");
  };

  const handleEdit = (v) => {
    setEditingId(v._id);
    setTitle(v.title);
    setTitleHi(v.titleHi || v.title);
    setVideoUrl(v.videoUrl);
    setThumbnail(v.thumbnail || "");
    setCategory(v.category?._id || v.category || "");
    setDuration(v.duration || "03:15");
    setIsFeatured(Boolean(v.isFeatured));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !videoUrl) {
      setError("Title and video URL are required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        titleHi: titleHi || title,
        videoUrl,
        thumbnail,
        category: category || null,
        duration,
        isFeatured,
      };

      if (editingId) {
        await apiFetch(`/api/videos/${editingId}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await apiFetch("/api/videos", { method: "POST", body: JSON.stringify(payload) });
      }
      resetForm();
      loadData();
    } catch (err) {
      setError(err.message || "Failed to save video");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await apiFetch(`/api/videos/${confirmModal.id}`, { method: "DELETE" });
      setConfirmModal({ isOpen: false, id: null });
      loadData();
    } catch (e) {
      alert("Error deleting video");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Video Stories & Bulletins
        </h1>
        <p className="text-xs text-slate-500">
          Embed YouTube reports, news studio clips, and ground coverage
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs h-fit space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            {editingId ? "Edit Video Clip" : "Add Video Clip"}
          </h2>

          {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Headline (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="News report headline..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Headline (Hindi)
              </label>
              <input
                type="text"
                value={titleHi}
                onChange={(e) => setTitleHi(e.target.value)}
                placeholder="वीडियो शीर्षक..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 font-hindi"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Video Embed URL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Duration (mm:ss)
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="03:45"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <ImageUploader value={thumbnail} onChange={setThumbnail} label="Custom Thumbnail" />

            <label className="flex items-center gap-2 pt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Feature prominently in Video hub
              </span>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-600/30 flex items-center justify-center gap-2 transition-all"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{editingId ? "Update Video" : "Publish Video"}</span>
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <p className="text-xs text-slate-400 p-4">Loading videos...</p>
          ) : videos.length === 0 ? (
            <p className="text-xs text-slate-400 p-4">No videos added yet.</p>
          ) : (
            videos.map((vid) => (
              <div
                key={vid._id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs group"
              >
                <div className="relative h-40 bg-slate-800">
                  <img
                    src={vid.thumbnail || "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=600&q=80"}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 ml-0.5 fill-white" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-white text-[10px] font-mono font-bold">
                    {vid.duration}
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                    {vid.title}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{vid.category?.name || "News"}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(vid)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirmModal({ isOpen: true, id: vid._id })}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Video?"
        message="Are you sure you want to delete this video story?"
        onConfirm={confirmDelete}
        onClose={() => setConfirmModal({ isOpen: false, id: null })}
      />
    </div>
  );
}
