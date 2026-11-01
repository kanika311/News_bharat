"use client";

import React, { useState, useEffect } from "react";
import { Users, Plus, Trash2, Edit2, Loader2, Save, ShieldCheck, UserCheck, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import ImageUploader from "@/components/admin/ImageUploader";
import ConfirmModal from "@/components/admin/ConfirmModal";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("reporter");
  const [avatar, setAvatar] = useState("");
  const [bio, setBio] = useState("");
  const [bioHi, setBioHi] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });

  const loadUsers = async () => {
    try {
      const res = await apiFetch("/api/users");
      if (res.success) setUsers(res.users || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("reporter");
    setAvatar("");
    setBio("");
    setBioHi("");
    setIsActive(true);
    setError("");
  };

  const handleEdit = (u) => {
    setEditingId(u._id);
    setName(u.name);
    setEmail(u.email);
    setPassword("");
    setRole(u.role);
    setAvatar(u.avatar || "");
    setBio(u.bio || "");
    setBioHi(u.bioHi || "");
    setIsActive(u.isActive !== false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      setError("Name and email are required.");
      return;
    }
    if (!editingId && !password) {
      setError("Password is required for new accounts.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name,
        email,
        role,
        avatar,
        bio,
        bioHi,
        isActive,
      };
      if (password) payload.password = password;

      if (editingId) {
        await apiFetch(`/api/users/${editingId}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await apiFetch("/api/users", { method: "POST", body: JSON.stringify(payload) });
      }
      resetForm();
      loadUsers();
    } catch (err) {
      setError(err.message || "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await apiFetch(`/api/users/${confirmModal.id}`, { method: "DELETE" });
      setConfirmModal({ isOpen: false, id: null });
      loadUsers();
    } catch (e) {
      alert("Error deleting user");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-slate-900 text-white">
          <ShieldCheck className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Newsroom Staff & Role Permissions
          </h1>
          <p className="text-xs text-slate-500">
            Control editorial access across Super Admin, Editor, and Field Reporter accounts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs h-fit space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {editingId ? "Edit Staff Profile" : "Enroll Newsroom Staff"}
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
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rajesh Sharma (संपादक)"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="reporter@swarmedia.in"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {editingId ? "New Password (Leave blank to keep existing)" : "Password *"}
              </label>
              <input
                type="password"
                required={!editingId}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                System Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
              >
                <option value="superadmin">Super Admin (Full Access)</option>
                <option value="editor">Editor (Publish, Moderate & Review)</option>
                <option value="reporter">Reporter (Write & Submit Drafts)</option>
              </select>
            </div>

            <ImageUploader value={avatar} onChange={setAvatar} label="Profile Photograph" />

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-600/30 flex items-center justify-center gap-2 transition-all"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{editingId ? "Update Staff Profile" : "Create Account"}</span>
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Editorial Team ({users.length})</h2>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.map((u) => (
              <div key={u._id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={u.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">{u.name}</h3>
                    <p className="text-[11px] text-slate-400">{u.email}</p>
                    <span className="inline-block text-[10px] uppercase font-bold text-red-600 bg-red-50 dark:bg-red-950/40 px-2 py-0.2 rounded mt-1">
                      {u.role}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(u)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setConfirmModal({ isOpen: true, id: u._id })}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete User Account?"
        message="This user will lose access to the CMS immediately."
        onConfirm={confirmDelete}
        onClose={() => setConfirmModal({ isOpen: false, id: null })}
      />
    </div>
  );
}
