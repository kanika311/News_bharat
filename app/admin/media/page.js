"use client";

import React, { useState, useEffect } from "react";
import { FolderArchive, Upload, Trash2, Copy, Check, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import ImageUploader from "@/components/admin/ImageUploader";
import ConfirmModal from "@/components/admin/ConfirmModal";

export default function MediaLibraryPage() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState("");
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, filename: null });

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

  const confirmDelete = async () => {
    try {
      await apiFetch(`/api/media/${confirmModal.filename}`, { method: "DELETE" });
      setConfirmModal({ isOpen: false, filename: null });
      loadMedia();
    } catch (e) {
      alert("Error deleting media file");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Media Library & Assets
          </h1>
          <p className="text-xs text-slate-500">
            Central repository of editorial photographs, graphics, and infographic assets ({media.length} files)
          </p>
        </div>
      </div>

      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <ImageUploader value="" onChange={() => loadMedia()} label="Upload New Asset to Repository" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-6">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Uploaded Images</h2>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-red-600" />
            Loading assets...
          </div>
        ) : media.length === 0 ? (
          <div className="p-12 text-center text-slate-400 italic text-xs">
            No media files uploaded yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {media.map((item) => (
              <div
                key={item.filename}
                className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800"
              >
                <img src={item.url} alt="" className="w-full h-32 object-cover" />
                <div className="p-2 text-[10px] text-slate-500 truncate">{item.filename}</div>

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
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Media File?"
        message="This file will be permanently removed from server disk storage."
        onConfirm={confirmDelete}
        onClose={() => setConfirmModal({ isOpen: false, filename: null })}
      />
    </div>
  );
}
