"use client";

import React, { useState, useEffect } from "react";
import { BadgeDollarSign, Plus, Trash2, Edit2, Loader2, Save, Eye, MousePointer } from "lucide-react";
import { apiFetch } from "@/lib/api";
import ImageUploader from "@/components/admin/ImageUploader";
import ConfirmModal from "@/components/admin/ConfirmModal";

export default function AdsPage() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  // Form
  const [name, setName] = useState("");
  const [slot, setSlot] = useState("header");
  const [type, setType] = useState("image");
  const [imageUrl, setImageUrl] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [scriptCode, setScriptCode] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });

  const loadAds = async () => {
    try {
      const res = await apiFetch("/api/ads");
      if (res.success) setAds(res.ads || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAds();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setSlot("header");
    setType("image");
    setImageUrl("");
    setTargetUrl("");
    setScriptCode("");
    setIsActive(true);
    setError("");
  };

  const handleEdit = (ad) => {
    setEditingId(ad._id);
    setName(ad.name);
    setSlot(ad.slot);
    setType(ad.type || "image");
    setImageUrl(ad.imageUrl || "");
    setTargetUrl(ad.targetUrl || "");
    setScriptCode(ad.scriptCode || "");
    setIsActive(ad.isActive !== false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !slot) {
      setError("Campaign name and ad slot are required.");
      return;
    }

    setSaving(true);
    try {
      const payload = { name, slot, type, imageUrl, targetUrl, scriptCode, isActive };
      if (editingId) {
        await apiFetch(`/api/ads/${editingId}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await apiFetch("/api/ads", { method: "POST", body: JSON.stringify(payload) });
      }
      resetForm();
      loadAds();
    } catch (err) {
      setError(err.message || "Failed to save ad");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await apiFetch(`/api/ads/${confirmModal.id}`, { method: "DELETE" });
      setConfirmModal({ isOpen: false, id: null });
      loadAds();
    } catch (e) {
      alert("Error deleting ad");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
          <BadgeDollarSign className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Advertisement & Sponsorships
          </h1>
          <p className="text-xs text-slate-500">
            Control banner placements across Header Leaderboards, Sidebar, and In-article ad slots
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs h-fit space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {editingId ? "Edit Ad Campaign" : "Add New Ad Banner"}
            </h2>
            {editingId && (
              <button onClick={resetForm} className="text-xs text-slate-400 hover:text-slate-600">
                Cancel
              </button>
            )}
          </div>

          {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Campaign / Sponsor Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Summer Auto Sale Leaderboard"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ad Slot Placement
                </label>
                <select
                  value={slot}
                  onChange={(e) => setSlot(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
                >
                  <option value="header">Header Leaderboard (728x90)</option>
                  <option value="sidebar">Sidebar Square (300x250)</option>
                  <option value="in_article">In-Article Content (Fluid)</option>
                  <option value="footer">Footer Banner</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ad Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
                >
                  <option value="image">Graphic Image Banner</option>
                  <option value="script">Custom Script / AdSense</option>
                </select>
              </div>
            </div>

            {type === "image" ? (
              <>
                <ImageUploader value={imageUrl} onChange={setImageUrl} label="Ad Banner Graphic" />
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Destination Click Link
                  </label>
                  <input
                    type="url"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://sponsor-website.com"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Embed HTML / JavaScript Snippet
                </label>
                <textarea
                  rows={4}
                  value={scriptCode}
                  onChange={(e) => setScriptCode(e.target.value)}
                  placeholder="<script async src='...'>...</script>"
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-900 text-emerald-400 rounded-xl focus:outline-none"
                />
              </div>
            )}

            <label className="flex items-center gap-2 pt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Campaign is Active & Serving Impressions
              </span>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{editingId ? "Update Ad" : "Deploy Ad Campaign"}</span>
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Active Ad Slots</h2>
              <span className="text-xs text-slate-400">{ads.length} deployed</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <p className="p-8 text-center text-xs text-slate-400">Loading ads...</p>
              ) : ads.length === 0 ? (
                <p className="p-8 text-center text-xs text-slate-400 italic">No ad campaigns created yet.</p>
              ) : (
                ads.map((ad) => (
                  <div key={ad._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {ad.imageUrl && (
                        <img
                          src={ad.imageUrl}
                          alt=""
                          className="w-16 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                        />
                      )}
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white">{ad.name}</h3>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                          <span className="font-semibold text-emerald-600 uppercase text-[10px] bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                            {ad.slot}
                          </span>
                          <span>•</span>
                          <span>{ad.type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold shrink-0">
                      <div className="flex items-center gap-1 text-slate-500">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{ad.impressions || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500">
                        <MousePointer className="w-3.5 h-3.5" />
                        <span>{ad.clicks || 0}</span>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          ad.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {ad.isActive ? "Active" : "Paused"}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(ad)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmModal({ isOpen: true, id: ad._id })}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Ad Campaign?"
        message="This ad slot will cease rendering on the public site immediately."
        onConfirm={confirmDelete}
        onClose={() => setConfirmModal({ isOpen: false, id: null })}
      />
    </div>
  );
}
