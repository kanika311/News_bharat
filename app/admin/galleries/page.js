"use client";

import React, { useState, useEffect } from "react";
import { Image as ImageIcon, Plus, Trash2, Edit2, Loader2, Save, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import ImageUploader from "@/components/admin/ImageUploader";
import ConfirmModal from "@/components/admin/ConfirmModal";

export default function GalleriesPage() {
  const [galleries, setGalleries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [title, setTitle] = useState("");
  const [titleHi, setTitleHi] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [photos, setPhotos] = useState([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newPhotoCaption, setNewPhotoCaption] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });

  const loadData = async () => {
    try {
      const [gRes, cRes] = await Promise.all([
        apiFetch("/api/galleries"),
        apiFetch("/api/categories"),
      ]);
      if (gRes.success) setGalleries(gRes.galleries || []);
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
    setCoverImage("");
    setDescription("");
    setCategory("");
    setPhotos([]);
    setError("");
  };

  const handleEdit = (g) => {
    setEditingId(g._id);
    setTitle(g.title);
    setTitleHi(g.titleHi || g.title);
    setCoverImage(g.coverImage || "");
    setDescription(g.description || "");
    setCategory(g.category?._id || g.category || "");
    setPhotos(g.photos || []);
  };

  const addPhotoToGallery = () => {
    if (!newPhotoUrl) return;
    setPhotos([...photos, { url: newPhotoUrl, caption: newPhotoCaption }]);
    setNewPhotoUrl("");
    setNewPhotoCaption("");
  };

  const removePhoto = (idx) => {
    setPhotos(photos.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !coverImage) {
      setError("Title and cover image are required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        titleHi: titleHi || title,
        coverImage,
        description,
        category: category || null,
        photos,
      };

      if (editingId) {
        await apiFetch(`/api/galleries/${editingId}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await apiFetch("/api/galleries", { method: "POST", body: JSON.stringify(payload) });
      }
      resetForm();
      loadData();
    } catch (err) {
      setError(err.message || "Failed to save gallery");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await apiFetch(`/api/galleries/${confirmModal.id}`, { method: "DELETE" });
      setConfirmModal({ isOpen: false, id: null });
      loadData();
    } catch (e) {
      alert("Error deleting gallery");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Photo Galleries & Visual Essays
        </h1>
        <p className="text-xs text-slate-500">
          Create rich multi-image news stories with high-resolution slides and captions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs h-fit space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {editingId ? "Edit Photo Gallery" : "Create Photo Gallery"}
            </h2>
            {editingId && (
              <button onClick={resetForm} className="text-xs text-slate-400 hover:text-slate-600">
                Cancel
              </button>
            )}
          </div>

          {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Gallery Title (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="In Photos: Mega Cultural Festival..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Gallery Title (Hindi)
              </label>
              <input
                type="text"
                value={titleHi}
                onChange={(e) => setTitleHi(e.target.value)}
                placeholder="तस्वीरों में देखिए..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 font-hindi"
              />
            </div>

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

            <ImageUploader value={coverImage} onChange={setCoverImage} label="Cover Photograph" />

            {/* Photo Slides List */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Gallery Slides ({photos.length})
              </label>

              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {photos.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs"
                  >
                    <img src={p.url} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                    <span className="truncate flex-1 text-slate-700 dark:text-slate-300">
                      {p.caption || `Slide ${idx + 1}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add slide row */}
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2">
                <input
                  type="text"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  placeholder="Image URL for new slide..."
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
                <input
                  type="text"
                  value={newPhotoCaption}
                  onChange={(e) => setNewPhotoCaption(e.target.value)}
                  placeholder="Slide caption..."
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
                <button
                  type="button"
                  onClick={addPhotoToGallery}
                  className="w-full py-1.5 text-xs font-semibold text-slate-700 bg-white dark:bg-slate-700 dark:text-white rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100"
                >
                  + Add Slide
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-600/30 flex items-center justify-center gap-2 transition-all"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{editingId ? "Update Gallery" : "Publish Gallery"}</span>
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <p className="text-xs text-slate-400 p-4">Loading galleries...</p>
          ) : galleries.length === 0 ? (
            <p className="text-xs text-slate-400 p-4">No photo galleries yet.</p>
          ) : (
            galleries.map((g) => (
              <div
                key={g._id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs group"
              >
                <div className="relative h-44 bg-slate-800">
                  <img
                    src={g.coverImage}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-full bg-black/80 text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-xs">
                    <ImageIcon className="w-3 h-3" />
                    {g.photos?.length || 0} Photos
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                    {g.title}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{g.category?.name || "Culture"}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(g)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirmModal({ isOpen: true, id: g._id })}
                        className="p-1 text-red-600 hover:bg-red-50 rounded-lg"
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
        title="Delete Photo Gallery?"
        message="Are you sure you want to delete this photo album?"
        onConfirm={confirmDelete}
        onClose={() => setConfirmModal({ isOpen: false, id: null })}
      />
    </div>
  );
}
