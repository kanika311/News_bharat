"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon, FolderArchive, Check } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function ImageUploader({ value, onChange, label = "Featured Image" }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaList, setMediaList] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const fileInputRef = useRef(null);

  const fetchMedia = async () => {
    setLoadingMedia(true);
    try {
      const res = await apiFetch("/api/media?type=image");
      if (res.success) {
        setMediaList(res.media || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMedia(false);
    }
  };

  const openMediaPicker = (e) => {
    e?.stopPropagation();
    setShowMediaModal(true);
    fetchMedia();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await apiFetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      if (res.success && res.url) {
        onChange(res.url);
      } else {
        setError(res.message || "Upload failed");
      }
    } catch (err) {
      setError(err.message || "Network error uploading image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSelectFromMedia = (url) => {
    onChange(url);
    setShowMediaModal(false);
  };

  const handleRemove = () => {
    onChange("");
    setError("");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          {label}
        </label>
        <button
          type="button"
          onClick={openMediaPicker}
          className="px-2 py-0.5 rounded-lg text-[11px] font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 border border-red-200 dark:border-red-900/60 flex items-center gap-1 transition-colors"
        >
          <FolderArchive className="w-3 h-3" />
          <span>मीडिया से चुनें</span>
        </button>
      </div>

      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <img
            src={value}
            alt="Uploaded preview"
            className="w-full h-48 object-cover transition-transform group-hover:scale-105 duration-300"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={openMediaPicker}
              className="p-2 bg-white text-slate-900 rounded-lg hover:bg-slate-100 shadow-lg text-xs flex items-center gap-1 font-bold"
            >
              <FolderArchive className="w-4 h-4 text-red-600" />
              <span>Media Library</span>
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-lg text-xs flex items-center gap-1 font-medium"
            >
              <X className="w-4 h-4" />
              <span>Remove</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center hover:border-red-500 hover:bg-red-50/10 cursor-pointer transition-all flex flex-col items-center justify-center"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <Loader2 className="w-7 h-7 text-red-600 animate-spin" />
              <span className="text-xs text-slate-500 font-medium">Compressing & uploading WebP image...</span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 flex items-center justify-center mb-2">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Click to upload image (Auto WebP Compressed)
              </p>
              <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, WEBP, GIF up to 10MB</p>

              <button
                type="button"
                onClick={openMediaPicker}
                className="mt-3 px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-semibold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <FolderArchive className="w-3.5 h-3.5 text-red-600" />
                <span>या मीडिया लाइब्रेरी से चुनें (Choose from Media)</span>
              </button>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {/* Manual URL Input Option */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or paste image URL directly..."
          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-800 dark:text-slate-200"
        />
      </div>

      {error && <p className="text-xs text-red-600 font-medium mt-1">{error}</p>}

      {/* Media Library Picker Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <FolderArchive className="w-5 h-5 text-red-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Media Library (फोटो चुनें)
                  </h3>
                  <p className="text-[11px] text-slate-400">Select an existing photo from the repository</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMediaModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              {loadingMedia ? (
                <div className="p-12 text-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-red-600" />
                  Loading media library images...
                </div>
              ) : mediaList.length === 0 ? (
                <div className="p-12 text-center text-slate-400 italic text-xs">
                  No images found in library. Upload a photo first.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {mediaList.map((item) => {
                    const isSelected = value === item.url;
                    return (
                      <div
                        key={item.filename}
                        onClick={() => handleSelectFromMedia(item.url)}
                        className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all hover:scale-[1.02] ${
                          isSelected
                            ? "border-red-600 ring-2 ring-red-600/30"
                            : "border-slate-200 dark:border-slate-800 hover:border-red-500"
                        } bg-slate-50 dark:bg-slate-800`}
                      >
                        <img
                          src={item.url}
                          alt=""
                          className="w-full h-28 object-cover"
                        />
                        <div className="p-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                          <p className="text-[10px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {item.filename}
                          </p>
                          <span className="text-[9px] text-slate-400">
                            {(item.size / 1024).toFixed(0)} KB
                          </span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center shadow-md">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-3">
              <button
                type="button"
                onClick={() => {
                  setShowMediaModal(false);
                  fileInputRef.current?.click();
                }}
                className="px-3 py-1.5 bg-red-50 dark:bg-red-950/40 text-red-600 rounded-xl text-xs font-bold border border-red-200 dark:border-red-800 flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New Image</span>
              </button>
              <button
                type="button"
                onClick={() => setShowMediaModal(false)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
