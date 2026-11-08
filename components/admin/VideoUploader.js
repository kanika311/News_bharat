"use client";

import React, { useState, useRef, useEffect } from "react";
import { Upload, X, Loader2, Video as VideoIcon, Film, FolderArchive, Link as LinkIcon, Check, Play } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function VideoUploader({ value, onChange, onDurationDetected, label = "Video Source" }) {
  const [tab, setTab] = useState(value && value.startsWith("/uploads/") ? "upload" : "embed");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaList, setMediaList] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch Media Library items
  const fetchMedia = async () => {
    setLoadingMedia(true);
    try {
      const res = await apiFetch("/api/media");
      if (res.success) {
        setMediaList(res.media || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMedia(false);
    }
  };

  const openMediaPicker = () => {
    setShowMediaModal(true);
    fetchMedia();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);
    setUploadProgress(20);

    try {
      // Try to detect video duration client-side
      try {
        const videoElem = document.createElement("video");
        videoElem.preload = "metadata";
        videoElem.src = URL.createObjectURL(file);
        videoElem.onloadedmetadata = () => {
          window.URL.revokeObjectURL(videoElem.src);
          const totalSec = Math.round(videoElem.duration);
          if (totalSec && onDurationDetected) {
            const mins = String(Math.floor(totalSec / 60)).padStart(2, "0");
            const secs = String(totalSec % 60).padStart(2, "0");
            onDurationDetected(`${mins}:${secs}`);
          }
        };
      } catch (err) {
        // Non-blocking duration read
      }

      const formData = new FormData();
      formData.append("video", file);

      setUploadProgress(50);
      const res = await apiFetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(100);
      if (res.success && res.url) {
        onChange(res.url);
      } else {
        setError(res.message || "Failed to upload video clip");
      }
    } catch (err) {
      setError(err.message || "Network error uploading video file");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSelectFromMedia = (url) => {
    onChange(url);
    setShowMediaModal(false);
  };

  const isLocalVideo = value && (value.startsWith("/uploads/") || value.match(/\.(mp4|webm|mov|mkv)$/i));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          {label} <span className="text-red-500">*</span>
        </label>
        
        {/* Toggle Mode: Upload vs Media Library vs Embed */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-semibold">
          <button
            type="button"
            onClick={() => setTab("upload")}
            className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${
              tab === "upload" ? "bg-white dark:bg-slate-900 text-red-600 shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("library");
              openMediaPicker();
            }}
            className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${
              tab === "library" ? "bg-white dark:bg-slate-900 text-red-600 shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <FolderArchive className="w-3 h-3" />
            <span>Media Library</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("embed")}
            className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${
              tab === "embed" ? "bg-white dark:bg-slate-900 text-red-600 shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>YouTube / URL</span>
          </button>
        </div>
      </div>

      {/* 1. Value Preview (When video is selected/uploaded) */}
      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black shadow-sm">
          {isLocalVideo ? (
            <video
              src={value}
              controls
              className="w-full h-44 object-contain bg-black"
            />
          ) : (
            <div className="p-4 bg-slate-900 text-white flex flex-col items-center justify-center min-h-[140px] text-center gap-2">
              <Film className="w-8 h-8 text-red-500 animate-pulse" />
              <div className="text-xs font-mono text-slate-300 break-all max-w-[90%] truncate">
                {value}
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                External Video Embed
              </span>
            </div>
          )}

          <div className="p-2.5 bg-slate-100 dark:bg-slate-800/90 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 truncate max-w-[200px]">
              {value}
            </span>
            <button
              type="button"
              onClick={() => onChange("")}
              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
            >
              <X className="w-3 h-3" />
              <span>Remove / Change</span>
            </button>
          </div>
        </div>
      ) : (
        /* 2. No video selected: Show Active Tab view */
        <div>
          {tab === "upload" && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-red-500 hover:bg-red-50/10 cursor-pointer transition-all flex flex-col items-center justify-center"
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2 py-2">
                  <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-bold">
                    Uploading video file...
                  </span>
                  <p className="text-[10px] text-slate-400">Processing media asset (MP4/WEBM/MOV up to 150MB)</p>
                </div>
              ) : (
                <>
                  <div className="w-11 h-11 rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-600 flex items-center justify-center mb-2.5 shadow-xs">
                    <VideoIcon className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Click to upload video file or drag and drop
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    MP4, WEBM, MOV, MKV up to 150MB
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openMediaPicker();
                    }}
                    className="mt-3 px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-semibold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <FolderArchive className="w-3.5 h-3.5 text-red-600" />
                    <span>Or choose from Media Library</span>
                  </button>
                </>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {tab === "embed" && (
            <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                YouTube / Vimeo / Direct Stream URL
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={value || ""}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 text-slate-800 dark:text-slate-200"
                />
              </div>
              <p className="text-[10px] text-slate-400">
                Paste any public YouTube, Vimeo, or direct `.mp4` video URL
              </p>
              <div className="flex items-center gap-1.5 p-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-xl text-[10px] text-amber-800 dark:text-amber-300 font-semibold">
                <span className="text-xs">💡</span>
                <span>अनुशंसित (Recommended): YouTube लिंक का उपयोग करने से सर्वर बैंडविड्थ और मेमोरी पूरी तरह सुरक्षित रहती है।</span>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-600 font-medium mt-1">{error}</p>}

      {/* 3. Media Library Selector Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <FolderArchive className="w-5 h-5 text-red-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Media Library (मीडिया से चुनें)
                  </h3>
                  <p className="text-[11px] text-slate-400">Select an uploaded video or media file</p>
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

            {/* Media list */}
            <div className="flex-1 overflow-y-auto pr-1">
              {loadingMedia ? (
                <div className="p-12 text-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-red-600" />
                  Loading media library files...
                </div>
              ) : mediaList.length === 0 ? (
                <div className="p-12 text-center text-slate-400 italic text-xs">
                  No media files found. Upload a video file first.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {mediaList.map((item) => {
                    const isVid = item.type === "video" || item.filename.match(/\.(mp4|webm|mov|mkv)$/i);
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
                        {isVid ? (
                          <div className="h-28 bg-slate-900 flex flex-col items-center justify-center text-slate-300 relative">
                            <Film className="w-8 h-8 text-red-500 mb-1" />
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-white">
                              VIDEO CLIP
                            </span>
                            <div className="absolute inset-0 bg-red-600/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Play className="w-6 h-6 text-white fill-white" />
                            </div>
                          </div>
                        ) : (
                          <img
                            src={item.url}
                            alt=""
                            className="w-full h-28 object-cover"
                          />
                        )}

                        <div className="p-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                          <p className="text-[10px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {item.filename}
                          </p>
                          <span className="text-[9px] text-slate-400">
                            {(item.size / (1024 * 1024)).toFixed(1)} MB
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
                <span>Upload New Video File</span>
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
