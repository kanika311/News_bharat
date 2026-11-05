"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Newspaper,
  Calendar,
  Download,
  Share2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  MapPin,
  Search,
  ExternalLink,
  Archive,
  History,
  FileText,
  AlertCircle,
  Eye,
  Check,
  RefreshCw,
  Clock,
  Sparkles,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function EPaperPage() {
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedEdition, setSelectedEdition] = useState("all");
  const [paper, setPaper] = useState(null);
  const [latestPaper, setLatestPaper] = useState(null);
  const [requestedDateFound, setRequestedDateFound] = useState(true);
  const [archiveDates, setArchiveDates] = useState([]);
  const [editionsList, setEditionsList] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showArchiveDrawer, setShowArchiveDrawer] = useState(false);
  const readerContainerRef = useRef(null);

  // Fetch e-paper data
  const fetchEPaper = async (dateParam, editionParam) => {
    setLoading(true);
    try {
      const qDate = dateParam || "";
      const qEdition = editionParam && editionParam !== "all" ? editionParam : "";
      const res = await apiFetch(`/api/epaper?date=${encodeURIComponent(qDate)}&edition=${encodeURIComponent(qEdition)}`);

      if (res && res.success) {
        setPaper(res.epaper || null);
        setLatestPaper(res.latestEpaper || null);
        setRequestedDateFound(res.requestedDateFound !== false);
        setArchiveDates(res.archiveDates || []);
        if (res.editions && res.editions.length) {
          setEditionsList(res.editions);
        }

        // If no date was given initially and we got a paper, sync selectedDate
        if (!dateParam && res.epaper) {
          const epDate = res.epaper.dateStr || (res.epaper.date ? new Date(res.epaper.date).toISOString().split("T")[0] : "");
          if (epDate) setSelectedDate(epDate);
        }
      }
    } catch (e) {
      console.error("Failed to load e-paper:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if URL has ?date=
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlDate = params.get("date");
      const urlEdition = params.get("edition");
      if (urlDate) setSelectedDate(urlDate);
      if (urlEdition) setSelectedEdition(urlEdition);
      fetchEPaper(urlDate || selectedDate, urlEdition || selectedEdition);
    } else {
      fetchEPaper(selectedDate, selectedEdition);
    }
  }, []);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    fetchEPaper(newDate, selectedEdition);
    // Update URL without full refresh
    if (typeof window !== "undefined") {
      const url = new URL(window.location);
      url.searchParams.set("date", newDate);
      window.history.replaceState({}, "", url);
    }
  };

  const handleEditionChange = (newEdition) => {
    setSelectedEdition(newEdition);
    fetchEPaper(selectedDate, newEdition);
  };

  const handleDownload = async () => {
    if (!paper) return;
    try {
      // Track download metric
      await apiFetch(`/api/epaper/${paper._id}/download`, { method: "POST" });
    } catch (e) {}

    // Trigger download
    const link = document.createElement("a");
    link.href = paper.pdfUrl;
    link.download = `${paper.title || "Swar-Media-EPaper"}.pdf`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: paper?.title || "दैनिक स्वर मीडिया ई-पेपर",
          text: `स्वर मीडिया दैनिक समाचार पत्र (${selectedDate}) का ई-संस्करण पढ़ें:`,
          url,
        });
        return;
      } catch (e) {}
    }
    // Fallback: copy to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      readerContainerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Jump to latest active paper
  const handleJumpToLatest = () => {
    if (latestPaper) {
      const latestDateStr = latestPaper.dateStr || (latestPaper.date ? new Date(latestPaper.date).toISOString().split("T")[0] : "");
      if (latestDateStr) {
        handleDateChange(latestDateStr);
      }
    } else {
      const today = new Date().toISOString().split("T")[0];
      handleDateChange(today);
    }
  };

  const formattedDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString("hi-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className="w-full bg-[#f8fafc] dark:bg-slate-950 min-h-screen py-3 sm:py-6 text-slate-900 dark:text-slate-100 font-sans">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 space-y-4">
        {/* ============================================================== */}
        {/* TOP CONTROL BAR: Date Filter, Edition, Quick Jump & Actions     */}
        {/* ============================================================== */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-3 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Left: Branding & Current Edition Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-600 text-white flex items-center justify-center shadow-md shadow-red-600/20 shrink-0">
                <Newspaper className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-950 dark:text-white">
                    स्वर मीडिया दैनिक ई-अखबार
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400">
                    <Sparkles className="w-3 h-3" />
                    डिजिटल संस्करण
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formattedDate || "दैनिक समाचार पत्र"} • निष्पक्ष, निर्भीक और जनहितैषी आवाज़
                </p>
              </div>
            </div>

            {/* Right: Action Buttons (Archives Drawer, Share, Download, Fullscreen) */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Archives Drawer Button */}
              <button
                type="button"
                onClick={() => setShowArchiveDrawer(!showArchiveDrawer)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  showArchiveDrawer
                    ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:border-red-800"
                    : "bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                }`}
              >
                <History className="w-3.5 h-3.5 text-red-600" />
                <span>पुराने अंक ({archiveDates.length})</span>
              </button>

              {/* Share Button */}
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                title="अखबार साझा करें"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? "लिंक कॉपी हो गया!" : "साझा करें"}</span>
              </button>

              {/* Download PDF Button */}
              {paper && paper.pdfUrl && (
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-xl text-xs font-bold shadow-sm shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF डाउनलोड</span>
                </button>
              )}

              {/* Fullscreen Button */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>फुल स्क्रीन</span>
              </button>
            </div>
          </div>

          {/* Bottom Filter Controls: Date Picker & Edition Selector */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Date Filter Input */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/90 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-2xs">
                <Calendar className="w-4 h-4 text-red-600 shrink-0" />
                <span className="text-slate-500 dark:text-slate-400 font-medium">दिनांक चुनें:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="bg-transparent text-xs font-extrabold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                />
              </div>

              {/* Jump to Today Button */}
              <button
                type="button"
                onClick={handleJumpToLatest}
                className="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>आज का ताज़ा अंक</span>
              </button>

              {/* Edition Filter Dropdown */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/90 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-2xs">
                <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span className="text-slate-500 dark:text-slate-400 font-medium">संस्करण:</span>
                <select
                  value={selectedEdition}
                  onChange={(e) => handleEditionChange(e.target.value)}
                  className="bg-transparent text-xs font-extrabold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="all" className="dark:bg-slate-900">सभी संस्करण</option>
                  {editionsList.map((ed) => (
                    <option key={ed} value={ed} className="dark:bg-slate-900">
                      {ed}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick date pills for the 4 most recent editions */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 text-[11px] font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3" /> हाल के अंक:
              </span>
              {archiveDates.slice(0, 4).map((item) => {
                const isCurrent = item.dateStr === selectedDate;
                return (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => handleDateChange(item.dateStr)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-red-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    {item.dateStr}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* ARCHIVE DRAWER / HISTORY EXPLORER (Shown when toggled)         */}
        {/* ============================================================== */}
        {showArchiveDrawer && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Archive className="w-5 h-5 text-red-600" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  पुराने समाचार पत्र पुरालेख (Newspaper Archive Directory)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowArchiveDrawer(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1 rounded-lg"
              >
                बंद करें ✕
              </button>
            </div>

            {archiveDates.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                फिलहाल कोई पिछला संस्करण उपलब्ध नहीं है।
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[360px] overflow-y-auto pr-1">
                {archiveDates.map((item) => {
                  const isCurrent = item.dateStr === selectedDate;
                  const itemDateFormatted = item.date
                    ? new Date(item.date).toLocaleDateString("hi-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : item.dateStr;

                  return (
                    <div
                      key={item._id}
                      onClick={() => {
                        handleDateChange(item.dateStr);
                        setShowArchiveDrawer(false);
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                        isCurrent
                          ? "bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 shadow-sm"
                          : "bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-red-400 hover:bg-white dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="flex items-center gap-1 text-slate-900 dark:text-white font-extrabold">
                            <Calendar className="w-3.5 h-3.5 text-red-600" />
                            {itemDateFormatted}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-red-600 text-white">
                              सक्रिय
                            </span>
                          )}
                        </div>

                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                          {item.title}
                        </div>

                        <div className="flex items-center gap-1 text-[10px] text-red-600 font-semibold">
                          <MapPin className="w-3 h-3" />
                          <span>{item.edition}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-500">
                        <span>{item.pageCount || 4} पृष्ठ</span>
                        {item.fileSize && <span>{item.fileSize}</span>}
                        <span className="text-red-600 font-bold hover:underline">अंक पढ़ें →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* MAIN VIEWER CANVAS                                             */}
        {/* ============================================================== */}
        <div
          ref={readerContainerRef}
          className="relative bg-white dark:bg-slate-900 rounded-3xl p-3 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-md min-h-[600px] flex flex-col"
        >
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-24 space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
              <div className="text-center space-y-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  समाचार पत्र लोड हो रहा है...
                </p>
                <p className="text-xs text-slate-400">
                  दिनांक {selectedDate} का संस्करण प्राप्त किया जा रहा है
                </p>
              </div>
            </div>
          ) : paper && paper.pdfUrl ? (
            /* ============================================================ */
            /* SUCCESS STATE: EMBEDDED PDF VIEWER                          */
            /* ============================================================ */
            <div className="flex-1 flex flex-col space-y-3">
              {/* Paper Meta Banner */}
              <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-3 sm:p-4 border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-black text-slate-950 dark:text-white">
                      {paper.title}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                      ✓ सत्यापित PDF
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 text-red-600 font-semibold">
                      <MapPin className="w-3.5 h-3.5" />
                      {paper.edition}
                    </span>
                    <span>• {paper.pageCount || 4} पृष्ठ</span>
                    {paper.fileSize && <span>• {paper.fileSize}</span>}
                    {paper.views > 0 && <span>• 👁️ {paper.views} पाठकों ने देखा</span>}
                  </div>
                </div>

                {/* Right Direct Links */}
                <div className="flex items-center gap-2">
                  <a
                    href={paper.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>नये टैब में खोलें</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>डाउनलोड</span>
                  </button>
                </div>
              </div>

              {/* The Interactive Native PDF Viewer */}
              <div className="w-full flex-1 rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-inner bg-slate-100 dark:bg-slate-950 min-h-[750px] sm:min-h-[850px]">
                <iframe
                  src={`${paper.pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                  className="w-full h-full min-h-[750px] sm:min-h-[850px] border-0"
                  title={paper.title}
                />
              </div>

              {/* Viewer Footer Tips */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-1">
                <span>
                  💡 सुझाव: पेज ज़ूम, प्रिंट या सर्च करने के लिए ऊपर दिए गए टूल्स का उपयोग करें या "नये टैब में खोलें" पर क्लिक करें।
                </span>
                <span className="font-bold text-red-600">
                  स्वर मीडिया • निष्पक्ष पत्रकारिता
                </span>
              </div>
            </div>
          ) : (
            /* ============================================================ */
            /* EMPTY STATE: NO PAPER FOUND FOR SELECTED DATE                */
            /* ============================================================ */
            <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center space-y-5">
              <div className="w-20 h-20 rounded-3xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shadow-inner">
                <AlertCircle className="w-10 h-10" />
              </div>

              <div className="space-y-1.5 max-w-md">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  चयनित दिनांक ({selectedDate}) का समाचार पत्र उपलब्ध नहीं है
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  इस दिनांक के लिए कोई ई-संस्करण अपलोड नहीं किया गया है। आप नवीनतम अंक पढ़ सकते हैं या नीचे दिए गए पुरालेख में से किसी अन्य तारीख का चुनाव कर सकते हैं।
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleJumpToLatest}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/30 transition-transform active:scale-95 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>नवीनतम ई-पेपर खोलें</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowArchiveDrawer(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <History className="w-4 h-4 text-red-600" />
                  <span>उपलब्ध पुराने अंक देखें</span>
                </button>
              </div>

              {/* Recent Active Editions Carousel/Grid */}
              {archiveDates.length > 0 && (
                <div className="w-full max-w-3xl pt-8 space-y-3 text-left">
                  <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-red-600" />
                    <span>हाल के उपलब्ध समाचार पत्र:</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {archiveDates.slice(0, 3).map((item) => (
                      <div
                        key={item._id}
                        onClick={() => handleDateChange(item.dateStr)}
                        className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-red-500 cursor-pointer transition-all space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                          <span>{item.dateStr}</span>
                          <span className="text-[10px] text-red-600">{item.edition}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                          {item.title}
                        </p>
                        <div className="text-[10px] text-red-600 font-bold">
                          क्लिक करके पढ़ें →
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* BOTTOM ARCHIVE BROWSER BAR                                     */}
        {/* ============================================================== */}
        {archiveDates.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-red-600" />
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  पिछला पुरालेख एवं पुराने अंक (Past Editions Archive)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                तारीख पर क्लिक करके पुराना अखबार पढ़ें
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {archiveDates.map((item) => {
                const isCurrent = item.dateStr === selectedDate;
                return (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => handleDateChange(item.dateStr)}
                    className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-red-600 text-white border-red-600 shadow-md shadow-red-600/30 scale-102"
                        : "bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    <Calendar className={`w-3.5 h-3.5 ${isCurrent ? "text-white" : "text-red-600"}`} />
                    <span>{item.dateStr}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      isCurrent ? "bg-red-700 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}>
                      {item.edition.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
