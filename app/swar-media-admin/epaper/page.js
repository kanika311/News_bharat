"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Newspaper,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  Save,
  Eye,
  FileText,
  Calendar,
  MapPin,
  Download,
  ExternalLink,
  CheckCircle2,
  X,
  Upload,
  Search,
  Filter,
  Check,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import ConfirmModal from "@/components/admin/ConfirmModal";

export default function AdminEPaperPage() {
  const [epapers, setEpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Form state
  const [title, setTitle] = useState("");
  const [edition, setEdition] = useState("लखनऊ मुख्य संस्करण");
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [pageCount, setPageCount] = useState(4);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, title: "" });
  const fileInputRef = useRef(null);

  const loadEPapers = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/epaper/admin/list?search=${encodeURIComponent(search)}&status=${statusFilter}`);
      if (res.success && res.epapers) {
        setEpapers(res.epapers);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEPapers();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadEPapers();
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setEdition("लखनऊ मुख्य संस्करण");
    const today = new Date();
    setDate(today.toISOString().split("T")[0]);
    setPdfUrl("");
    setPdfFile(null);
    setThumbnailUrl("");
    setPageCount(4);
    setIsActive(true);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openCreateModal = () => {
    resetForm();
    const today = new Date();
    const todayFormatted = today.toLocaleDateString("hi-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    setTitle(`दैनिक स्वर मीडिया - ${todayFormatted}`);
    setModalOpen(true);
  };

  const openEditModal = (paper) => {
    setEditingId(paper._id);
    setTitle(paper.title || "");
    setEdition(paper.edition || "लखनऊ मुख्य संस्करण");
    setDate(paper.date ? new Date(paper.date).toISOString().split("T")[0] : "");
    setPdfUrl(paper.pdfUrl || "");
    setPdfFile(null);
    setThumbnailUrl(paper.thumbnailUrl || "");
    setPageCount(paper.pageCount || 4);
    setIsActive(paper.isActive ?? true);
    setError("");
    setModalOpen(true);
  };

  // Quick toggle active status
  const handleToggleStatus = async (id) => {
    try {
      const res = await apiFetch(`/api/epaper/${id}/toggle-status`, { method: "PUT" });
      if (res.success) {
        setEpapers((prev) =>
          prev.map((p) => (p._id === id ? { ...p, isActive: res.isActive } : p))
        );
        showNotification(res.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Submit create or edit form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      if (!date) {
        setError("कृपया समाचार पत्र की दिनांक अवश्य चुनें।");
        setSaving(false);
        return;
      }

      if (!pdfFile && !pdfUrl.trim()) {
        setError("कृपया PDF फाइल अपलोड करें या मान्य PDF वेब लिंक दर्ज करें।");
        setSaving(false);
        return;
      }

      const formData = new FormData();
      formData.append("title", title.trim() || `दैनिक स्वर मीडिया - ${date}`);
      formData.append("edition", edition.trim());
      formData.append("date", date);
      formData.append("thumbnailUrl", thumbnailUrl.trim());
      formData.append("pageCount", String(pageCount));
      formData.append("isActive", String(isActive));

      if (pdfFile) {
        formData.append("pdf", pdfFile);
      } else {
        formData.append("pdfUrl", pdfUrl.trim());
      }

      const url = editingId ? `/api/epaper/${editingId}` : "/api/epaper";
      const method = editingId ? "PUT" : "POST";

      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(url, {
        method,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save newspaper");
      }

      showNotification(data.message || "समाचार पत्र सफलतापूर्वक सहेजा गया!");
      setModalOpen(false);
      resetForm();
      loadEPapers();
    } catch (err) {
      setError(err.message || "सर्वर से कनेक्ट करने में त्रुटि आई।");
    } finally {
      setSaving(false);
    }
  };

  // Delete newspaper
  const handleDeleteConfirm = async () => {
    if (!confirmModal.id) return;
    try {
      const res = await apiFetch(`/api/epaper/${confirmModal.id}`, { method: "DELETE" });
      if (res.success) {
        setEpapers((prev) => prev.filter((p) => p._id !== confirmModal.id));
        showNotification(res.message || "समाचार पत्र हटा दिया गया");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setConfirmModal({ isOpen: false, id: null, title: "" });
    }
  };

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  // Stats
  const activeCount = epapers.filter((p) => p.isActive).length;
  const todayStr = new Date().toISOString().split("T")[0];
  const todayPaper = epapers.find(
    (p) => p.date && new Date(p.date).toISOString().split("T")[0] === todayStr
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Newspaper className="w-6 h-6 text-red-600" />
            <span>ई-पेपर एवं दैनिक समाचार पत्र प्रबंधन (e-Paper CMS)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            दिनांक अनुसार PDF समाचार पत्र अपलोड करें, संपादित करें, सक्रिय/निष्क्रिय या हटाएं।
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/30 transition-transform active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>नया समाचार पत्र (PDF) अपलोड करें</span>
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">कुल संस्करण (Total)</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{epapers.length}</div>
          <span className="text-[10px] text-slate-400">सभी दिनांक व संस्करण</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">सक्रिय संस्करण (Active)</span>
          <div className="text-2xl font-black text-emerald-600">{activeCount}</div>
          <span className="text-[10px] text-slate-400">वेबसाइट पर पाठकों के लिए उपलब्ध</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">आज का संस्करण (Today)</span>
          <div className="text-sm font-black text-slate-900 dark:text-white truncate">
            {todayPaper ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-600 font-extrabold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                अपलोड हो चुका है
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-600 font-extrabold">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                आज का अपलोड बाकी है
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400">{new Date().toLocaleDateString("hi-IN")}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">पब्लिक ई-पेपर पोर्टल</span>
          <div>
            <Link
              href="/epaper"
              target="_blank"
              className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700"
            >
              <span>लाइव ई-पेपर देखें</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
          <span className="text-[10px] text-slate-400">पुरालेख व कैलेंडर रीडर</span>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="शीर्षक या संस्करण खोजें (Search)..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 text-slate-900 dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold cursor-pointer"
          >
            खोजें
          </button>
        </form>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">स्थिति:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="all">सभी संस्करण</option>
            <option value="active">केवल सक्रिय (Active)</option>
            <option value="inactive">केवल निष्क्रिय (Inactive)</option>
          </select>
        </div>
      </div>

      {/* Newspaper Editions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            <span className="text-xs text-slate-400">समाचार पत्र लोड हो रहे हैं...</span>
          </div>
        ) : epapers.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Newspaper className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              कोई समाचार पत्र नहीं मिला
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              ऊपर दिए गए "+ नया समाचार पत्र (PDF) अपलोड करें" बटन पर क्लिक करके आज का या पिछला संस्करण अपलोड करें।
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">दिनांक (Date)</th>
                  <th className="py-3 px-4">शीर्षक व संस्करण</th>
                  <th className="py-3 px-4">कुल पृष्ठ व साइज</th>
                  <th className="py-3 px-4">स्थिति (Status)</th>
                  <th className="py-3 px-4">व्यूज / डाउनलोड्स</th>
                  <th className="py-3 px-4 text-right">कार्रवाई (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {epapers.map((paper) => {
                  const paperDate = paper.date
                    ? new Date(paper.date).toLocaleDateString("hi-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "N/A";

                  return (
                    <tr
                      key={paper._id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Date */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                          <Calendar className="w-3.5 h-3.5 text-red-600" />
                          <span>{paperDate}</span>
                        </div>
                      </td>

                      {/* Title & Edition */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <span className="font-black text-slate-900 dark:text-white block max-w-md truncate">
                            {paper.title}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-red-600 font-semibold">
                            <MapPin className="w-3 h-3" />
                            {paper.edition}
                          </span>
                        </div>
                      </td>

                      {/* Pages & Size */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="space-y-0.5 text-slate-600 dark:text-slate-300">
                          <span className="font-semibold">{paper.pageCount || 4} पृष्ठ</span>
                          {paper.fileSize && (
                            <span className="text-[10px] text-slate-400 block font-mono">
                              {paper.fileSize}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Active / Inactive Toggle */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(paper._id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black transition-all cursor-pointer ${
                            paper.isActive
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                          }`}
                          title={paper.isActive ? "निष्क्रिय करने के लिए क्लिक करें" : "सक्रिय करने के लिए क्लिक करें"}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              paper.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                            }`}
                          />
                          <span>{paper.isActive ? "सक्रिय (Active)" : "निष्क्रिय (Inactive)"}</span>
                        </button>
                      </td>

                      {/* Views & Downloads */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        <div>👁️ {paper.views || 0} व्यूज</div>
                        <div>⬇️ {paper.downloads || 0} डाउनलोड</div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View in Public Reader */}
                          {paper.date && (
                            <Link
                              href={`/epaper?date=${new Date(paper.date).toISOString().split("T")[0]}`}
                              target="_blank"
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors"
                              title="पब्लिक पोर्टल पर देखें"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}

                          {/* Open PDF Direct */}
                          {paper.pdfUrl && (
                            <a
                              href={paper.pdfUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition-colors"
                              title="PDF खोलें"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => openEditModal(paper)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-600 transition-colors cursor-pointer"
                            title="संपादित करें"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmModal({
                                isOpen: true,
                                id: paper._id,
                                title: paper.title,
                              })
                            }
                            className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                            title="हटाएं (Delete)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* UPLOAD / EDIT NEWSPAPER MODAL                                  */}
      {/* ============================================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 space-y-5 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
                  <Newspaper className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {editingId ? "समाचार पत्र विवरण संपादित करें" : "नया समाचार पत्र (PDF) अपलोड करें"}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    PDF फाइल चुनें, दिनांक व संस्करण सेट करें
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-600 font-bold">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-red-600" />
                    <span>समाचार पत्र की दिनांक (Date)*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                {/* Edition Dropdown / Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-600" />
                    <span>संस्करण (Edition)*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={edition}
                    onChange={(e) => setEdition(e.target.value)}
                    placeholder="उदा. लखनऊ मुख्य संस्करण, सुल्तानपुर"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  समाचार पत्र का शीर्षक (Title)
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="उदा. दैनिक स्वर मीडिया - 5 नवम्बर 2026"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                />
              </div>

              {/* PDF File Upload Box */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-red-600" />
                  <span>समाचार पत्र PDF फाइल (Upload PDF)*</span>
                </label>

                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-6 text-center hover:border-red-500 transition-colors bg-slate-50/50 dark:bg-slate-800/40">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="application/pdf,.pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setPdfFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                    id="pdf-file-input"
                  />
                  <label
                    htmlFor="pdf-file-input"
                    className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                  >
                    <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {pdfFile ? (
                        <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          {pdfFile.name} ({(pdfFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      ) : (
                        <span>यहाँ क्लिक करके PDF फ़ाइल चुनें (Choose PDF)</span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      अधिकतम फ़ाइल साइज़: 150 MB (Supported: PDF)
                    </span>
                  </label>
                </div>

                {/* OR External PDF URL */}
                <div className="pt-1">
                  <span className="text-[11px] text-slate-400 block mb-1">
                    अथवा सीधे PDF का वेब लिंक (URL) दर्ज करें:
                  </span>
                  <input
                    type="url"
                    value={pdfUrl}
                    onChange={(e) => setPdfUrl(e.target.value)}
                    placeholder="https://example.com/newspaper.pdf"
                    className="w-full px-3.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Total Pages Count */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    कुल पृष्ठ संख्या (Total Pages)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="64"
                    value={pageCount}
                    onChange={(e) => setPageCount(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                {/* Active Checkbox */}
                <div className="space-y-1.5 flex flex-col justify-end">
                  <label className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 text-red-600 rounded"
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      तुरंत सक्रिय करें (Publish Active)
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/30 flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{editingId ? "अपडेट सहेजें" : "समाचार पत्र अपलोड करें"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="समाचार पत्र हटाएं?"
        message={`क्या आप सुनिश्चित हैं कि आप "${confirmModal.title}" को स्थायी रूप से हटाना चाहते हैं? यह कार्रवाई वापस नहीं ली जा सकती।`}
        confirmLabel="हटाएं (Delete)"
        isDanger={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmModal({ isOpen: false, id: null, title: "" })}
      />
    </div>
  );
}

