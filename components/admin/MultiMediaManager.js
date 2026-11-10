"use client";

import React, { useState, useRef } from "react";
import {
  Images,
  Film,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  Link as LinkIcon,
  FolderArchive,
  X,
  Loader2,
  Play,
  ExternalLink,
  Check,
  Video as VideoIcon,
  Sparkles,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function MultiMediaManager({
  images = [],
  onImagesChange,
  videos = [],
  onVideosChange,
}) {
  const [activeTab, setActiveTab] = useState("photos"); // 'photos' | 'videos'

  // Photo states
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [photoUrlInput, setPhotoUrlInput] = useState("");
  const [photoCaptionInput, setPhotoCaptionInput] = useState("");
  const [showPhotoUrlModal, setShowPhotoUrlModal] = useState(false);
  const [showPhotoMediaModal, setShowPhotoMediaModal] = useState(false);
  const [mediaList, setMediaList] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const photoFileInputRef = useRef(null);

  // Video states
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [videoTitleInput, setVideoTitleInput] = useState("");
  const [videoCaptionInput, setVideoCaptionInput] = useState("");
  const [showVideoModal, setShowVideoModal] = useState(false);
  const videoFileInputRef = useRef(null);

  // Fetch Media Library
  const fetchMedia = async () => {
    setLoadingMedia(true);
    try {
      const res = await apiFetch("/api/media?type=image");
      if (res.success) {
        setMediaList(res.media || []);
      }
    } catch (e) {
      console.error("Fetch media error", e);
    } finally {
      setLoadingMedia(false);
    }
  };

  // --- PHOTO HANDLERS ---
  const handleMultiplePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingPhotos(true);
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const res = await apiFetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      const newUploadedItems = [];
      if (res.success) {
        if (Array.isArray(res.files) && res.files.length > 0) {
          res.files.forEach((f) => {
            newUploadedItems.push({
              url: f.url,
              caption: "",
              alt: f.filename || "",
            });
          });
        } else if (res.url) {
          newUploadedItems.push({
            url: res.url,
            caption: "",
            alt: res.filename || "",
          });
        }
      }

      if (newUploadedItems.length > 0) {
        onImagesChange([...images, ...newUploadedItems]);
      }
    } catch (err) {
      console.error("Multi-photo upload error, falling back to FileReader:", err);
      // Fallback: convert to WebP data URLs client-side
      for (const file of files) {
        try {
          const dataUrl = await readFileAsCompressedDataUrl(file);
          if (dataUrl) {
            images.push({ url: dataUrl, caption: file.name || "", alt: "" });
          }
        } catch (fErr) {}
      }
      onImagesChange([...images]);
    } finally {
      setUploadingPhotos(false);
      if (photoFileInputRef.current) photoFileInputRef.current.value = "";
    }
  };

  const handleAddPhotoByUrl = (e) => {
    e.preventDefault();
    if (!photoUrlInput.trim()) return;
    onImagesChange([
      ...images,
      {
        url: photoUrlInput.trim(),
        caption: photoCaptionInput.trim(),
        alt: photoCaptionInput.trim() || "News photo",
      },
    ]);
    setPhotoUrlInput("");
    setPhotoCaptionInput("");
    setShowPhotoUrlModal(false);
  };

  const handleSelectFromLibrary = (mediaItem) => {
    onImagesChange([
      ...images,
      {
        url: mediaItem.url,
        caption: mediaItem.originalName || "",
        alt: mediaItem.filename || "",
      },
    ]);
  };

  const handleUpdatePhotoCaption = (index, caption) => {
    const updated = [...images];
    updated[index] = { ...updated[index], caption };
    onImagesChange(updated);
  };

  const handleRemovePhoto = (index) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  const handleMovePhoto = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onImagesChange(updated);
  };

  // --- VIDEO HANDLERS ---
  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append("video", file);

      const res = await apiFetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      if (res.success && res.url) {
        onVideosChange([
          ...videos,
          {
            url: res.url,
            title: file.name || "Video Coverage",
            caption: "Video Report",
          },
        ]);
      } else {
        alert(res.message || "Failed to upload video clip");
      }
    } catch (err) {
      alert(err.message || "Network error uploading video");
    } finally {
      setUploadingVideo(false);
      if (videoFileInputRef.current) videoFileInputRef.current.value = "";
    }
  };

  const handleAddVideoByUrl = (e) => {
    e.preventDefault();
    if (!videoUrlInput.trim()) return;
    onVideosChange([
      ...videos,
      {
        url: videoUrlInput.trim(),
        title: videoTitleInput.trim() || "Video Coverage",
        caption: videoCaptionInput.trim(),
      },
    ]);
    setVideoUrlInput("");
    setVideoTitleInput("");
    setVideoCaptionInput("");
    setShowVideoModal(false);
  };

  const handleUpdateVideo = (index, field, value) => {
    const updated = [...videos];
    updated[index] = { ...updated[index], [field]: value };
    onVideosChange(updated);
  };

  const handleRemoveVideo = (index) => {
    onVideosChange(videos.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      {/* Header with Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <span>अतिरिक्त मीडिया (Multi-Photo & Video Coverage)</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            खबर में कई फोटो और वीडियो जोड़ें (Add photo gallery & video reports)
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("photos")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "photos"
                ? "bg-white dark:bg-slate-900 text-red-600 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Images className="w-3.5 h-3.5" />
            <span>फोटो गैलरी ({images.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("videos")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === "videos"
                ? "bg-white dark:bg-slate-900 text-red-600 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>वीडियो ({videos.length})</span>
          </button>
        </div>
      </div>

      {/* ======================= PHOTOS TAB ======================= */}
      {activeTab === "photos" && (
        <div className="space-y-4">
          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              disabled={uploadingPhotos}
              onClick={() => photoFileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer disabled:opacity-60"
            >
              {uploadingPhotos ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span>+ कई फोटो अपलोड करें (Multiple Photos)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowPhotoMediaModal(true);
                fetchMedia();
              }}
              className="flex items-center gap-1 px-3 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              <FolderArchive className="w-3.5 h-3.5 text-red-600" />
              <span>मीडिया लाइब्रेरी से चुनें</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPhotoUrlModal(!showPhotoUrlModal)}
              className="flex items-center gap-1 px-3 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              <LinkIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>वेब लिंक (URL) से जोड़ें</span>
            </button>

            <input
              type="file"
              ref={photoFileInputRef}
              accept="image/*"
              multiple
              onChange={handleMultiplePhotoUpload}
              className="hidden"
            />
          </div>

          {/* Quick Add by URL Drawer */}
          {showPhotoUrlModal && (
            <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
                फोटो का सीधा वेब लिंक दर्ज करें (Image URL)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="url"
                  value={photoUrlInput}
                  onChange={(e) => setPhotoUrlInput(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="sm:col-span-2 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
                <input
                  type="text"
                  value={photoCaptionInput}
                  onChange={(e) => setPhotoCaptionInput(e.target.value)}
                  placeholder="कैप्शन (Caption / विवरण)..."
                  className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPhotoUrlModal(false)}
                  className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  onClick={handleAddPhotoByUrl}
                  className="px-4 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-xs"
                >
                  जोड़ें (Add Photo)
                </button>
              </div>
            </div>
          )}

          {/* Photos Grid */}
          {images.length === 0 ? (
            <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center text-slate-400 space-y-1">
              <Images className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="text-xs font-semibold">अभी कोई अतिरिक्त फोटो संलग्न नहीं है</p>
              <p className="text-[11px] text-slate-400">
                खबर में 1 से अधिक फोटो दिखाने के लिए ऊपर "कई फोटो अपलोड करें" पर क्लिक करें।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 overflow-hidden shadow-2xs flex flex-col"
                >
                  <div className="relative h-32 w-full bg-black/90 overflow-hidden">
                    <img
                      src={img.url}
                      alt={img.caption || `Gallery ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                    />
                    <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                      #{idx + 1}
                    </span>

                    {/* Order & Remove Controls */}
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMovePhoto(idx, -1)}
                          className="p-1 rounded-md bg-black/60 hover:bg-black text-white text-xs cursor-pointer"
                          title="Move Left/Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                      )}
                      {idx < images.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMovePhoto(idx, 1)}
                          className="p-1 rounded-md bg-black/60 hover:bg-black text-white text-xs cursor-pointer"
                          title="Move Right/Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="p-1 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs cursor-pointer shadow-sm"
                        title="हटाएं (Remove)"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Caption Input */}
                  <div className="p-2 flex-1 flex flex-col justify-between gap-1">
                    <input
                      type="text"
                      value={img.caption || ""}
                      onChange={(e) => handleUpdatePhotoCaption(idx, e.target.value)}
                      placeholder="फोटो विवरण / कैप्शन (Caption)..."
                      className="w-full text-[11px] px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================= VIDEOS TAB ======================= */}
      {activeTab === "videos" && (
        <div className="space-y-4">
          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              disabled={uploadingVideo}
              onClick={() => videoFileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer disabled:opacity-60"
            >
              {uploadingVideo ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <VideoIcon className="w-3.5 h-3.5" />
              )}
              <span>+ वीडियो फाइल अपलोड करें (Upload MP4/WebM)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowVideoModal(!showVideoModal)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              <LinkIcon className="w-3.5 h-3.5 text-red-600" />
              <span>+ YouTube / सोशल वीडियो लिंक जोड़ें</span>
            </button>

            <input
              type="file"
              ref={videoFileInputRef}
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
            />
          </div>

          {/* Quick Add Video by URL Drawer */}
          {showVideoModal && (
            <div className="p-4 bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-red-900 dark:text-red-200 block">
                YouTube, Facebook, Twitter या MP4 वीडियो लिंक
              </span>
              <div className="space-y-2">
                <input
                  type="url"
                  required
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... अथवा https://youtu.be/..."
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={videoTitleInput}
                    onChange={(e) => setVideoTitleInput(e.target.value)}
                    placeholder="वीडियो का शीर्षक (Video Title)..."
                    className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                  <input
                    type="text"
                    value={videoCaptionInput}
                    onChange={(e) => setVideoCaptionInput(e.target.value)}
                    placeholder="विवरण / स्रोत (Description / Credit)..."
                    className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowVideoModal(false)}
                  className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  onClick={handleAddVideoByUrl}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  वीडियो जोड़ें (Attach Video)
                </button>
              </div>
            </div>
          )}

          {/* Videos List */}
          {videos.length === 0 ? (
            <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center text-slate-400 space-y-1">
              <Film className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="text-xs font-semibold">कोई वीडियो संलग्न नहीं है</p>
              <p className="text-[11px] text-slate-400">
                खबर में YouTube वीडियो या वीडियो क्लिप दिखाने के लिए ऊपर से जोड़ें।
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {videos.map((vid, vIdx) => {
                const isYouTube = vid.url.includes("youtube.com") || vid.url.includes("youtu.be");
                return (
                  <div
                    key={vIdx}
                    className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center shrink-0">
                        <Play className="w-5 h-5 fill-red-600" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <input
                          type="text"
                          value={vid.title || ""}
                          onChange={(e) => handleUpdateVideo(vIdx, "title", e.target.value)}
                          placeholder="वीडियो शीर्षक..."
                          className="w-full text-xs font-bold bg-transparent text-slate-900 dark:text-white border-b border-transparent focus:border-red-500 focus:outline-none"
                        />
                        <p className="text-[11px] font-mono text-slate-500 truncate">{vid.url}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleRemoveVideo(vIdx)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
                        title="हटाएं (Remove)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Media Picker Modal for Photos */}
      {showPhotoMediaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderArchive className="w-4 h-4 text-red-600" />
                <span>मीडिया लाइब्रेरी से फोटो चुनें</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowPhotoMediaModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              {loadingMedia ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
                  <span className="text-xs text-slate-400 mt-2">मीडिया लोड हो रहा है...</span>
                </div>
              ) : mediaList.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  लाइब्रेरी में कोई फोटो उपलब्ध नहीं है।
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {mediaList.map((m) => {
                    const isSelected = images.some((img) => img.url === m.url);
                    return (
                      <div
                        key={m._id}
                        onClick={() => {
                          if (!isSelected) handleSelectFromLibrary(m);
                        }}
                        className={`relative group rounded-xl overflow-hidden border-2 cursor-pointer transition-all aspect-video ${
                          isSelected
                            ? "border-amber-500 ring-2 ring-amber-400"
                            : "border-slate-200 dark:border-slate-700 hover:border-amber-400"
                        }`}
                      >
                        <img src={m.url} alt="" className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-amber-500/30 flex items-center justify-center">
                            <Check className="w-6 h-6 text-white bg-amber-600 rounded-full p-1" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPhotoMediaModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                पूर्ण (Done)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper: Client-side file reader fallback
function readFileAsCompressedDataUrl(file) {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/webp", 0.85));
        };
        img.onerror = () => resolve(null);
        img.src = loadEvt.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    } catch (e) {
      resolve(null);
    }
  });
}

