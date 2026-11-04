"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Flame,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  Clock,
  Send,
  Eye,
  Search,
  ExternalLink,
  CheckCircle2,
  X,
  Radio,
  Share2,
  MessageSquare,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import ConfirmModal from "@/components/admin/ConfirmModal";

export default function AdminLiveBlogsListPage() {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Quick Entry Drawer / Modal
  const [activeBlogForEntries, setActiveBlogForEntries] = useState(null);
  const [entryTitle, setEntryTitle] = useState("");
  const [entryContent, setEntryContent] = useState("");
  const [submittingEntry, setSubmittingEntry] = useState(false);

  // Modals
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2800);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [bRes, cRes] = await Promise.all([
        apiFetch("/api/live-blogs"),
        apiFetch("/api/categories"),
      ]);
      if (bRes.success) setBlogs(bRes.liveBlogs || []);
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

  const handleToggleStatus = async (blog) => {
    const nextStatus = blog.status === "live" ? "ended" : "live";
    try {
      const res = await apiFetch(`/api/live-blogs/${blog._id}`, {
        method: "PUT",
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.success) {
        setBlogs((prev) =>
          prev.map((b) => (b._id === blog._id ? { ...b, status: nextStatus } : b))
        );
        showToast(
          nextStatus === "live" ? "लाइव ब्लॉग अब सक्रिय (LIVE) है!" : "लाइव ब्लॉग समाप्त कर दिया गया।"
        );
      }
    } catch (e) {
      alert("Error updating live blog status");
    }
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    if (!activeBlogForEntries || !entryTitle.trim() || !entryContent.trim()) return;

    setSubmittingEntry(true);
    try {
      const res = await apiFetch(`/api/live-blogs/${activeBlogForEntries._id}/entries`, {
        method: "POST",
        body: JSON.stringify({
          title: entryTitle.trim(),
          content: entryContent.trim(),
        }),
      });

      if (res.success) {
        setEntryTitle("");
        setEntryContent("");
        showToast("नया लाइव अपडेट प्रकाशित हो गया!");
        loadData();
      }
    } catch (err) {
      alert(err.message || "Failed to post entry");
    } finally {
      setSubmittingEntry(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await apiFetch(`/api/live-blogs/${confirmModal.id}`, { method: "DELETE" });
      setBlogs((prev) => prev.filter((b) => b._id !== confirmModal.id));
      setConfirmModal({ isOpen: false, id: null });
      showToast("लाइव ब्लॉग हटा दिया गया।");
    } catch (e) {
      alert("Error deleting live blog");
    }
  };

  // Social Sharing
  const handleShareFacebook = (b) => {
    const shareUrl = `${window.location.origin}/live-blogs/${b.slug || b._id}`;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(
        b.titleHi || b.title
      )}`,
      "_blank",
      "width=600,height=500"
    );
  };

  const handleShareInstagram = (b) => {
    const textToCopy = `🔴 LIVE: ${b.titleHi || b.title}\n\nमिनट-दर-मिनट ताज़ा अपडेट्स के लिए स्वर मीडिया पर पढ़ें:\n${window.location.origin}/live-blogs/${b.slug || b._id}\n\n#SwarMedia #LiveNews #BreakingNews`;
    navigator.clipboard.writeText(textToCopy);
    showToast("इंस्टाग्राम कैप्शन और लिंक क्लिपबोर्ड में कॉपी हो गया!");
  };

  const handleShareYouTube = () => {
    window.open("https://www.youtube.com", "_blank");
  };

  const handleShareTelegram = (b) => {
    const shareUrl = `${window.location.origin}/live-blogs/${b.slug || b._id}`;
    const text = `🔴 लाइव कवरेज: ${b.titleHi || b.title}\n\nस्वर मीडिया पर तुरंत पढ़ें:`;
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  const handleShareWhatsApp = (b) => {
    const shareUrl = `${window.location.origin}/live-blogs/${b.slug || b._id}`;
    const text = `🔴 *LIVE ब्लॉग:* ${b.titleHi || b.title}\n\nस्वर मीडिया पर ताज़ा लाइव कवरेज देखें:\n${shareUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const filteredBlogs = blogs.filter((b) => {
    return (
      !search ||
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.titleHi?.includes(search)
    );
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

      {/* Top Header with + Add Live Blog Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Live Blogs & Match Feeds
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Publish real-time minute-by-minute text updates for elections, budgets, cricket, and breaking news
          </p>
        </div>

        {/* Link to Dedicated New Page */}
        <Link
          href="/swar-media-admin/live-blogs/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-amber-500/30 transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Start New Live Blog</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search live blogs by title..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <span className="text-xs font-bold text-slate-500 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0">
          Total: {filteredBlogs.length}
        </span>
      </div>

      {/* ============================================================== */}
      {/* HORIZONTAL LIVE BLOGS LIST (Wide Horizontal Cards)             */}
      {/* ============================================================== */}
      {loading ? (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-semibold">Loading live blogs...</p>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <Flame className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Live Blogs Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click "+ Start New Live Blog" to create an instant real-time timeline for any major event.
          </p>
          <Link
            href="/swar-media-admin/live-blogs/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Create Live Blog</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBlogs.map((b) => (
            <div
              key={b._id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
            >
              {/* Left: Cover Banner & Status */}
              <div className="relative w-full lg:w-52 aspect-video bg-slate-900 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                <img
                  src={
                    b.coverImage ||
                    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80"
                  }
                  alt={b.title}
                  className="w-full h-full object-cover opacity-90"
                />
                <button
                  type="button"
                  onClick={() => handleToggleStatus(b)}
                  className={`absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow cursor-pointer ${
                    b.status === "live"
                      ? "bg-red-600 text-white animate-pulse"
                      : "bg-slate-800 text-slate-300"
                  }`}
                  title="Click to toggle Status"
                >
                  {b.status === "live" ? "🔴 LIVE" : "CONCLUDED"}
                </button>
              </div>

              {/* Middle: Titles & Entries Info */}
              <div className="flex-1 min-w-0 space-y-1.5 w-full">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60">
                    {b.category?.name || "General"}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(b.createdAt).toLocaleDateString("hi-IN")}</span>
                  </span>
                  <span className="text-[11px] text-orange-600 dark:text-orange-400 font-black">
                    • {b.entries?.length || 0} Live Updates Posted
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white line-clamp-1">
                  {b.titleHi || b.title}
                </h3>
                {b.titleHi && b.title && b.titleHi !== b.title && (
                  <p className="text-xs text-slate-500 line-clamp-1 font-medium">
                    {b.title}
                  </p>
                )}
              </div>

              {/* Right: Actions & Social Share Suite */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 shrink-0 w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                {/* Actions: Add Update, View, Edit, Delete */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveBlogForEntries(b)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black text-white bg-amber-500 hover:bg-amber-600 shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Post Update</span>
                  </button>

                  <Link
                    href={`/live-blogs/${b.slug || b._id}`}
                    target="_blank"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
                    title="View on portal"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </Link>

                  <Link
                    href={`/swar-media-admin/live-blogs/edit/${b._id}`}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 transition-colors"
                    title="Edit Live Blog"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setConfirmModal({ isOpen: true, id: b._id })}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 transition-colors"
                    title="Delete Live Blog"
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
                    onClick={() => handleShareFacebook(b)}
                    className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-xs"
                    title="Share on Facebook"
                  >
                    <span className="font-bold text-xs">f</span>
                  </button>

                  {/* Instagram */}
                  <button
                    type="button"
                    onClick={() => handleShareInstagram(b)}
                    className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-xs"
                    title="Copy for Instagram"
                  >
                    <span className="font-bold text-[10px]">IG</span>
                  </button>

                  {/* YouTube */}
                  <button
                    type="button"
                    onClick={handleShareYouTube}
                    className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-xs"
                    title="Open YouTube"
                  >
                    <span className="font-bold text-[10px]">YT</span>
                  </button>

                  {/* Telegram */}
                  <button
                    type="button"
                    onClick={() => handleShareTelegram(b)}
                    className="w-7 h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-xs"
                    title="Share on Telegram"
                  >
                    <span className="font-bold text-[10px]">TG</span>
                  </button>

                  {/* WhatsApp */}
                  <button
                    type="button"
                    onClick={() => handleShareWhatsApp(b)}
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

      {/* Quick Add Update Drawer Modal */}
      {activeBlogForEntries && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActiveBlogForEntries(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500" />
                  <span>लाइव अपडेट पोस्ट करें</span>
                </h3>
                <p className="text-xs text-slate-500 truncate max-w-sm">
                  {activeBlogForEntries.titleHi || activeBlogForEntries.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveBlogForEntries(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEntry} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  अपडेट शीर्षक (Update Headline) *
                </label>
                <input
                  type="text"
                  required
                  value={entryTitle}
                  onChange={(e) => setEntryTitle(e.target.value)}
                  placeholder="उदा. गृह मंत्री का संबोधन शुरू: सुरक्षा पर बड़ा बयान..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  विस्तृत जानकारी (Update Content) *
                </label>
                <textarea
                  rows={4}
                  required
                  value={entryContent}
                  onChange={(e) => setEntryContent(e.target.value)}
                  placeholder="मुख्य बिंदु, कोटेशन या ताजा घटनाक्रम दर्ज करें..."
                  className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveBlogForEntries(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  बंद करें
                </button>
                <button
                  type="submit"
                  disabled={submittingEntry}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  {submittingEntry ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>तुरंत लाइव पोस्ट करें</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Live Blog?"
        message="Are you sure you want to permanently delete this live blog and all its timeline entries?"
        confirmText="Delete Live Blog"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmModal({ isOpen: false, id: null })}
      />
    </div>
  );
}
