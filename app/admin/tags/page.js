"use client";

import React, { useState, useEffect } from "react";
import { Tags, Plus, Trash2, Edit2, Loader2, Save } from "lucide-react";
import { apiFetch } from "@/lib/api";
import ConfirmModal from "@/components/admin/ConfirmModal";

export default function TagsPage() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [nameHi, setNameHi] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });

  const loadTags = async () => {
    try {
      const res = await apiFetch("/api/tags");
      if (res.success) setTags(res.tags || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setNameHi("");
    setSlug("");
    setError("");
  };

  const handleEdit = (t) => {
    setEditingId(t._id);
    setName(t.name);
    setNameHi(t.nameHi || "");
    setSlug(t.slug);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      setError("Tag name is required.");
      return;
    }

    setSaving(true);
    try {
      const payload = { name, nameHi, slug: slug || undefined };
      if (editingId) {
        await apiFetch(`/api/tags/${editingId}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await apiFetch("/api/tags", { method: "POST", body: JSON.stringify(payload) });
      }
      resetForm();
      loadTags();
    } catch (err) {
      setError(err.message || "Failed to save tag");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await apiFetch(`/api/tags/${confirmModal.id}`, { method: "DELETE" });
      setConfirmModal({ isOpen: false, id: null });
      loadTags();
    } catch (e) {
      alert("Error deleting tag");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          News Tags & Topics
        </h1>
        <p className="text-xs text-slate-500">
          Manage keyword tags for article taxonomy, topic hubs, and SEO indexing
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs h-fit space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            {editingId ? "Edit Tag" : "Create New Tag"}
          </h2>

          {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tag (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cricket"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tag (Hindi)
              </label>
              <input
                type="text"
                value={nameHi}
                onChange={(e) => setNameHi(e.target.value)}
                placeholder="e.g. क्रिकेट"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 font-hindi"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Slug (Optional)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="cricket"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-600/30 flex items-center justify-center gap-2 transition-all"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{editingId ? "Update Tag" : "Add Tag"}</span>
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">All Tags</h2>
            <span className="text-xs text-slate-400">{tags.length} total</span>
          </div>

          <div className="p-4 flex flex-wrap gap-2">
            {loading ? (
              <p className="text-xs text-slate-400 p-4">Loading tags...</p>
            ) : tags.length === 0 ? (
              <p className="text-xs text-slate-400 p-4">No tags created yet.</p>
            ) : (
              tags.map((t) => (
                <div
                  key={t._id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <span>#{t.name}</span>
                  {t.nameHi && <span className="font-hindi text-slate-400 text-[11px]">({t.nameHi})</span>}
                  <button
                    onClick={() => handleEdit(t)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setConfirmModal({ isOpen: true, id: t._id })}
                    className="p-1 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Tag?"
        message="This tag will be removed from all associated articles."
        onConfirm={confirmDelete}
        onClose={() => setConfirmModal({ isOpen: false, id: null })}
      />
    </div>
  );
}
