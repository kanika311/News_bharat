"use client";

import React, { useState, useEffect, useRef } from "react";
import { FolderArchive, Upload, Trash2, Copy, Check, Loader2, Film, Image as ImageIcon, Play, FileVideo } from "lucide-react";
import { apiFetch } from "@/lib/api";
import ImageUploader from "@/components/admin/ImageUploader";
import ConfirmModal from "@/components/admin/ConfirmModal";

export default function MediaLibraryPage() {
  const [media, setMedia] = useState([]);
  const [filterType, setFilterType] = useState("all"); // 'all' | 'image' | 'video'
  const [loading, setLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [activePreviewVideo, setActivePreviewVideo] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, filename: null });
  const fileInputRef = useRef(null);

  const loadMedia = async () => {
    try {
      const res = await apiFetch("/api/media");
      if (res.success) setMedia(res.media || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(""), 2000);
  };

  const handleDirectUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await apiFetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      if (res.success) {
        loadMedia();
      } else {
        alert(res.message || "Upload failed");
      }
    } catch (err) {
      alert("Error uploading media file");
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const confirmDelete = async () => {
    try {
      await apiFetch(`/api/media/${confirmModal.filename}`, { method: "DELETE" });
      setConfirmModal({ isOpen: false, filename: null });
      loadMedia();
    } catch (e) {
      alert("Error deleting media file");
    }
  };

  const filteredMedia = media.filter((item) => {
    if (filterType === "image") return item.type === "image";
    if (filterType === "video") return item.type === "video";
    return true;
  });

  const videoCount = media.filter((m) => m.type === "video").length;
  const imageCount = media.filter((m) => m.type === "image").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Media Library & Assets (मीडिया लाइब्रेरी)
          </h1>
          <p className="text-xs text-slate-500">
            Central repository of editorial photos (WebP auto-compressed) & video clips ({media.length} files)
          </p>
        </div>

        {/* Direct Upload Button */}
        <div>
          <button
            type="button"
            disabled={uploadingFile}
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/30 flex items-center gap-2 transition-all"
          >
            {uploadingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>Upload Photo / Video (WebP)</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/mp4,video/webm,video/quicktime,video/*"
            onChange={handleDirectUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setFilterType("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            filterType === "all"
              ? "bg-red-600 text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          }`}
        >
          All Assets ({media.length})
        </button>
        <button
          onClick={() => setFilterType("image")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
            filterType === "image"
              ? "bg-red-600 text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Photos & Graphics ({imageCount})</span>
        </button>
        <button
          onClick={() => setFilterType("video")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
            filterType === "video"
              ? "bg-red-600 text-white shadow-xs"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          }`}
        >
          <FileVideo className="w-3.5 h-3.5" />
          <span>Video Clips ({videoCount})</span>
        </button>
      </div>

      {/* Media Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-6">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-red-600" />
            Loading assets...
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="p-12 text-center text-slate-400 italic text-xs">
            No media files found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredMedia.map((item) => {
              const isVid = item.type === "video";
              const isWebp = item.filename.endsWith(".webp");
              return (
                <div
                  key={item.filename}
                  className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex flex-col justify-between"
                >
                  <div className="relative h-32 bg-slate-950 flex items-center justify-center overflow-hidden">
                    {isVid ? (
                      <div
                        onClick={() => setActivePreviewVideo(item.url)}
                        className="cursor-pointer w-full h-full flex flex-col items-center justify-center text-slate-300"
                      >
                        <Film className="w-8 h-8 text-red-500 mb-1" />
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/70 text-white">
                          VIDEO
                        </span>
                        <div className="absolute inset-0 bg-red-600/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Play className="w-6 h-6 text-white fill-white" />
                        </div>
                      </div>
                    ) : (
                      <img
                        src={item.url}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}

                    {isWebp && (
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-emerald-600 text-white text-[8px] font-extrabold uppercase rounded shadow-xs">
                        WEBP
                      </span>
                    )}
                  </div>

                  <div className="p-2 text-[10px] text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                    <p className="truncate font-semibold">{item.filename}</p>
                    <span className="text-[9px] text-slate-400">
                      {(item.size / (1024 * (isVid ? 1024 : 1))).toFixed(1)} {isVid ? "MB" : "KB"}
                    </span>
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleCopy(item.url)}
                      className="p-2 bg-white text-slate-800 rounded-lg hover:bg-slate-100 shadow-lg text-xs"
                      title="Copy URL"
                    >
                      {copiedUrl === item.url ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => setConfirmModal({ isOpen: true, filename: item.filename })}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-lg text-xs"
                      title="Delete File"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Video Preview Modal */}
      {activePreviewVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-2xl rounded-3xl overflow-hidden border border-slate-800 shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-white">
              <span className="text-xs font-mono truncate">{activePreviewVideo}</span>
              <button
                onClick={() => setActivePreviewVideo(null)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded-lg"
              >
                Close
              </button>
            </div>
            <video src={activePreviewVideo} controls autoPlay className="w-full max-h-[60vh] bg-black rounded-xl" />
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Media File"
        message={`Are you sure you want to permanently delete "${confirmModal.filename}"? This action cannot be undone.`}
        confirmText="Delete Asset"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmModal({ isOpen: false, filename: null })}
      />
    </div>
  );
}
