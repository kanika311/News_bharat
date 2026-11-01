"use client";

import React, { useState, useEffect } from "react";
import { Layers, ArrowUp, ArrowDown, Plus, Trash2, CheckCircle2, Loader2, Save } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function HomepageManagerPage() {
  const [leadArticles, setLeadArticles] = useState([]);
  const [allArticles, setAllArticles] = useState([]);
  const [selectedArticleId, setSelectedArticleId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    try {
      const [setRes, artRes] = await Promise.all([
        apiFetch("/api/settings"),
        apiFetch("/api/articles?status=published&limit=50"),
      ]);

      const published = artRes.articles || [];
      setAllArticles(published);

      const leadIds = setRes.settings?.leadStoryIds || [];
      if (leadIds.length > 0) {
        // Find matching articles or keep IDs
        const matched = leadIds
          .map((id) => (typeof id === "object" ? id : published.find((a) => a._id === id)))
          .filter(Boolean);
        setLeadArticles(matched);
      } else {
        setLeadArticles(published.slice(0, 5));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const moveUp = (idx) => {
    if (idx === 0) return;
    const copy = [...leadArticles];
    const temp = copy[idx - 1];
    copy[idx - 1] = copy[idx];
    copy[idx] = temp;
    setLeadArticles(copy);
  };

  const moveDown = (idx) => {
    if (idx === leadArticles.length - 1) return;
    const copy = [...leadArticles];
    const temp = copy[idx + 1];
    copy[idx + 1] = copy[idx];
    copy[idx] = temp;
    setLeadArticles(copy);
  };

  const removeLead = (idx) => {
    setLeadArticles(leadArticles.filter((_, i) => i !== idx));
  };

  const addLead = () => {
    if (!selectedArticleId) return;
    const found = allArticles.find((a) => a._id === selectedArticleId);
    if (found && !leadArticles.some((a) => a._id === found._id)) {
      setLeadArticles([...leadArticles, found]);
      setSelectedArticleId("");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess("");
    try {
      const ids = leadArticles.map((a) => a._id);
      await apiFetch("/api/settings/homepage-layout", {
        method: "PUT",
        body: JSON.stringify({ leadStoryIds: ids }),
      });
      setSuccess("Homepage lead layout successfully updated!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      alert("Error saving layout");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Homepage Layout Manager
          </h1>
          <p className="text-xs text-slate-500">
            Select, organize, and re-order hero lead stories and section showcases for the homepage
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/30 transition-all disabled:opacity-70"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Homepage Layout</span>
        </button>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-2xl border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Picker */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs h-fit space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Add Article to Showcase</h2>
          <p className="text-xs text-slate-500">
            Choose from currently published articles to feature on the hero cluster.
          </p>

          <select
            value={selectedArticleId}
            onChange={(e) => setSelectedArticleId(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
          >
            <option value="">-- Choose Story --</option>
            {allArticles.map((art) => (
              <option key={art._id} value={art._id}>
                [{art.category?.name || "News"}] {art.title}
              </option>
            ))}
          </select>

          <button
            onClick={addLead}
            disabled={!selectedArticleId}
            className="w-full py-2.5 px-4 text-xs font-bold text-white bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add to Lead Carousel</span>
          </button>
        </div>

        {/* Right: Ordered Lead Stack */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Hero Section Stories ({leadArticles.length} Selected)
            </h2>
            <span className="text-xs text-slate-400">Position #1 is Main Featured Lead</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 p-2">
            {leadArticles.map((art, idx) => (
              <div
                key={art._id || idx}
                className="p-3.5 flex items-center justify-between gap-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-2xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                      idx === 0
                        ? "bg-red-600 text-white shadow-sm shadow-red-600/30"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  {art.featuredImage?.url && (
                    <img
                      src={art.featuredImage.url}
                      alt=""
                      className="w-12 h-12 object-cover rounded-xl shrink-0 border border-slate-200"
                    />
                  )}
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                      {art.title}
                    </h3>
                    <span className="text-[10px] text-red-600 font-bold uppercase mt-0.5 inline-block">
                      {idx === 0 ? "★ BIG LEAD STORY (1X)" : `SIDE STORY (#${idx + 1})`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveDown(idx)}
                    disabled={idx === leadArticles.length - 1}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removeLead(idx)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Remove from lead"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
