"use client";

import React, { useState, useEffect } from "react";
import { Flame, Plus, Trash2, Clock, Send, CheckCircle, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import ImageUploader from "@/components/admin/ImageUploader";
import ConfirmModal from "@/components/admin/ConfirmModal";

export default function LiveBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeBlog, setActiveBlog] = useState(null);

  // New Live Blog Form
  const [title, setTitle] = useState("");
  const [titleHi, setTitleHi] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [category, setCategory] = useState("");

  // New Entry Form
  const [entryTitle, setEntryTitle] = useState("");
  const [entryContent, setEntryContent] = useState("");
  const [submittingEntry, setSubmittingEntry] = useState(false);
  const [savingBlog, setSavingBlog] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });

  const loadData = async () => {
    try {
      const [bRes, cRes] = await Promise.all([
        apiFetch("/api/live-blogs"),
        apiFetch("/api/categories"),
      ]);
      if (bRes.success) {
        setBlogs(bRes.liveBlogs || []);
        if (bRes.liveBlogs?.length > 0 && !activeBlog) {
          setActiveBlog(bRes.liveBlogs[0]);
        } else if (activeBlog) {
          const updated = bRes.liveBlogs.find((x) => x._id === activeBlog._id);
          if (updated) setActiveBlog(updated);
        }
      }
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

  const handleCreateLiveBlog = async (e) => {
    e.preventDefault();
    if (!title) return;
    setSavingBlog(true);
    try {
      const res = await apiFetch("/api/live-blogs", {
        method: "POST",
        body: JSON.stringify({
          title,
          titleHi: titleHi || title,
          coverImage,
          category: category || null,
        }),
      });
      if (res.success && res.liveBlog) {
        setTitle("");
        setTitleHi("");
        setCoverImage("");
        loadData();
        setActiveBlog(res.liveBlog);
      }
    } catch (err) {
      alert(err.message || "Failed to create live blog");
    } finally {
      setSavingBlog(false);
    }
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (!activeBlog || !entryTitle || !entryContent) return;
    setSubmittingEntry(true);
    try {
      await apiFetch(`/api/live-blogs/${activeBlog._id}/entries`, {
        method: "POST",
        body: JSON.stringify({ title: entryTitle, content: entryContent }),
      });
      setEntryTitle("");
      setEntryContent("");
      loadData();
    } catch (err) {
      alert(err.message || "Failed to post entry");
    } finally {
      setSubmittingEntry(false);
    }
  };

  const toggleStatus = async (blog) => {
    const nextStatus = blog.status === "live" ? "ended" : "live";
    try {
      await apiFetch(`/api/live-blogs/${blog._id}`, {
        method: "PUT",
        body: JSON.stringify({ status: nextStatus }),
      });
      loadData();
    } catch (e) {
      alert("Error updating status");
    }
  };

  const confirmDelete = async () => {
    try {
      await apiFetch(`/api/live-blogs/${confirmModal.id}`, { method: "DELETE" });
      setConfirmModal({ isOpen: false, id: null });
      setActiveBlog(null);
      loadData();
    } catch (e) {
      alert("Error deleting live blog");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
          <Flame className="w-5 h-5 animate-bounce" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Live News Coverage & Match Feeds
          </h1>
          <p className="text-xs text-slate-500">
            Push real-time minute-by-minute live blog updates to readers without page reloads
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Create & List Blogs */}
        <div className="space-y-6">
          {/* Create New Live Blog */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-red-600" /> Start New Live Blog
            </h2>

            <form onSubmit={handleCreateLiveBlog} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Title (English) *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Budget 2026 LIVE Updates..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Title (Hindi)
                </label>
                <input
                  type="text"
                  value={titleHi}
                  onChange={(e) => setTitleHi(e.target.value)}
                  placeholder="लाइव ब्लॉग शीर्षक..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 font-hindi"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
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

              <ImageUploader value={coverImage} onChange={setCoverImage} label="Cover Banner" />

              <button
                type="submit"
                disabled={savingBlog}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-600/30 flex items-center justify-center gap-2 transition-all"
              >
                {savingBlog ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />}
                <span>Launch Live Feed</span>
              </button>
            </form>
          </div>

          {/* Existing Live Blogs List */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Active Live Feeds</h2>
            <div className="space-y-2">
              {blogs.map((b) => (
                <div
                  key={b._id}
                  onClick={() => setActiveBlog(b)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    activeBlog?._id === b._id
                      ? "border-red-500 bg-red-50/50 dark:bg-red-950/20 shadow-xs"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                      {b.title}
                    </p>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                        b.status === "live"
                          ? "bg-red-600 text-white animate-pulse"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span>{b.entries?.length || 0} updates</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStatus(b);
                        }}
                        className="text-xs font-semibold text-slate-600 hover:underline"
                      >
                        {b.status === "live" ? "End Feed" : "Re-open"}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmModal({ isOpen: true, id: b._id });
                        }}
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Active Live Blog Stream & Quick Poster (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {activeBlog ? (
            <>
              {/* Quick Post Box */}
              <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      Publish Instant Update to "{activeBlog.title}"
                    </h2>
                  </div>
                  <span className="text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full">
                    {activeBlog.status.toUpperCase()}
                  </span>
                </div>

                <form onSubmit={handleAddEntry} className="space-y-3 pt-2">
                  <input
                    type="text"
                    required
                    value={entryTitle}
                    onChange={(e) => setEntryTitle(e.target.value)}
                    placeholder="Update headline (e.g. 14:30 - Key announcement made by committee)..."
                    className="w-full px-3.5 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
                  />
                  <textarea
                    required
                    rows={3}
                    value={entryContent}
                    onChange={(e) => setEntryContent(e.target.value)}
                    placeholder="Provide detailed live development, quotes, or analysis..."
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 resize-y"
                  />

                  <div className="flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={submittingEntry}
                      className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-600/30 flex items-center gap-2 transition-all"
                    >
                      {submittingEntry ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Broadcast Update</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Updates Feed Timeline */}
              <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Live Stream Entries ({activeBlog.entries?.length || 0})
                </h3>

                <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  {(!activeBlog.entries || activeBlog.entries.length === 0) ? (
                    <p className="text-xs text-slate-400 italic pl-8">No entries published yet.</p>
                  ) : (
                    activeBlog.entries.map((ent, idx) => (
                      <div key={idx} className="relative pl-8 space-y-1">
                        <div className="absolute left-2 top-1.5 w-3 h-3 rounded-full bg-red-600 border-2 border-white dark:border-slate-900 shrink-0" />
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(ent.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          <span>•</span>
                          <span className="font-semibold text-slate-600 dark:text-slate-300">
                            {ent.authorName}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {ent.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {ent.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
              <Flame className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs">Select or create a live blog on the left to start posting.</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Live Blog?"
        message="This live blog and all its updates will be deleted."
        onConfirm={confirmDelete}
        onClose={() => setConfirmModal({ isOpen: false, id: null })}
      />
    </div>
  );
}
