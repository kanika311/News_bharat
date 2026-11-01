"use client";

import React, { useState, useEffect } from "react";
import { Radio, Plus, Trash2, Edit2, Loader2, Save, X, ToggleLeft, ToggleRight } from "lucide-react";
import { apiFetch } from "@/lib/api";
import ConfirmModal from "@/components/admin/ConfirmModal";

export default function TickerPage() {
  const [tickers, setTickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [text, setText] = useState("");
  const [textHi, setTextHi] = useState("");
  const [link, setLink] = useState("");
  const [priority, setPriority] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });

  const loadTickers = async () => {
    try {
      const res = await apiFetch("/api/ticker");
      if (res.success) setTickers(res.tickers || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickers();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setText("");
    setTextHi("");
    setLink("");
    setPriority(1);
    setIsActive(true);
    setError("");
  };

  const handleEdit = (t) => {
    setEditingId(t._id);
    setText(t.text);
    setTextHi(t.textHi || t.text);
    setLink(t.link || "");
    setPriority(t.priority || 1);
    setIsActive(t.isActive !== false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text) {
      setError("English ticker text is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = { text, textHi: textHi || text, link, priority: Number(priority), isActive };
      if (editingId) {
        await apiFetch(`/api/ticker/${editingId}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await apiFetch("/api/ticker", { method: "POST", body: JSON.stringify(payload) });
      }
      resetForm();
      loadTickers();
    } catch (err) {
      setError(err.message || "Failed to save ticker");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (item) => {
    try {
      await apiFetch(`/api/ticker/${item._id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      loadTickers();
    } catch (e) {
      alert("Error toggling ticker status");
    }
  };

  const confirmDelete = async () => {
    try {
      await apiFetch(`/api/ticker/${confirmModal.id}`, { method: "DELETE" });
      setConfirmModal({ isOpen: false, id: null });
      loadTickers();
    } catch (e) {
      alert("Error deleting ticker");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-red-600 text-white shadow-md shadow-red-600/30">
          <Radio className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Breaking News Ticker
          </h1>
          <p className="text-xs text-slate-500">
            Control the top red breaking marquee strip visible across the entire website
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Box */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs h-fit space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {editingId ? "Edit Ticker Item" : "Add Breaking Alert"}
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
                English Alert Text <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Breaking: Election Commission announces poll dates..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hindi Alert Text
              </label>
              <textarea
                rows={2}
                value={textHi}
                onChange={(e) => setTextHi(e.target.value)}
                placeholder="ब्रेकिंग: चुनाव आयोग ने मतदान की तारीखों की घोषणा की..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 font-hindi"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Story Link (Optional)
              </label>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="/politics/election-dates-announced"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Priority
                </label>
                <input
                  type="number"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 p-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Active on Strip
                  </span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-600/30 flex items-center justify-center gap-2 transition-all"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{editingId ? "Update Alert" : "Publish to Ticker"}</span>
            </button>
          </form>
        </div>

        {/* Ticker Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Active Ticker Items</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="p-3">Priority</th>
                  <th className="p-3">Alert Content</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">
                      Loading...
                    </td>
                  </tr>
                ) : tickers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400 italic">
                      No breaking tickers configured.
                    </td>
                  </tr>
                ) : (
                  tickers.map((t) => (
                    <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-slate-400">{t.priority}</td>
                      <td className="p-3 max-w-md">
                        <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{t.text}</p>
                        {t.textHi && (
                          <p className="text-slate-500 line-clamp-1 font-hindi text-[11px] mt-0.5">
                            {t.textHi}
                          </p>
                        )}
                        {t.link && <p className="text-[10px] text-red-600 truncate mt-0.5">{t.link}</p>}
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => toggleStatus(t)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                            t.isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {t.isActive ? "Active" : "Disabled"}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(t)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmModal({ isOpen: true, id: t._id })}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Breaking Ticker Item?"
        message="This breaking alert will immediately be removed from the public website strip."
        onConfirm={confirmDelete}
        onClose={() => setConfirmModal({ isOpen: false, id: null })}
      />
    </div>
  );
}
