"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Search,
  Filter,
  Trash2,
  RotateCcw,
  Edit,
  Eye,
  CheckSquare,
  Square,
  AlertTriangle,
  Loader2,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import ConfirmModal from "@/components/admin/ConfirmModal";

export default function ArticlesListPage() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");
  const [trashed, setTrashed] = useState(false);

  // Selection & Bulk
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        trashed: trashed ? "true" : "false",
      });

      if (search) query.append("search", search);
      if (categoryFilter) query.append("category", categoryFilter);
      if (statusFilter) query.append("status", statusFilter);
      if (languageFilter) query.append("language", languageFilter);

      const res = await apiFetch(`/api/articles?${query.toString()}`);
      if (res.success) {
        setArticles(res.articles || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to load articles", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    apiFetch("/api/categories")
      .then((res) => {
        if (res.success) setCategories(res.categories || []);
      })
      .catch((e) => console.error(e));
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [page, categoryFilter, statusFilter, languageFilter, trashed]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchArticles();
  };

  // Toggle selection
  const toggleSelectAll = () => {
    if (selectedIds.length === articles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(articles.map((a) => a._id));
    }
  };

  const toggleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Single Action Handlers
  const handleTrash = (id, title) => {
    setConfirmModal({
      isOpen: true,
      title: "Move to Trash?",
      message: `Are you sure you want to move "${title}" to the trash? You can restore it later.`,
      onConfirm: async () => {
        await apiFetch(`/api/articles/${id}`, { method: "DELETE" });
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        fetchArticles();
      },
    });
  };

  const handleRestore = async (id) => {
    try {
      await apiFetch(`/api/articles/${id}/restore`, { method: "POST" });
      fetchArticles();
    } catch (e) {
      alert("Error restoring article");
    }
  };

  const handlePermanentDelete = (id, title) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Permanently?",
      message: `Permanently delete "${title}"? This cannot be undone!`,
      onConfirm: async () => {
        await apiFetch(`/api/articles/${id}/permanent`, { method: "DELETE" });
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        fetchArticles();
      },
    });
  };

  // Bulk Action Handlers
  const handleBulkAction = async (action) => {
    if (!selectedIds.length) return;
    try {
      await apiFetch("/api/articles/bulk", {
        method: "POST",
        body: JSON.stringify({ action, ids: selectedIds }),
      });
      setSelectedIds([]);
      fetchArticles();
    } catch (err) {
      alert(err.message || "Bulk action failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Articles & News Stories
          </h1>
          <p className="text-xs text-slate-500">
            Manage editorial articles, breaking flashes, and scheduled releases ({total} items)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setTrashed(!trashed);
              setPage(1);
            }}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 ${
              trashed
                ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40"
                : "bg-white text-slate-700 border-slate-200 dark:bg-slate-900 dark:border-slate-800"
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{trashed ? "Viewing Trash" : "Trash Bin"}</span>
          </button>

          <Link
            href="/swar-media-admin/articles/new"
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl hover:bg-red-700 transition-colors shadow-md shadow-red-600/30"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Article</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px]">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, summary, or content..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 text-slate-900 dark:text-white"
            />
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 font-medium text-slate-700 dark:text-slate-300"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 font-medium text-slate-700 dark:text-slate-300"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="pending">Pending Review</option>
          </select>

          {/* Language Filter */}
          <select
            value={languageFilter}
            onChange={(e) => {
              setLanguageFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 font-medium text-slate-700 dark:text-slate-300"
          >
            <option value="">All Languages</option>
            <option value="hi">Hindi (हिन्दी)</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Controls */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl animate-in fade-in duration-150">
          <span className="text-xs font-bold text-red-700 dark:text-red-300">
            {selectedIds.length} article(s) selected
          </span>
          <div className="flex items-center gap-2">
            {!trashed ? (
              <>
                <button
                  type="button"
                  onClick={() => handleBulkAction("publish")}
                  className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                  Publish Selected
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkAction("trash")}
                  className="px-3 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Move to Trash
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleBulkAction("restore")}
                  className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Restore Selected
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkAction("delete_permanent")}
                  className="px-3 py-1.5 text-xs font-semibold bg-red-700 hover:bg-red-800 text-white rounded-lg transition-colors"
                >
                  Permanently Delete
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Articles Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-3 w-10 text-center">
                  <button type="button" onClick={toggleSelectAll} className="p-1">
                    {selectedIds.length === articles.length && articles.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-red-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="p-3">Story</th>
                <th className="p-3">Category</th>
                <th className="p-3">Author</th>
                <th className="p-3">Status</th>
                <th className="p-3">Views</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-red-600" />
                    Loading articles...
                  </td>
                </tr>
              ) : articles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400 italic">
                    No articles found matching criteria.
                  </td>
                </tr>
              ) : (
                articles.map((art) => {
                  const isSelected = selectedIds.includes(art._id);
                  return (
                    <tr
                      key={art._id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? "bg-red-50/50 dark:bg-red-950/20" : ""
                      }`}
                    >
                      <td className="p-3 text-center">
                        <button type="button" onClick={() => toggleSelectOne(art._id)} className="p-1">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-red-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                      </td>
                      <td className="p-3 max-w-sm">
                        <div className="flex items-start gap-3">
                          {art.featuredImage?.url && (
                            <img
                              src={art.featuredImage.url}
                              alt=""
                              className="w-12 h-12 object-cover rounded-lg shrink-0 border border-slate-200 dark:border-slate-700"
                            />
                          )}
                          <div>
                            <Link
                              href={`/swar-media-admin/articles/edit/${art._id}`}
                              className="font-bold text-slate-900 dark:text-white hover:text-red-600 line-clamp-1 transition-colors"
                            >
                              {art.title}
                            </Link>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <span className="text-[10px] font-bold uppercase px-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                {art.language}
                              </span>
                              {art.isBreaking && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-100 text-red-600 animate-pulse">
                                  BREAKING
                                </span>
                              )}
                              {art.isTopStory && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-700">
                                  TOP STORY
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                        {art.category?.name || "General"}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        {art.author?.name || "Reporter"}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            art.status === "published"
                              ? "bg-emerald-100 text-emerald-700"
                              : art.status === "scheduled"
                              ? "bg-blue-100 text-blue-700"
                              : art.status === "pending"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {art.status}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">
                        {(art.viewCount || 0).toLocaleString()}
                      </td>
                      <td className="p-3 text-slate-500 whitespace-nowrap">
                        {new Date(art.publishedAt || art.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {!trashed ? (
                            <>
                              <Link
                                href={`/${art.category?.slug || "news"}/${art.slug}`}
                                target="_blank"
                                className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="View live article"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Link>
                              <Link
                                href={`/swar-media-admin/articles/edit/${art._id}`}
                                className="p-1.5 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40"
                                title="Edit"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleTrash(art._id, art.title)}
                                className="p-1.5 text-red-600 hover:text-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40"
                                title="Move to trash"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleRestore(art._id)}
                                className="p-1.5 text-emerald-600 hover:text-emerald-800 rounded-lg hover:bg-emerald-50"
                                title="Restore article"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePermanentDelete(art._id, art.title)}
                                className="p-1.5 text-red-700 hover:text-red-900 rounded-lg hover:bg-red-100"
                                title="Delete permanently"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-500">
            Page {page} of {totalPages} ({total} articles)
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5 inline mr-1" />
              Prev
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5 inline ml-1" />
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
