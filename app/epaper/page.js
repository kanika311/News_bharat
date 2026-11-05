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
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
  Layers,
  Loader2,
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

  // PDF.js Page-by-Page Viewer States
  const [pdfLibReady, setPdfLibReady] = useState(false);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageRendering, setPageRendering] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [zoomScale, setZoomScale] = useState(1.0);
  const [turnAnimation, setTurnAnimation] = useState("");

  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);
  const readerContainerRef = useRef(null);

  // 1. Dynamically Load Local PDF.js Engine (/pdf.min.js)
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
      setPdfLibReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "/pdf.min.js";
    script.async = true;
    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
        setPdfLibReady(true);
      }
    };
    script.onerror = () => {
      console.warn("Local PDF.js load error, falling back to CDN");
      const cdnScript = document.createElement("script");
      cdnScript.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      cdnScript.async = true;
      cdnScript.onload = () => {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          setPdfLibReady(true);
        }
      };
      document.body.appendChild(cdnScript);
    };

    document.body.appendChild(script);
  }, []);

  // 2. Authentic Paper Flip Sound using Web Audio API Synthesizer
  const playPageTurnSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // 1. White noise buffer to simulate physical newspaper surface friction
      const bufferSize = Math.floor(ctx.sampleRate * 0.22);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.07));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // 2. Bandpass filter to give that specific crisp paper rustle frequency
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.18);
      filter.Q.value = 2.2;

      // 3. Gain envelope (attack & decay)
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.45, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      noise.stop(ctx.currentTime + 0.22);
    } catch (e) {
      console.warn("Audio synthesis:", e);
    }
  };

  // 3. Fetch E-Paper Data from Backend
  const fetchEPaper = async (dateParam, editionParam) => {
    setLoading(true);
    try {
      const qDate = dateParam || "";
      const qEdition = editionParam && editionParam !== "all" ? editionParam : "";
      const res = await apiFetch(
        `/api/epaper?date=${encodeURIComponent(qDate)}&edition=${encodeURIComponent(qEdition)}`
      );

      if (res && res.success) {
        setPaper(res.epaper || null);
        setLatestPaper(res.latestEpaper || null);
        setRequestedDateFound(res.requestedDateFound !== false);
        setArchiveDates(res.archiveDates || []);
        if (res.editions && res.editions.length) {
          setEditionsList(res.editions);
        }

        if (!dateParam && res.epaper) {
          const epDate =
            res.epaper.dateStr ||
            (res.epaper.date ? new Date(res.epaper.date).toISOString().split("T")[0] : "");
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

  // 4. Load PDF Document via PDF.js when paper.pdfUrl is available
  useEffect(() => {
    if (!pdfLibReady || !paper?.pdfUrl || typeof window === "undefined" || !window.pdfjsLib) return;

    let isCancelled = false;

    const loadDoc = async () => {
      try {
        setPageRendering(true);
        const loadingTask = window.pdfjsLib.getDocument({
          url: paper.pdfUrl,
          cMapUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (isCancelled) return;

        setPdfDoc(doc);
        setTotalPages(doc.numPages || paper.pageCount || 1);
        setCurrentPage(1);
      } catch (err) {
        console.error("Failed to load PDF doc:", err);
      } finally {
        setPageRendering(false);
      }
    };

    loadDoc();

    return () => {
      isCancelled = true;
    };
  }, [pdfLibReady, paper?.pdfUrl]);

  // 5. Render Current Page onto Canvas (High-DPI, Crisp Print Quality)
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || typeof window === "undefined") return;

    let isCancelled = false;

    const renderCurrentPage = async () => {
      setPageRendering(true);
      try {
        const page = await pdfDoc.getPage(currentPage);
        if (isCancelled || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        // Calculate responsive scale based on container width
        const containerWidth = readerContainerRef.current
          ? Math.min(readerContainerRef.current.clientWidth - 40, 960)
          : 850;

        const unscaledViewport = page.getViewport({ scale: 1 });
        const scale = (containerWidth / unscaledViewport.width) * zoomScale;

        // Support Retina / High-DPI screens
        const pixelRatio = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale: scale * pixelRatio });

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width / pixelRatio}px`;
        canvas.style.height = `${viewport.height / pixelRatio}px`;

        const renderContext = {
          canvasContext: context,
          viewport,
        };

        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        renderTaskRef.current = page.render(renderContext);
        await renderTaskRef.current.promise;
      } catch (err) {
        if (err.name !== "RenderingCancelledException") {
          console.error("PDF page render error:", err);
        }
      } finally {
        setPageRendering(false);
      }
    };

    renderCurrentPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {}
      }
    };
  }, [pdfDoc, currentPage, zoomScale]);

  // 6. Page Turn Controller (with Sound and Flip Transition)
  const goToPage = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    playPageTurnSound();
    setTurnAnimation(newPage > currentPage ? "slide-next" : "slide-prev");
    setCurrentPage(newPage);
    setTimeout(() => setTurnAnimation(""), 400);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  // Keyboard navigation (Left / Right arrow keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") handlePrevPage();
      if (e.key === "ArrowRight") handleNextPage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, totalPages, soundEnabled]);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    fetchEPaper(newDate, selectedEdition);
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
      await apiFetch(`/api/epaper/${paper._id}/download`, { method: "POST" });
    } catch (e) {}

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

  const handleJumpToLatest = () => {
    if (latestPaper) {
      const latestDateStr =
        latestPaper.dateStr ||
        (latestPaper.date ? new Date(latestPaper.date).toISOString().split("T")[0] : "");
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
        {/* TOP CONTROL BAR: Date Filter, Edition, Page Navigation & Sound */}
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
                    पेज टर्न रीडर
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formattedDate || "दैनिक समाचार पत्र"} • निष्पक्ष, निर्भीक और जनहितैषी आवाज़
                </p>
              </div>
            </div>

            {/* Right: Sound, Page Navigation & PDF Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Sound Toggle Button (Green when active) */}
              <button
                type="button"
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  if (!soundEnabled) playPageTurnSound();
                }}
                title={soundEnabled ? "पन्ने पलटने की आवाज़ चालू है (Mute Sound)" : "आवाज़ चालू करें (Enable Sound)"}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  soundEnabled
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800"
                    : "bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                }`}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-600 animate-pulse" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{soundEnabled ? "साउंड चालू" : "साउंड म्यूट"}</span>
              </button>

              {/* Page Navigation (< पिछला | 1 / 4 | अगला >) */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1}
                  className="px-2.5 py-1 text-slate-700 dark:text-slate-300 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors cursor-pointer"
                >
                  ‹ पिछला
                </button>

                <span className="px-2.5 py-1 text-slate-900 dark:text-white font-black font-mono bg-white dark:bg-slate-900 rounded-lg shadow-2xs">
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:opacity-30 text-white font-extrabold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  अगला ›
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => setZoomScale((z) => Math.max(0.7, z - 0.15))}
                  className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 cursor-pointer"
                  title="ज़ूम कम करें"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono font-bold px-1 text-slate-600 dark:text-slate-300">
                  {Math.round(zoomScale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomScale((z) => Math.min(1.6, z + 0.15))}
                  className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 cursor-pointer"
                  title="ज़ूम बढ़ाएं"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Fullscreen Button */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>फुल स्क्रीन</span>
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
            </div>
          </div>

          {/* Bottom Filter Controls: Date Picker & Edition Selector */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Date Filter Input */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-2xs">
                <Calendar className="w-4 h-4 text-red-600 shrink-0" />
                <span className="text-slate-500 dark:text-slate-400 font-medium">दिनांक:</span>
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
                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>आज का अंक</span>
              </button>

              {/* Edition Filter Dropdown */}
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-2xs">
                <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span className="text-slate-500 dark:text-slate-400 font-medium">संस्करण:</span>
                <select
                  value={selectedEdition}
                  onChange={(e) => handleEditionChange(e.target.value)}
                  className="bg-transparent text-xs font-extrabold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="all" className="dark:bg-slate-900">
                    सभी संस्करण
                  </option>
                  {editionsList.map((ed) => (
                    <option key={ed} value={ed} className="dark:bg-slate-900">
                      {ed}
                    </option>
                  ))}
                </select>
              </div>

              {/* Archives Drawer Button */}
              <button
                type="button"
                onClick={() => setShowArchiveDrawer(!showArchiveDrawer)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  showArchiveDrawer
                    ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:border-red-800"
                    : "bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                }`}
              >
                <History className="w-3.5 h-3.5 text-red-600" />
                <span>पुराने अंक ({archiveDates.length})</span>
              </button>
            </div>

            {/* Quick date pills for recent editions */}
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
        {/* NEWSPAPER CANVAS WITH FLOATING PREV / NEXT ARROWS & SOUND      */}
        {/* ============================================================== */}
        <div
          ref={readerContainerRef}
          className="relative bg-[#e2e8f0]/80 dark:bg-slate-900/90 rounded-3xl p-3 sm:p-8 flex items-center justify-center min-h-[750px] shadow-inner overflow-hidden border border-slate-200 dark:border-slate-800 select-none"
        >
          {/* FLOATING LEFT CIRCULAR BUTTON (<) */}
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            aria-label="Previous Page"
            className={`absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700 transition-all z-20 ${
              currentPage <= 1
                ? "opacity-25 cursor-not-allowed"
                : "hover:scale-110 active:scale-95 hover:bg-red-50 hover:text-red-600 dark:hover:bg-slate-700 cursor-pointer"
            }`}
            title="पिछला पृष्ठ (Turn Left)"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>

          {/* FLOATING RIGHT CIRCULAR BUTTON (>) */}
          <button
            type="button"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            aria-label="Next Page"
            className={`absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700 transition-all z-20 ${
              currentPage >= totalPages
                ? "opacity-25 cursor-not-allowed"
                : "hover:scale-110 active:scale-95 hover:bg-red-50 hover:text-red-600 dark:hover:bg-slate-700 cursor-pointer"
            }`}
            title="अगला पृष्ठ (Turn Right)"
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>

          {loading || (!pdfLibReady && paper) ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
              <div className="text-center space-y-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  समाचार पत्र लोड हो रहा है...
                </p>
                <p className="text-xs text-slate-400">PDF पेज-बाई-पेज इंजन तैयार हो रहा है</p>
              </div>
            </div>
          ) : paper && paper.pdfUrl ? (
            /* REALISTIC NEWSPAPER PAGE CANVAS (Single Page View with Turn Animation) */
            <div className="relative flex flex-col items-center justify-center max-w-full">
              {/* Top Page Masthead Indicator */}
              <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-t-2xl px-4 py-2 border-t border-x border-slate-300 dark:border-slate-700 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm">
                <span className="flex items-center gap-1.5 text-red-600 font-extrabold">
                  <MapPin className="w-3.5 h-3.5" />
                  {paper.edition}
                </span>
                <span className="font-extrabold text-slate-900 dark:text-white">
                  {paper.title} • पृष्ठ {currentPage} / {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                    ✓ सत्यापित संस्करण
                  </span>
                  <a
                    href={paper.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5"
                  >
                    <span>नये टैब में</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* The Single High-DPI Page Canvas */}
              <div
                className={`relative bg-white shadow-2xl rounded-b-2xl border border-slate-300 dark:border-slate-700 overflow-hidden flex items-center justify-center min-h-[600px] transition-all duration-300 ${
                  turnAnimation === "slide-next"
                    ? "animate-in slide-in-from-right-4 fade-in-50"
                    : turnAnimation === "slide-prev"
                    ? "animate-in slide-in-from-left-4 fade-in-50"
                    : ""
                }`}
              >
                {/* Page Rendering Spinner Overlay */}
                {pageRendering && (
                  <div className="absolute inset-0 z-10 bg-white/60 dark:bg-black/40 backdrop-blur-2xs flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                  </div>
                )}

                <canvas ref={canvasRef} className="block max-w-full h-auto" />
              </div>

              {/* Keyboard Tip & Sound Notification */}
              <div className="flex items-center justify-between w-full max-w-4xl text-[11px] text-slate-500 pt-2 px-1">
                <span>
                  ⌨️ कीबोर्ड एरो <b>← पिछला</b> | <b>अगला →</b> दबाकर भी पन्ने पलट सकते हैं
                </span>
                {soundEnabled && (
                  <span className="flex items-center gap-1 text-emerald-600 font-bold">
                    <Volume2 className="w-3 h-3" /> पन्ना पलटने की साउंड ऑन है
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* EMPTY STATE: NO PAPER FOUND FOR SELECTED DATE */
            <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center space-y-5">
              <div className="w-20 h-20 rounded-3xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shadow-inner">
                <AlertCircle className="w-10 h-10" />
              </div>

              <div className="space-y-1.5 max-w-md">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  चयनित दिनांक ({selectedDate}) का समाचार पत्र उपलब्ध नहीं है
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  इस दिनांक के लिए कोई ई-संस्करण अपलोड नहीं किया गया है। आप आज का ताज़ा अंक पढ़ सकते
                  हैं या नीचे दिए गए पुरालेख में से किसी अन्य तारीख का चुनाव कर सकते हैं।
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
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* BOTTOM PAGINATION BAR: Numbered Page Jump Buttons              */}
        {/* ============================================================== */}
        {paper && totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-1">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="flex items-center gap-1 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-40 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl shadow-xs hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> पिछला पृष्ठ
            </button>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => goToPage(p)}
                  className={`w-9 h-9 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                    currentPage === p
                      ? "bg-red-600 text-white shadow-md shadow-red-600/30 scale-105"
                      : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                  title={`पृष्ठ ${p} पर जाएं`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/20 cursor-pointer transition-colors"
            >
              अगला पृष्ठ <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

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
              <span className="text-[11px] text-slate-400">तारीख पर क्लिक करके पुराना अखबार पढ़ें</span>
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
                    <Calendar
                      className={`w-3.5 h-3.5 ${isCurrent ? "text-white" : "text-red-600"}`}
                    />
                    <span>{item.dateStr}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        isCurrent
                          ? "bg-red-700 text-white"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                      }`}
                    >
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
