"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Check, X, Trash2, ShieldAlert, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import ConfirmModal from "@/components/admin/ConfirmModal";

export default function CommentsPage() {
  const [comments, setComments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });

  const loadComments = async () => {
    setLoading(true);
    try {
      const q = statusFilter ? `?status=${statusFilter}` : "";
      const res = await apiFetch(`/api/comments/admin/list${q}`);
      if (res.success) setComments(res.comments || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [statusFilter]);

  const updateStatus = async (id, status) => {
    try {
      await apiFetch(`/api/comments/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      loadComments();
    } catch (e) {
      alert("Error updating comment");
    }
  };

  const confirmDelete = async () => {
    try {
      await apiFetch(`/api/comments/${confirmModal.id}`, { method: "DELETE" });
      setConfirmModal({ isOpen: false, id: null });
      loadComments();
    } catch (e) {
      alert("Error deleting comment");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Reader Comments & Moderation
          </h1>
          <p className="text-xs text-slate-500">
            Moderate public discussion, protect against toxic spam, and approve legitimate user feedback
          </p>
        </div>

        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
          {["pending", "approved", "rejected", "spam"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                statusFilter === s
                  ? "bg-red-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white capitalize">
            {statusFilter} Comments ({comments.length})
          </h2>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-red-600" />
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div className="p-12 text-center text-slate-400 italic text-xs">
              No {statusFilter} comments found.
            </div>
          ) : (
            comments.map((c) => (
              <div key={c._id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{c.name}</span>
                    <span className="text-[11px] text-slate-400">({c.email})</span>
                    <span className="text-[10px] text-slate-400">•</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                    {c.content}
                  </p>

                  {c.article && (
                    <p className="text-[11px] text-slate-500">
                      On Story:{" "}
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {c.article.title}
                      </span>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {c.status !== "approved" && (
                    <button
                      onClick={() => updateStatus(c._id, "approved")}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                  )}
                  {c.status !== "rejected" && (
                    <button
                      onClick={() => updateStatus(c._id, "rejected")}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  )}
                  {c.status !== "spam" && (
                    <button
                      onClick={() => updateStatus(c._id, "spam")}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg text-xs"
                      title="Flag as Spam"
                    >
                      <ShieldAlert className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmModal({ isOpen: true, id: c._id })}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg text-xs"
                    title="Delete Permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Comment?"
        message="Permanently remove this comment?"
        onConfirm={confirmDelete}
        onClose={() => setConfirmModal({ isOpen: false, id: null })}
      />
    </div>
  );
}
