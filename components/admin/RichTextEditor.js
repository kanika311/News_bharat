"use client";

import React, { useState, useRef } from "react";
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
} from "lucide-react";

export default function RichTextEditor({ value, onChange, label = "Story Content" }) {
  const [viewMode, setViewMode] = useState("edit"); // "edit" | "html" | "preview"
  const editorRef = useRef(null);

  // Sync value changes to contentEditable div when editor mounts or changes from external
  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const exec = (command, val = null) => {
    document.execCommand(command, false, val);
    if (editorRef.current) {
      editorRef.current.focus();
      onChange(editorRef.current.innerHTML);
    }
  };

  const addLink = () => {
    const url = prompt("Enter hyperlink URL (e.g. https://...):");
    if (url) {
      exec("createLink", url);
    }
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

      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
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

        {/* Editor Body */}
        {viewMode === "edit" && (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            dangerouslySetInnerHTML={{ __html: value || "" }}
            className="min-h-[300px] p-4 text-slate-800 dark:text-slate-100 focus:outline-none article-prose font-sans leading-relaxed"
          />
        )}

        {viewMode === "html" && (
          <textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full min-h-[300px] p-4 font-mono text-xs bg-slate-900 text-emerald-400 focus:outline-none resize-y"
            placeholder="<p>Enter raw HTML content...</p>"
          />
        )}

        {viewMode === "preview" && (
          <div
            dangerouslySetInnerHTML={{ __html: value || "<p class='text-slate-400 italic'>No content to preview.</p>" }}
            className="min-h-[300px] p-6 bg-white dark:bg-slate-900 article-prose"
          />
        )}
      </div>
    </div>
  );
}
