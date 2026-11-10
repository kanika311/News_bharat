"use client";

import React, { useState, useEffect } from "react";
import { Mail, Download, Trash2, Loader2, RefreshCw, Search } from "lucide-react";
import { apiFetch } from "@/lib/api";
import ConfirmModal from "@/components/admin/ConfirmModal";

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });

  const loadSubscribers = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await apiFetch("/api/subscribers");
      if (res.success) setSubscribers(res.subscribers || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSubscribers();
  }, []);

  const confirmDelete = async () => {
    try {
      await apiFetch(`/api/subscribers/${confirmModal.id}`, { method: "DELETE" });
      setConfirmModal({ isOpen: false, id: null });
      loadSubscribers();
    } catch (e) {
      alert("Error removing subscriber");
    }
  };

  const downloadCSV = () => {
    window.open("/api/subscribers/export-csv", "_blank");
  };

  const filteredSubscribers = subscribers.filter((s) =>
    s.email?.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              न्यूज़लेटर सदस्य (Subscribers)
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-300">
              {subscribers.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            दैनिक समाचार बुलेटिन के पंजीकृत पाठक (Live registered audience for daily news bulletins)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => loadSubscribers(true)}
            disabled={loading || refreshing}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-amber-600" : ""}`} />
            <span>ताज़ा करें (Refresh)</span>
          </button>

          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-xs rounded-xl transition-all shadow-sm ring-1 ring-amber-400/80 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>CSV डाउनलोड करें (Export)</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs max-w-md">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="ईमेल से खोजें (Search by email)..."
          className="w-full text-xs bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="text-[10px] text-slate-400 hover:text-slate-600 px-2"
          >
            Clear
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                <th className="p-3.5">ईमेल पता (Email Address)</th>
                <th className="p-3.5">स्थिति (Status)</th>
                <th className="p-3.5">पंजीकरण दिनांक (Subscribed Date)</th>
                <th className="p-3.5 text-right">कार्य (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-600" />
                    सब्सक्राइबर्स लोड हो रहे हैं...
                  </td>
                </tr>
              ) : filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400 italic">
                    {searchTerm ? "इस खोज के अनुसार कोई सब्सक्राइबर नहीं मिला।" : "अभी तक कोई सब्सक्राइबर नहीं है।"}
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 text-xs font-bold">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <span>{s.email}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300/50">
                        सक्रिय (Active)
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {new Date(s.createdAt).toLocaleString("hi-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setConfirmModal({ isOpen: true, id: s._id })}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                        title="हटाएं (Remove)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="सब्सक्राइबर हटाएं? (Remove Subscriber?)"
        message="यह पाठक न्यूज़लेटर सूची से हटा दिया जाएगा।"
        onConfirm={confirmDelete}
        onClose={() => setConfirmModal({ isOpen: false, id: null })}
      />
    </div>
  );
}
