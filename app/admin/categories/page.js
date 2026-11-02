"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  FolderTree,
  Tags,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Save,
  X,
  Check,
  Search,
  Hash,
  Palette,
  Eye,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import ConfirmModal from "@/components/admin/ConfirmModal";

export default function UnifiedCategoriesAndTagsPage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "tags" ? "tags" : "categories";

  // Active view tab: 'categories' | 'tags'
  const [activeTab, setActiveTab] = useState(initialTab);

  // Form mode: 'category' | 'tag'
  const [formType, setFormType] = useState(initialTab === "tags" ? "tag" : "category");

  // Data states
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Edit states
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingTagId, setEditingTagId] = useState(null);

  // Category Fields
  const [catName, setCatName] = useState("");
  const [catNameHi, setCatNameHi] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catOrder, setCatOrder] = useState(0);
  const [catColor, setCatColor] = useState("#dc2626");
  const [catShowInMenu, setCatShowInMenu] = useState(true);

  // Tag Fields
  const [tagName, setTagName] = useState("");
  const [tagNameHi, setTagNameHi] = useState("");
  const [tagSlug, setTagSlug] = useState("");

  // Confirm Modal
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    id: null,
    type: "category", // 'category' | 'tag'
    title: "",
  });

  // Load both categories & tags
  const loadData = async () => {
    try {
      const [cRes, tRes] = await Promise.all([
        apiFetch("/api/categories"),
        apiFetch("/api/tags"),
      ]);
      if (cRes.success) setCategories(cRes.categories || []);
      if (tRes.success) setTags(tRes.tags || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetCategoryForm = () => {
    setEditingCatId(null);
    setCatName("");
    setCatNameHi("");
    setCatSlug("");
    setCatOrder(0);
    setCatColor("#dc2626");
    setCatShowInMenu(true);
    setError("");
  };

  const resetTagForm = () => {
    setEditingTagId(null);
    setTagName("");
    setTagNameHi("");
    setTagSlug("");
    setError("");
  };

  const handleEditCategory = (cat) => {
    setFormType("category");
    setActiveTab("categories");
    setEditingCatId(cat._id);
    setCatName(cat.name);
    setCatNameHi(cat.nameHi || "");
    setCatSlug(cat.slug);
    setCatOrder(cat.order || 0);
    setCatColor(cat.color || "#dc2626");
    setCatShowInMenu(cat.showInMenu !== false);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditTag = (t) => {
    setFormType("tag");
    setActiveTab("tags");
    setEditingTagId(t._id);
    setTagName(t.name);
    setTagNameHi(t.nameHi || "");
    setTagSlug(t.slug);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Submit Category
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!catName || !catNameHi) {
      setError("English and Hindi names are required for categories.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        name: catName,
        nameHi: catNameHi,
        slug: catSlug || undefined,
        order: Number(catOrder),
        color: catColor,
        showInMenu: catShowInMenu,
      };

      if (editingCatId) {
        await apiFetch(`/api/categories/${editingCatId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setSuccessMsg("Category updated successfully!");
      } else {
        await apiFetch("/api/categories", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setSuccessMsg("New category created successfully!");
      }

      resetCategoryForm();
      loadData();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  // Submit Tag
  const handleTagSubmit = async (e) => {
    e.preventDefault();
    if (!tagName) {
      setError("Tag name is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        name: tagName,
        nameHi: tagNameHi || undefined,
        slug: tagSlug || undefined,
      };

      if (editingTagId) {
        await apiFetch(`/api/tags/${editingTagId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setSuccessMsg("Tag updated successfully!");
      } else {
        await apiFetch("/api/tags", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setSuccessMsg("New tag created successfully!");
      }

      resetTagForm();
      loadData();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save tag");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      if (confirmModal.type === "category") {
        await apiFetch(`/api/categories/${confirmModal.id}`, { method: "DELETE" });
      } else {
        await apiFetch(`/api/tags/${confirmModal.id}`, { method: "DELETE" });
      }
      setConfirmModal({ isOpen: false, id: null, type: "category", title: "" });
      loadData();
    } catch (e) {
      alert("Error deleting item: " + e.message);
    }
  };

  const filteredCategories = categories.filter((c) =>
    (c.name + " " + (c.nameHi || "") + " " + c.slug)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const filteredTags = tags.filter((t) =>
    (t.name + " " + (t.nameHi || "") + " " + t.slug)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Title & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Categories & Tags (कैटेगरी और टैग्स)
          </h1>
          <p className="text-xs text-slate-500">
            Unified taxonomy management: Create editorial sections, topics, and SEO keyword tags in one place
          </p>
        </div>

        {/* Unified Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
          <button
            onClick={() => {
              setActiveTab("categories");
              setFormType("category");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "categories"
                ? "bg-white dark:bg-slate-900 text-red-600 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("tags");
              setFormType("tag");
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "tags"
                ? "bg-white dark:bg-slate-900 text-red-600 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Tags className="w-4 h-4" />
            <span>Tags & Topics ({tags.length})</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 cols): Unified Creator & Editor Form */}
        <div className="lg:col-span-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs h-fit space-y-4">
          {/* Form Type Switcher */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-black text-slate-900 dark:text-white">
              {formType === "category"
                ? editingCatId
                  ? "Edit Category"
                  : "Create Category (कैटेगरी बनाएं)"
                : editingTagId
                ? "Edit Tag"
                : "Create Tag (टैग बनाएं)"}
            </h2>

            {/* Quick-Toggle Form Type */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setFormType("category")}
                className={`px-2 py-1 rounded-md transition-colors ${
                  formType === "category" ? "bg-red-600 text-white" : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Category
              </button>
              <button
                type="button"
                onClick={() => setFormType("tag")}
                className={`px-2 py-1 rounded-md transition-colors ${
                  formType === "tag" ? "bg-red-600 text-white" : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Tag
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}

          {/* 1. Category Form */}
          {formType === "category" && (
            <form onSubmit={handleCategorySubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category Name (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Politics, Tech, Sports..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category Name (Hindi) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={catNameHi}
                  onChange={(e) => setCatNameHi(e.target.value)}
                  placeholder="उदा. राजनीति, तकनीक, खेल..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 font-hindi"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  URL Slug (Optional)
                </label>
                <input
                  type="text"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  placeholder="auto-generated-if-empty"
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Theme Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={catColor}
                      onChange={(e) => setCatColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0"
                    />
                    <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                      {catColor}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={catOrder}
                    onChange={(e) => setCatOrder(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={catShowInMenu}
                  onChange={(e) => setCatShowInMenu(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded"
                />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Show in Public Header Navigation
                </span>
              </label>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{editingCatId ? "Update Category" : "Save Category"}</span>
                </button>
                {editingCatId && (
                  <button
                    type="button"
                    onClick={resetCategoryForm}
                    className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500"
                    title="Cancel edit"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          )}

          {/* 2. Tag Form */}
          {formType === "tag" && (
            <form onSubmit={handleTagSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tag / Topic Name (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  placeholder="e.g. Budget 2026, AI Tech, Elections..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tag Name (Hindi)
                </label>
                <input
                  type="text"
                  value={tagNameHi}
                  onChange={(e) => setTagNameHi(e.target.value)}
                  placeholder="उदा. बजट 2026, चुनावी माहौल..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 font-hindi"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tag URL Slug (Optional)
                </label>
                <input
                  type="text"
                  value={tagSlug}
                  onChange={(e) => setTagSlug(e.target.value)}
                  placeholder="auto-generated-if-empty"
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{editingTagId ? "Update Tag" : "Save Tag"}</span>
                </button>
                {editingTagId && (
                  <button
                    type="button"
                    onClick={resetTagForm}
                    className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500"
                    title="Cancel edit"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Right Column (8 cols): Interactive Lists with Search Filter */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              {activeTab === "categories" ? (
                <FolderTree className="w-5 h-5 text-red-600" />
              ) : (
                <Tags className="w-5 h-5 text-red-600" />
              )}
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                {activeTab === "categories"
                  ? `Category Desks (${filteredCategories.length})`
                  : `News Tags & Trending Topics (${filteredTags.length})`}
              </h2>
            </div>

            {/* Quick Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${activeTab}...`}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 w-48 sm:w-60"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-red-600" />
              Loading items...
            </div>
          ) : activeTab === "categories" ? (
            /* Categories List */
            filteredCategories.length === 0 ? (
              <p className="text-xs text-slate-400 p-4 italic">No categories found matching your search.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCategories.map((c) => (
                  <div
                    key={c._id}
                    className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 px-3 rounded-2xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: c.color || "#dc2626" }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {c.name}
                          </span>
                          <span className="text-xs font-semibold text-red-600 font-hindi">
                            {c.nameHi}
                          </span>
                          {c.showInMenu && (
                            <span className="text-[9px] bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 px-1.5 py-0.2 rounded font-bold uppercase">
                              In Menu
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                          /{c.slug} • Order: {c.order || 0}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEditCategory(c)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                        title="Edit Category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setConfirmModal({
                            isOpen: true,
                            id: c._id,
                            type: "category",
                            title: `Delete Category "${c.name}"`,
                          })
                        }
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Tags Cloud & Grid */
            filteredTags.length === 0 ? (
              <p className="text-xs text-slate-400 p-4 italic">No tags found matching your search.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {filteredTags.map((t) => (
                  <div
                    key={t._id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-2 group hover:border-red-500 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Hash className="w-3 h-3 text-red-600 shrink-0" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {t.name}
                        </span>
                      </div>
                      {t.nameHi && (
                        <p className="text-[10px] text-red-600 font-hindi truncate mt-0.5 pl-4">
                          {t.nameHi}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={() => handleEditTag(t)}
                        className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        title="Edit Tag"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() =>
                          setConfirmModal({
                            isOpen: true,
                            id: t._id,
                            type: "tag",
                            title: `Delete Tag "${t.name}"`,
                          })
                        }
                        className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title="Delete Tag"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title || "Confirm Delete"}
        message="Are you sure you want to delete this taxonomy item? This might affect articles linked to it."
        confirmText="Delete Item"
        onConfirm={confirmDelete}
        onCancel={() =>
          setConfirmModal({ isOpen: false, id: null, type: "category", title: "" })
        }
      />
    </div>
  );
}
