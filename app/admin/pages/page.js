"use client";

import React, { useState, useEffect } from "react";
import { FileCode, Plus, Trash2, Edit2, Loader2, Save, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import RichTextEditor from "@/components/admin/RichTextEditor";
import ConfirmModal from "@/components/admin/ConfirmModal";

export default function StaticPagesManager() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [title, setTitle] = useState("");
  const [titleHi, setTitleHi] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [contentHi, setContentHi] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });

  const loadPages = async () => {
    try {
      const res = await apiFetch("/api/pages");
      if (res.success) setPages(res.pages || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setTitleHi("");
    setSlug("");
    setContent("");
    setContentHi("");
    setIsActive(true);
    setError("");
  };

  const handleEdit = (p) => {
    setEditingId(p._id);
    setTitle(p.title);
    setTitleHi(p.titleHi || p.title);
    setSlug(p.slug);
    setContent(p.content || "");
    setContentHi(p.contentHi || "");
    setIsActive(p.isActive !== false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      setError("Title and content are required.");
      return;
    }

    setSaving(true);
    try {
      const payload = { title, titleHi: titleHi || title, slug: slug || undefined, content, contentHi, isActive };
      if (editingId) {
        await apiFetch(`/api/pages/${editingId}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await apiFetch("/api/pages", { method: "POST", body: JSON.stringify(payload) });
      }
      resetForm();
      loadPages();
    } catch (err) {
      setError(err.message || "Failed to save page");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await apiFetch(`/api/pages/${confirmModal.id}`, { method: "DELETE" });
      setConfirmModal({ isOpen: false, id: null });
      loadPages();
    } catch (e) {
      alert("Error deleting page");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Static Informational Pages
        </h1>
        <p className="text-xs text-slate-500">
          Manage corporate & legal pages: About Us, Privacy Policy, Terms of Service, Contact, Advertise
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs h-fit space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {editingId ? "Edit Page" : "Create New Static Page"}
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
                Page Title (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="About Swar Media"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Page Title (Hindi)
              </label>
              <input
                type="text"
                value={titleHi}
                onChange={(e) => setTitleHi(e.target.value)}
                placeholder="हमारे बारे में"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 font-hindi"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                URL Slug (Optional)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="about-us"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>

            <RichTextEditor value={content} onChange={setContent} label="English Content (HTML)" />

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-600/30 flex items-center justify-center gap-2 transition-all"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{editingId ? "Update Page" : "Save Page"}</span>
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Published Static Pages</h2>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {pages.map((p) => (
              <div key={p._id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">{p.title}</h3>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">/pages/{p.slug}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(p)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setConfirmModal({ isOpen: true, id: p._id })}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Static Page?"
        message="This page will return a 404 error if visited."
        onConfirm={confirmDelete}
        onClose={() => setConfirmModal({ isOpen: false, id: null })}
      />
    </div>
  );
}
