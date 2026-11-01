"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, FolderTree, Loader2, Save, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import ConfirmModal from "@/components/admin/ConfirmModal";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [name, setName] = useState("");
  const [nameHi, setNameHi] = useState("");
  const [slug, setSlug] = useState("");
  const [order, setOrder] = useState(0);
  const [color, setColor] = useState("#dc2626");
  const [showInMenu, setShowInMenu] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    id: null,
    title: "",
  });

  const loadCategories = async () => {
    try {
      const res = await apiFetch("/api/categories");
      if (res.success) setCategories(res.categories || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setNameHi("");
    setSlug("");
    setOrder(0);
    setColor("#dc2626");
    setShowInMenu(true);
    setError("");
  };

  const handleEdit = (cat) => {
    setEditingId(cat._id);
    setName(cat.name);
    setNameHi(cat.nameHi);
    setSlug(cat.slug);
    setOrder(cat.order || 0);
    setColor(cat.color || "#dc2626");
    setShowInMenu(cat.showInMenu !== false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !nameHi) {
      setError("English and Hindi names are required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        name,
        nameHi,
        slug: slug || undefined,
        order: Number(order),
        color,
        showInMenu,
      };

      if (editingId) {
        await apiFetch(`/api/categories/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/categories", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      resetForm();
      loadCategories();
    } catch (err) {
      setError(err.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id, catName) => {
    setConfirmModal({
      isOpen: true,
      id,
      title: `Delete category "${catName}"?`,
    });
  };

  const confirmDelete = async () => {
    try {
      await apiFetch(`/api/categories/${confirmModal.id}`, { method: "DELETE" });
      setConfirmModal({ isOpen: false, id: null, title: "" });
      loadCategories();
    } catch (e) {
      alert("Error deleting category");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Categories & Taxonomy
        </h1>
        <p className="text-xs text-slate-500">
          Manage header navigation categories, colors, ordering, and subcategories
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Box (1 col) */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs h-fit space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {editingId ? "Edit Category" : "Add New Category"}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
            )}
          </div>

          {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Name (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Politics"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Name (Hindi) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nameHi}
                onChange={(e) => setNameHi(e.target.value)}
                placeholder="e.g. राजनीति"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Slug (Optional)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="politics"
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Theme Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200"
                  />
                  <span className="text-xs font-mono">{color}</span>
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 pt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showInMenu}
                onChange={(e) => setShowInMenu(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Show in Top Navigation Menu
              </span>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-600/30 flex items-center justify-center gap-2 transition-all"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{editingId ? "Update Category" : "Save Category"}</span>
            </button>
          </form>
        </div>

        {/* Categories Table (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Active Categories</h2>
            <span className="text-xs text-slate-400">{categories.length} total</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="p-3">Order</th>
                  <th className="p-3">English Name</th>
                  <th className="p-3">Hindi Name</th>
                  <th className="p-3">Slug</th>
                  <th className="p-3">Menu</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-red-600" />
                      Loading...
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-slate-400">{cat.order}</td>
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                          style={{ backgroundColor: cat.color || "#dc2626" }}
                        />
                        {cat.name}
                      </td>
                      <td className="p-3 font-semibold text-slate-700 dark:text-slate-300 font-hindi">
                        {cat.nameHi}
                      </td>
                      <td className="p-3 font-mono text-slate-500">{cat.slug}</td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            cat.showInMenu !== false
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {cat.showInMenu !== false ? "Visible" : "Hidden"}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleEdit(cat)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(cat._id, cat.name)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message="Deleting this category may affect articles categorized under it."
        onConfirm={confirmDelete}
        onClose={() => setConfirmModal({ isOpen: false, id: null, title: "" })}
      />
    </div>
  );
}
