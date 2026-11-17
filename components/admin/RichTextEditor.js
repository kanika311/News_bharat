"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Link as LinkIcon,
  Code,
  Eye,
  Eraser,
  Image as ImageIcon,
  Upload,
  X,
  Loader2,
  Check,
  AlignLeft,
  AlignCenter,
  AlignRight,
  FolderArchive,
  Sparkles,
  Plus,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function RichTextEditor({ value, onChange, label = "Story Content" }) {
  const [viewMode, setViewMode] = useState("edit"); // "edit" | "html" | "preview"
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);

  // Modal State for Image Insertion
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageTab, setImageTab] = useState("upload"); // "upload" | "media" | "url"
  const [selectedImageUrl, setSelectedImageUrl] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [imageAlignment, setImageAlignment] = useState("center"); // "center" | "left" | "right"
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Media Gallery State
  const [mediaList, setMediaList] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(false);

  // Hidden file inputs
  const modalFileInputRef = useRef(null);
  const quickFileInputRef = useRef(null);

  // Track selection changes inside the editor so we always know where the user's cursor is
  const saveSelection = () => {
    if (typeof window === "undefined") return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
      }
    }
  };

  // Sync value changes to contentEditable div
  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    saveSelection();
  };

  const exec = (command, val = null) => {
    document.execCommand(command, false, val);
    if (editorRef.current) {
      editorRef.current.focus();
      onChange(editorRef.current.innerHTML);
    }
    saveSelection();
  };

  const addLink = () => {
    const url = prompt("Enter hyperlink URL (e.g. https://...):");
    if (url) {
      exec("createLink", url);
    }
  };

  // Fetch CMS media library
  const fetchMediaLibrary = async () => {
    setLoadingMedia(true);
    try {
      const res = await apiFetch("/api/media?type=image");
      if (res.success && Array.isArray(res.media)) {
        setMediaList(res.media);
      }
    } catch (e) {
      console.warn("Could not fetch media library", e);
    } finally {
      setLoadingMedia(false);
    }
  };

  // Upload a file to /api/media/upload with client WebP compression fallback
  const processImageFile = async (file) => {
    if (!file) return null;
    setUploadingImage(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("file", file);

      const res = await apiFetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      if (res.success && res.url) {
        return res.url;
      }
      throw new Error(res.message || "Upload failed");
    } catch (err) {
      // Robust client-side WebP compression fallback
      return new Promise((resolve, reject) => {
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
              const dataUrl = canvas.toDataURL("image/webp", 0.88);
              resolve(dataUrl);
            };
            img.onerror = () => reject(new Error("Failed to load selected photo"));
            img.src = loadEvt.target.result;
          };
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsDataURL(file);
        } catch (fallbackErr) {
          reject(fallbackErr);
        }
      });
    } finally {
      setUploadingImage(false);
    }
  };

  // Insert image element cleanly into the contentEditable editor at cursor position
  const insertImageIntoContent = (url, caption = "", alignment = "center") => {
    if (!url || !editorRef.current) return;

    editorRef.current.focus();
    const sel = window.getSelection();

    // Build the Figure & Image DOM elements
    const figure = document.createElement("figure");
    let alignClasses = "my-5 mx-auto text-center clear-both block";
    if (alignment === "left") {
      alignClasses = "my-3 mr-5 mb-4 float-left max-w-full sm:max-w-[48%] clear-left";
    } else if (alignment === "right") {
      alignClasses = "my-3 ml-5 mb-4 float-right max-w-full sm:max-w-[48%] clear-right";
    }
    figure.className = alignClasses;

    const img = document.createElement("img");
    img.src = url;
    img.alt = caption || "Story image";
    img.className =
      "rounded-2xl max-w-full h-auto mx-auto shadow-md border border-slate-200 dark:border-slate-700 object-cover";
    img.loading = "lazy";
    figure.appendChild(img);

    if (caption && caption.trim()) {
      const figcaption = document.createElement("figcaption");
      figcaption.className =
        "text-xs text-slate-500 dark:text-slate-400 mt-2 italic text-center font-sans";
      figcaption.textContent = caption.trim();
      figure.appendChild(figcaption);
    }

    // Trailing paragraph for easy typing continuation
    const p = document.createElement("p");
    p.innerHTML = "<br>";

    // Insert at saved range or current cursor
    let targetRange = savedRangeRef.current;
    if (
      !targetRange ||
      !editorRef.current.contains(targetRange.commonAncestorContainer)
    ) {
      if (sel && sel.rangeCount > 0 && editorRef.current.contains(sel.getRangeAt(0).commonAncestorContainer)) {
        targetRange = sel.getRangeAt(0);
      }
    }

    if (targetRange) {
      targetRange.deleteContents();
      targetRange.insertNode(p);
      targetRange.insertNode(figure);

      // Position cursor after the inserted paragraph
      const newRange = document.createRange();
      newRange.setStart(p, 0);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
    } else {
      editorRef.current.appendChild(figure);
      editorRef.current.appendChild(p);
    }

    onChange(editorRef.current.innerHTML);
    saveSelection();
  };

  // Quick file upload handler (directly from toolbar file picker)
  const handleQuickFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await processImageFile(file);
      if (url) {
        insertImageIntoContent(url, "", "center");
      }
    } catch (err) {
      alert("फोटो अपलोड नहीं हो सकी: " + err.message);
    } finally {
      if (quickFileInputRef.current) quickFileInputRef.current.value = "";
    }
  };

  // Modal file upload handler
  const handleModalFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await processImageFile(file);
      if (url) {
        setSelectedImageUrl(url);
      }
    } catch (err) {
      setUploadError(err.message || "Upload failed");
    } finally {
      if (modalFileInputRef.current) modalFileInputRef.current.value = "";
    }
  };

  // Confirm image insert from modal
  const handleConfirmInsertFromModal = () => {
    if (!selectedImageUrl) {
      setUploadError("कृपया पहले एक फोटो चुनें या अपलोड करें।");
      return;
    }
    insertImageIntoContent(selectedImageUrl, imageCaption, imageAlignment);
    setShowImageModal(false);
    setSelectedImageUrl("");
    setImageCaption("");
    setImageAlignment("center");
    setUploadError("");
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          {label}
        </label>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setViewMode("edit")}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              viewMode === "edit"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Visual
          </button>
          <button
            type="button"
            onClick={() => setViewMode("html")}
            className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1 ${
              viewMode === "html"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Code className="w-3 h-3" />
            <span>HTML</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("preview")}
            className={`px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1 ${
              viewMode === "preview"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
        {/* Formatting Toolbar */}
        {viewMode === "edit" && (
          <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            <button
              type="button"
              onClick={() => exec("bold")}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => exec("italic")}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => exec("underline")}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
              title="Underline"
            >
              <Underline className="w-4 h-4" />
            </button>

            <span className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1" />

            <button
              type="button"
              onClick={() => exec("formatBlock", "<h2>")}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => exec("formatBlock", "<h3>")}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => exec("formatBlock", "<blockquote>")}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
              title="Blockquote"
            >
              <Quote className="w-4 h-4" />
            </button>

            <span className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1" />

            <button
              type="button"
              onClick={() => exec("insertUnorderedList")}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => exec("insertOrderedList")}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={addLink}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
              title="Add Hyperlink"
            >
              <LinkIcon className="w-4 h-4" />
            </button>

            <span className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1" />

            {/* --- INLINE IMAGE INSERTION BUTTONS --- */}
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
                setShowImageModal(true);
              }}
              className="px-2.5 py-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              title="टेक्स्ट के बीच में फोटो लगाएं (Insert Photo Between Text)"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>फोटो लगाएं (Insert Photo)</span>
            </button>

            {/* Quick Upload from Device */}
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                saveSelection();
                if (quickFileInputRef.current) quickFileInputRef.current.click();
              }}
              disabled={uploadingImage}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded transition-colors cursor-pointer flex items-center gap-1 text-xs"
              title="सीधे डिवाइस से तुरंत फोटो जोड़ें (Quick Upload)"
            >
              {uploadingImage ? (
                <Loader2 className="w-4 h-4 animate-spin text-red-600" />
              ) : (
                <Upload className="w-4 h-4 text-emerald-600" />
              )}
            </button>
            <input
              type="file"
              ref={quickFileInputRef}
              accept="image/*"
              onChange={handleQuickFileUpload}
              className="hidden"
            />

            <span className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1" />

            <button
              type="button"
              onClick={() => exec("removeFormat")}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
              title="Clear Format"
            >
              <Eraser className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Visual ContentEditable Editor */}
        {viewMode === "edit" && (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onKeyUp={saveSelection}
            onMouseUp={saveSelection}
            onTouchEnd={saveSelection}
            dangerouslySetInnerHTML={{ __html: value || "" }}
            className="min-h-[350px] p-4 text-slate-800 dark:text-slate-100 focus:outline-none article-prose font-sans leading-relaxed"
          />
        )}

        {/* HTML Source View */}
        {viewMode === "html" && (
          <textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full min-h-[350px] p-4 font-mono text-xs bg-slate-900 text-emerald-400 focus:outline-none resize-y"
            placeholder="<p>Enter raw HTML content...</p>"
          />
        )}

        {/* Live Preview View */}
        {viewMode === "preview" && (
          <div
            dangerouslySetInnerHTML={{
              __html: value || "<p class='text-slate-400 italic'>No content to preview.</p>",
            }}
            className="min-h-[350px] p-6 bg-white dark:bg-slate-900 article-prose"
          />
        )}
      </div>

      <p className="text-[11px] text-slate-400 flex items-center gap-1">
        <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
        <span>
          सुझाव: जहाँ फोटो लगानी हो वहाँ कर्सर रखें, फिर ऊपर <b>"फोटो लगाएं"</b> दबाकर तस्वीर अपलोड करें।
        </span>
      </p>

      {/* --- INLINE IMAGE INSERTION MODAL --- */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-sm">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    टेक्स्ट के बीच में फोटो लगाएं (Insert Photo Between Text)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    फोटो आपके कर्सर के ठीक बाद पैराग्राफ के बीच में जुड़ेगी
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowImageModal(false);
                  setUploadError("");
                }}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-xs font-bold">
              <button
                type="button"
                onClick={() => setImageTab("upload")}
                className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                  imageTab === "upload"
                    ? "border-red-600 text-red-600 bg-white dark:bg-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>कंप्यूटर से अपलोड</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setImageTab("media");
                  fetchMediaLibrary();
                }}
                className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                  imageTab === "media"
                    ? "border-red-600 text-red-600 bg-white dark:bg-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                }`}
              >
                <FolderArchive className="w-3.5 h-3.5" />
                <span>मीडिया लाइब्रेरी</span>
              </button>
              <button
                type="button"
                onClick={() => setImageTab("url")}
                className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                  imageTab === "url"
                    ? "border-red-600 text-red-600 bg-white dark:bg-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>वेब लिंक / URL</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {uploadError && (
                <div className="p-3 bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-xl text-xs font-semibold">
                  {uploadError}
                </div>
              )}

              {/* TAB 1: UPLOAD */}
              {imageTab === "upload" && (
                <div className="space-y-3">
                  <div
                    onClick={() => modalFileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-red-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50 dark:bg-slate-800/40 hover:bg-red-50/20 transition-all flex flex-col items-center justify-center gap-2 group"
                  >
                    <input
                      type="file"
                      ref={modalFileInputRef}
                      accept="image/*"
                      onChange={handleModalFileUpload}
                      className="hidden"
                    />
                    {uploadingImage ? (
                      <div className="flex flex-col items-center gap-2 py-3">
                        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                          फोटो अपलोड हो रही है...
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Upload className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          फोटो चुनने के लिए यहाँ क्लिक करें
                        </span>
                        <span className="text-[10px] text-slate-400">
                          (JPG, PNG, WEBP समर्थित • ऑटोमैटिक वेब कम्प्रेस)
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: MEDIA LIBRARY */}
              {imageTab === "media" && (
                <div className="space-y-3">
                  {loadingMedia ? (
                    <div className="py-8 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
                      <span className="text-xs text-slate-400">मीडिया लोड हो रहा है...</span>
                    </div>
                  ) : mediaList.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      कोई पूर्व अपलोड की गई फोटो नहीं मिली।
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-1">
                      {mediaList.map((m) => (
                        <div
                          key={m._id}
                          onClick={() => setSelectedImageUrl(m.url)}
                          className={`relative rounded-xl overflow-hidden aspect-square border-2 cursor-pointer transition-all ${
                            selectedImageUrl === m.url
                              ? "border-red-600 ring-2 ring-red-500/30 scale-95"
                              : "border-slate-200 dark:border-slate-700 hover:border-slate-400"
                          }`}
                        >
                          <img src={m.url} alt="" className="w-full h-full object-cover" />
                          {selectedImageUrl === m.url && (
                            <div className="absolute inset-0 bg-red-600/30 flex items-center justify-center">
                              <Check className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: URL */}
              {imageTab === "url" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    इमेज URL (Image Web Link)
                  </label>
                  <input
                    type="url"
                    value={selectedImageUrl}
                    onChange={(e) => setSelectedImageUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              )}

              {/* Selected Photo Preview */}
              {selectedImageUrl && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedImageUrl}
                      alt="Selected preview"
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-300 dark:border-slate-600 bg-black"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> फोटो चयनित है (Selected)
                      </span>
                      <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                        {selectedImageUrl}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedImageUrl("")}
                      className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                      title="हटाएं"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Caption Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      फोटो कैप्शन / विवरण (Caption - Optional)
                    </label>
                    <input
                      type="text"
                      value={imageCaption}
                      onChange={(e) => setImageCaption(e.target.value)}
                      placeholder="उदा. सभा को संबोधित करते हुए अखिलेश यादव (फाइल फोटो)"
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  {/* Alignment Options */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      स्थान / अलाइनमेंट (Alignment)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setImageAlignment("center")}
                        className={`py-1.5 px-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1 transition-all ${
                          imageAlignment === "center"
                            ? "bg-red-600 text-white border-red-600 shadow-xs"
                            : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <AlignCenter className="w-3.5 h-3.5" />
                        <span>बीच में (Center)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageAlignment("left")}
                        className={`py-1.5 px-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1 transition-all ${
                          imageAlignment === "left"
                            ? "bg-red-600 text-white border-red-600 shadow-xs"
                            : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <AlignLeft className="w-3.5 h-3.5" />
                        <span>बाईं ओर (Left)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageAlignment("right")}
                        className={`py-1.5 px-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1 transition-all ${
                          imageAlignment === "right"
                            ? "bg-red-600 text-white border-red-600 shadow-xs"
                            : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <AlignRight className="w-3.5 h-3.5" />
                        <span>दाईं ओर (Right)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowImageModal(false);
                  setUploadError("");
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                रद्द करें (Cancel)
              </button>
              <button
                type="button"
                disabled={!selectedImageUrl || uploadingImage}
                onClick={handleConfirmInsertFromModal}
                className="px-5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>टेक्स्ट के बीच में लगाएं (Insert Photo)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
