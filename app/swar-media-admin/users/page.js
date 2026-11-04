"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Eye,
  Loader2,
  Save,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  X,
  Search,
  Filter,
  Power,
  FileText,
  MessageSquare,
  ThumbsUp,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ExternalLink,
  BadgeCheck,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import ImageUploader from "@/components/admin/ImageUploader";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { CMS_PATH } from "@/lib/cms";

export default function UsersManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const USERS_PER_PAGE = 10;

  // Edit / Create Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("सुल्तानपुर");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("reader");
  const [avatar, setAvatar] = useState("");
  const [bio, setBio] = useState("");
  const [isVerifiedJournalist, setIsVerifiedJournalist] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // View Activity Modal State
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activeUserData, setActiveUserData] = useState(null);
  const [viewTab, setViewTab] = useState("posts"); // 'posts' | 'comments' | 'profile'

  // Confirm Delete Modal State
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, name: "" });

  // Load Users from Backend with enriched posts & comments stats
  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/users");
      if (res.success && Array.isArray(res.users)) {
        setUsers(res.users);
      } else {
        setUsers([]);
      }
    } catch (e) {
      console.error("Failed to load users", e);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role filter (Focus on Users vs Staff)
      if (selectedRole !== "all") {
        if (selectedRole === "readers") {
          if (["superadmin", "editor", "admin"].includes(u.role)) return false;
        } else if (selectedRole === "staff") {
          if (!["superadmin", "editor", "admin"].includes(u.role)) return false;
        } else if (u.role !== selectedRole) {
          return false;
        }
      }

      // Status filter
      if (selectedStatus === "active" && u.isActive === false) return false;
      if (selectedStatus === "deactivated" && u.isActive !== false) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = u.name?.toLowerCase().includes(q);
        const matchEmail = u.email?.toLowerCase().includes(q);
        const matchDistrict = u.district?.toLowerCase().includes(q);
        const matchPhone = u.phone?.toLowerCase().includes(q);
        return matchName || matchEmail || matchDistrict || matchPhone;
      }

      return true;
    });
  }, [users, selectedRole, selectedStatus, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(start, start + USERS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  // Aggregate Stats (Focused on Registered Users)
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.isActive !== false).length;
    const deactivated = total - active;
    const staff = users.filter((u) => ["superadmin", "editor", "admin"].includes(u.role)).length;
    const readers = total - staff;
    const totalPosts = users.reduce((sum, u) => sum + (u.postStats?.total || 0), 0);
    const totalComments = users.reduce((sum, u) => sum + (u.postStats?.comments || 0), 0);

    return { total, active, deactivated, staff, readers, totalPosts, totalComments };
  }, [users]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setPhone("");
    setDistrict("सुल्तानपुर");
    setPassword("");
    setRole("reader");
    setAvatar("");
    setBio("");
    setIsVerifiedJournalist(true);
    setIsActive(true);
    setFormError("");
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (u) => {
    setEditingId(u._id);
    setName(u.name || "");
    setEmail(u.email || "");
    setPhone(u.phone || "");
    setDistrict(u.district || "सुल्तानपुर");
    setPassword("");
    setRole(u.role || "reader");
    setAvatar(u.avatar || "");
    setBio(u.bio || "");
    setIsVerifiedJournalist(u.isVerifiedJournalist !== false);
    setIsActive(u.isActive !== false);
    setFormError("");
    setModalOpen(true);
  };

  // Save (Create or Update) User
  const handleSubmitUser = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setFormError("कृपया नाम और ईमेल अवश्य दर्ज करें।");
      return;
    }
    if (!editingId && !password) {
      setFormError("नए खाते के लिए पासवर्ड अनिवार्य है।");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        district: district.trim(),
        role,
        avatar,
        bio: bio.trim(),
        isVerifiedJournalist,
        isActive,
      };

      if (password) {
        payload.password = password;
      }

      if (editingId) {
        await apiFetch(`/api/users/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/users", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setModalOpen(false);
      loadUsers();
    } catch (err) {
      setFormError(err.message || "यूज़र सहेजने में त्रुटि हुई।");
    } finally {
      setSaving(false);
    }
  };

  // 1-Click Toggle Active / Deactivate
  const handleToggleActive = async (u) => {
    const newStatus = u.isActive === false ? true : false;
    try {
      // Optimistic update
      setUsers((prev) =>
        prev.map((item) => (item._id === u._id ? { ...item, isActive: newStatus } : item))
      );

      await apiFetch(`/api/users/${u._id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: newStatus }),
      });
    } catch (e) {
      alert("स्थिति बदलने में विफल: " + e.message);
      loadUsers();
    }
  };

  // Open View Activity Modal
  const handleViewUser = async (u) => {
    setViewModalOpen(true);
    setActivityLoading(true);
    setViewTab("posts");
    setActiveUserData(null);

    try {
      const aRes = await apiFetch(`/api/articles?author=${u._id}&limit=500`).catch(() => ({ articles: [] }));
      const userArticles = aRes.articles || [];

      const stats = {
        totalPosts: userArticles.length || u.postStats?.total || 0,
        approvedCount: userArticles.filter((a) => a.status === "published").length || u.postStats?.approved || 0,
        pendingCount: userArticles.filter((a) => a.status === "pending").length || u.postStats?.pending || 0,
        draftCount: userArticles.filter((a) => a.status === "draft").length || 0,
        totalViews: userArticles.reduce((sum, a) => sum + (a.viewCount || 0), 0) || u.postStats?.views || 0,
        totalLikes: userArticles.reduce((sum, a) => sum + (a.likesCount || 0), 0) || u.postStats?.likes || 0,
        totalComments: u.postStats?.comments || 0,
      };

      setActiveUserData({
        user: u,
        articles: userArticles,
        comments: [],
        stats,
      });
    } catch (e) {
      console.error("Failed to load user activity", e);
      setActiveUserData({
        user: u,
        articles: [],
        comments: [],
        stats: u.postStats || {},
      });
    } finally {
      setActivityLoading(false);
    }
  };

  // Confirm Delete
  const confirmDelete = async () => {
    try {
      await apiFetch(`/api/users/${confirmModal.id}`, { method: "DELETE" });
      setConfirmModal({ isOpen: false, id: null, name: "" });
      loadUsers();
    } catch (e) {
      alert("खाता हटाने में त्रुटि: " + e.message);
    }
  };

  // Helper for Role Badges
  const getRoleBadge = (r) => {
    switch (r) {
      case "superadmin":
        return {
          label: "सुपर एडमिन (Super Admin)",
          bg: "bg-red-100 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-400 dark:border-red-800",
        };
      case "admin":
        return {
          label: "एडमिन (Admin)",
          bg: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800",
        };
      case "editor":
        return {
          label: "संपादक (Editor)",
          bg: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-400 dark:border-purple-800",
        };
      case "reporter":
        return {
          label: "कंट्रीब्यूटर (Contributor)",
          bg: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800",
        };
      default:
        return {
          label: "आम यूज़र / पाठक (Reader)",
          bg: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner (Users Focused) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-gradient-to-r from-red-600 via-red-700 to-blue-900 rounded-3xl text-white shadow-xl shadow-red-600/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider backdrop-blur-xs">
              <Users className="w-3.5 h-3.5" />
              <span>पंजीकृत उपयोगकर्ता प्रबंधन</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Registered Users Management (पंजीकृत यूज़र्स)
          </h1>
          <p className="text-xs sm:text-sm text-red-100 mt-1 max-w-2xl leading-relaxed">
            साइट पर रजिस्टर हुए सभी यूज़र्स का संपूर्ण प्रबंधन — प्रोफ़ाइल विवरण, गतिविधियां, स्थिति व सक्रियता नियंत्रण।
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold text-white">
            कुल: {stats.total} यूज़र्स
          </span>
        </div>
      </div>

      {/* KPI Stats Cards (Users Focused) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">कुल यूज़र्स</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</p>
          <span className="text-[10px] text-blue-600 font-semibold">सभी पंजीकृत खाते</span>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">सक्रिय (Active)</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats.active}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">लॉगिन व एक्टिव</span>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">निष्क्रिय (Deactivated)</span>
          <p className="text-2xl font-black text-rose-600 mt-1">{stats.deactivated}</p>
          <span className="text-[10px] text-rose-500 font-semibold">लॉगिन प्रतिबंधित</span>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">आम पाठक / यूज़र्स</span>
          <p className="text-2xl font-black text-slate-700 dark:text-slate-200 mt-1">{stats.readers}</p>
          <span className="text-[10px] text-slate-500 font-semibold">वेबसाइट से रजिस्टर</span>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">स्टाफ़ व एडमिन</span>
          <p className="text-2xl font-black text-purple-600 mt-1">{stats.staff}</p>
          <span className="text-[10px] text-purple-500 font-semibold">प्रशासनिक अधिकार</span>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">कुल गतिविधियां</span>
          <p className="text-2xl font-black text-red-600 mt-1">{stats.totalComments + stats.totalPosts}</p>
          <span className="text-[10px] text-slate-500 font-semibold">पोस्ट्स व टिप्पणियां</span>
        </div>
      </div>

      {/* Sticky Search & Action Bar (Always accessible when scrolling) */}
      <div className="sticky top-16 sm:top-[68px] z-20 p-3 sm:p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input with Search Icon */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="यूज़र का नाम, ईमेल, फ़ोन नंबर या शहर खोजें..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
          />
        </div>

        {/* Filter Pills, Status & Add Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setSelectedRole("all");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedRole === "all"
                  ? "bg-white dark:bg-slate-900 text-red-600 shadow-xs font-black"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              सभी ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole("readers");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedRole === "readers"
                  ? "bg-white dark:bg-slate-900 text-red-600 shadow-xs font-black"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              आम पाठक ({stats.readers})
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole("staff");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedRole === "staff"
                  ? "bg-white dark:bg-slate-900 text-red-600 shadow-xs font-black"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              स्टाफ़ / एडमिन ({stats.staff})
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:border-red-500 cursor-pointer"
          >
            <option value="all">सभी स्थितियां</option>
            <option value="active">सक्रिय (Active)</option>
            <option value="deactivated">निष्क्रिय (Deactivated)</option>
          </select>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={loadUsers}
            title="रिफ्रेश करें"
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-red-600" : ""}`} />
          </button>

          {/* Sticky Add User Button */}
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/20 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ नया यूज़र जोड़ें</span>
          </button>
        </div>
      </div>

      {/* Users List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 gap-3">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            <p className="text-xs text-slate-500 font-medium">पंजीकृत यूज़र्स लोड हो रहे हैं...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-2">
            <Users className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">कोई यूज़र नहीं मिला</p>
            <p className="text-xs text-slate-500">कृपया खोज फ़िल्टर बदलकर पुनः प्रयास करें।</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4">यूज़र विवरण (User Profile)</th>
                  <th className="py-3 px-4">भूमिका (Role)</th>
                  <th className="py-3 px-4">ज़िला / फ़ोन (Location)</th>
                  <th className="py-3 px-4">खबरें व गतिविधि (Submissions)</th>
                  <th className="py-3 px-4">स्थिति (Status)</th>
                  <th className="py-3 px-4 text-right">कार्यवाहियां (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {paginatedUsers.map((u) => {
                  const roleBadge = getRoleBadge(u.role);
                  const isUserActive = u.isActive !== false;
                  const postStats = u.postStats || { total: 0, approved: 0, pending: 0, views: 0, comments: 0 };

                  return (
                    <tr
                      key={u._id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                        !isUserActive ? "opacity-75 bg-slate-50/40 dark:bg-slate-900/40" : ""
                      }`}
                    >
                      {/* 1. User Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <img
                              src={
                                u.avatar ||
                                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                              }
                              alt=""
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                            />
                            <span
                              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                                isUserActive ? "bg-emerald-500" : "bg-rose-500"
                              }`}
                              title={isUserActive ? "Active" : "Deactivated"}
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                                {u.name}
                              </h3>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-[220px]">
                              {u.email}
                            </p>
                            <span className="text-[10px] text-slate-400">
                              पंजीकृत: {new Date(u.createdAt || Date.now()).toLocaleDateString("hi-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Role */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${roleBadge.bg}`}
                        >
                          {roleBadge.label}
                        </span>
                      </td>

                      {/* 3. Location & Phone */}
                      <td className="py-3.5 px-4 space-y-1">
                        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span>{u.district || "सुल्तानपुर"}</span>
                        </div>
                        {u.phone ? (
                          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[10px] font-mono">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{u.phone}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">फ़ोन उपलब्ध नहीं</span>
                        )}
                      </td>

                      {/* 4. Submissions & Activity */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold text-[11px] flex items-center gap-1">
                              <FileText className="w-3 h-3 text-blue-600" />
                              <span>{postStats.total} खबरें</span>
                            </span>
                            {postStats.approved > 0 && (
                              <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">
                                {postStats.approved} स्वीकृत
                              </span>
                            )}
                            {postStats.pending > 0 && (
                              <span className="px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-bold text-[10px]">
                                {postStats.pending} समीक्षाधीन
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-slate-500">
                            <span>कुल व्यूज: <strong className="text-slate-700 dark:text-slate-300">{postStats.views || 0}</strong></span>
                            <span>टिप्पणियां: <strong className="text-slate-700 dark:text-slate-300">{postStats.comments || 0}</strong></span>
                          </div>
                        </div>
                      </td>

                      {/* 5. Status Toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(u)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-transform active:scale-95 cursor-pointer ${
                            isUserActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                              : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                          }`}
                          title={isUserActive ? "Click to Deactivate account" : "Click to Activate account"}
                        >
                          {isUserActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>सक्रिय (Active)</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>निष्क्रिय (Inactive)</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* 6. Action Buttons: View, Edit, Activate/Deactivate, Delete */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* VIEW Action */}
                          <button
                            type="button"
                            onClick={() => handleViewUser(u)}
                            className="p-1.5 text-slate-700 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors cursor-pointer"
                            title="यूज़र की सभी खबरें, टिप्पणियां, व गतिविधि देखें (View Activity)"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* EDIT Action */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 text-slate-700 dark:text-slate-300 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg transition-colors cursor-pointer"
                            title="प्रोफाइल संपादित करें (Edit Profile)"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* ACTIVATE / DEACTIVATE Quick Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleActive(u)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isUserActive
                                ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                            }`}
                            title={isUserActive ? "खाता निष्क्रिय करें (Deactivate)" : "खाता सक्रिय करें (Activate)"}
                          >
                            <Power className="w-4 h-4" />
                          </button>

                          {/* DELETE Action */}
                          <button
                            type="button"
                            onClick={() => setConfirmModal({ isOpen: true, id: u._id, name: u.name })}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                            title="खाता हटाएं (Delete User)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom Pagination Controls */}
          {filteredUsers.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/20 text-xs">
              <span className="text-slate-500 font-medium">
                दिखाए जा रहे हैं{" "}
                <strong className="text-slate-900 dark:text-white">
                  {(currentPage - 1) * USERS_PER_PAGE + 1}
                </strong>{" "}
                से{" "}
                <strong className="text-slate-900 dark:text-white">
                  {Math.min(currentPage * USERS_PER_PAGE, filteredUsers.length)}
                </strong>{" "}
                कुल{" "}
                <strong className="text-slate-900 dark:text-white">
                  {filteredUsers.length}
                </strong>{" "}
                यूज़र्स में से
              </span>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    title="पिछला पृष्ठ"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                        currentPage === page
                          ? "bg-red-600 text-white shadow-xs font-black"
                          : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    title="अगला पृष्ठ"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: VIEW USER ACTIVITY & CONTRIBUTIONS              */}
      {/* ======================================================== */}
      {viewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-blue-700 text-white flex items-center justify-center font-black text-base shadow-sm">
                  {activeUserData?.user?.name ? activeUserData.user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-slate-900 dark:text-white">
                      {activeUserData?.user?.name || "यूज़र गतिविधि विवरण"}
                    </h2>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${
                        getRoleBadge(activeUserData?.user?.role).bg
                      }`}
                    >
                      {getRoleBadge(activeUserData?.user?.role).label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">
                    {activeUserData?.user?.email} • {activeUserData?.user?.district || "सुल्तानपुर"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {activityLoading ? (
                <div className="flex flex-col items-center justify-center p-16 gap-3">
                  <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                  <p className="text-xs text-slate-500">यूज़र का संपूर्ण रिकॉर्ड और खबरें लोड हो रही हैं...</p>
                </div>
              ) : (
                <>
                  {/* KPI Summary Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">कुल खबरें</span>
                      <p className="text-xl font-black text-blue-600 mt-0.5">{activeUserData?.stats?.totalPosts || 0}</p>
                    </div>

                    <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase">स्वीकृत (Approved)</span>
                      <p className="text-xl font-black text-emerald-600 mt-0.5">{activeUserData?.stats?.approvedCount || 0}</p>
                    </div>

                    <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800/60">
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase">समीक्षाधीन (Pending)</span>
                      <p className="text-xl font-black text-amber-600 mt-0.5">{activeUserData?.stats?.pendingCount || 0}</p>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">कुल व्यूज</span>
                      <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{activeUserData?.stats?.totalViews || 0}</p>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">कुल लाइक्स</span>
                      <p className="text-xl font-black text-red-600 mt-0.5">{activeUserData?.stats?.totalLikes || 0}</p>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">टिप्पणियां</span>
                      <p className="text-xl font-black text-purple-600 mt-0.5">{activeUserData?.stats?.totalComments || 0}</p>
                    </div>
                  </div>

                  {/* Activity Tabs */}
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                    <button
                      type="button"
                      onClick={() => setViewTab("posts")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        viewTab === "posts"
                          ? "bg-red-600 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>सबमिट की गई खबरें ({activeUserData?.articles?.length || 0})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setViewTab("comments")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        viewTab === "comments"
                          ? "bg-red-600 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>टिप्पणियां ({activeUserData?.comments?.length || 0})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setViewTab("profile")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        viewTab === "profile"
                          ? "bg-red-600 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>संपर्क व प्रोफ़ाइल विवरण</span>
                    </button>
                  </div>

                  {/* TAB 1: SUBMISSIONS / ARTICLES */}
                  {viewTab === "posts" && (
                    <div className="space-y-3">
                      {(!activeUserData?.articles || activeUserData.articles.length === 0) ? (
                        <div className="p-8 text-center text-slate-400">
                          <FileText className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                          <p className="text-xs">इस यूज़र द्वारा अभी तक कोई खबर सबमिट नहीं की गई है।</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                          {activeUserData.articles.map((art) => (
                            <div key={art._id} className="p-3.5 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      art.status === "published"
                                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                        : art.status === "pending"
                                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                    }`}
                                  >
                                    {art.status === "published" ? "✓ स्वीकृत (Live)" : art.status === "pending" ? "⏳ समीक्षाधीन (Pending)" : "ड्राफ्ट (Draft)"}
                                  </span>

                                  {art.category && (
                                    <span className="text-[10px] text-slate-500 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                      {art.category.nameHi || art.category.name}
                                    </span>
                                  )}

                                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-red-500" />
                                    <span>{art.location || "सुल्तानपुर"}</span>
                                  </span>
                                </div>

                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                                  {art.title}
                                </h4>

                                <div className="flex items-center gap-4 text-[10px] text-slate-400">
                                  <span>तारीख: {new Date(art.createdAt).toLocaleDateString("hi-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                                  <span>व्यूज: <strong className="text-slate-700 dark:text-slate-300">{art.viewCount || 0}</strong></span>
                                  <span>लाइक्स: <strong className="text-slate-700 dark:text-slate-300">{art.likesCount || 0}</strong></span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <Link
                                  href={`${CMS_PATH}/articles/edit/${art._id}`}
                                  className="px-3 py-1.5 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 rounded-xl transition-colors"
                                >
                                  संपादित करें / Review
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: COMMENTS */}
                  {viewTab === "comments" && (
                    <div className="space-y-3">
                      {(!activeUserData?.comments || activeUserData.comments.length === 0) ? (
                        <div className="p-8 text-center text-slate-400">
                          <MessageSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                          <p className="text-xs">इस यूज़र ने अभी तक किसी खबर पर टिप्पणी नहीं की है।</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                          {activeUserData.comments.map((c) => (
                            <div key={c._id} className="p-3.5 bg-white dark:bg-slate-900 space-y-1.5">
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="font-bold text-slate-700 dark:text-slate-300">
                                  खबर: {c.article?.title || "संबंधित खबर"}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full font-bold ${
                                    c.status === "approved"
                                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                      : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                  }`}
                                >
                                  {c.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                                "{c.content}"
                              </p>
                              <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1">
                                <span>तारीख: {new Date(c.createdAt).toLocaleDateString("hi-IN")}</span>
                                <span>लाइक्स: {c.likes || 0}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: PROFILE & DETAILS */}
                  {viewTab === "profile" && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <span className="text-slate-400 font-bold block mb-1">पूरा नाम:</span>
                          <p className="text-slate-900 dark:text-white font-bold text-sm">{activeUserData?.user?.name}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block mb-1">ईमेल पता:</span>
                          <p className="text-slate-900 dark:text-white font-mono">{activeUserData?.user?.email}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block mb-1">फ़ोन नंबर:</span>
                          <p className="text-slate-900 dark:text-white font-mono">{activeUserData?.user?.phone || "दर्ज नहीं"}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block mb-1">गृह ज़िला (District):</span>
                          <p className="text-slate-900 dark:text-white">{activeUserData?.user?.district || "सुल्तानपुर"}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block mb-1">खाते की स्थिति:</span>
                          <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            activeUserData?.user?.isActive !== false ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                          }`}>
                            {activeUserData?.user?.isActive !== false ? "सक्रिय (Active)" : "निष्क्रिय (Deactivated)"}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold block mb-1">पंजीकरण की तिथि:</span>
                          <p className="text-slate-700 dark:text-slate-300 font-mono">
                            {new Date(activeUserData?.user?.createdAt || Date.now()).toLocaleString("hi-IN")}
                          </p>
                        </div>
                      </div>

                      {activeUserData?.user?.bio && (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                          <span className="text-slate-400 font-bold block mb-1">परिचय (Bio):</span>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{activeUserData.user.bio}</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50 dark:bg-slate-800/80">
              <button
                type="button"
                onClick={() => setViewModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl"
              >
                बंद करें (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: CREATE / EDIT USER                              */}
      {/* ======================================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-red-600" />
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {editingId ? "यूज़र प्रोफ़ाइल संपादित करें" : "नया यूज़र जोड़ें"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmitUser} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 font-semibold">
                  {formError}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  पूरा नाम (Full Name) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="उदा. राजेश शर्मा / विकास शुक्ला"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 text-slate-900 dark:text-white font-medium"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ईमेल पता (Email Address) <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@swarmedia.in"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 text-slate-900 dark:text-white font-mono"
                />
              </div>

              {/* Phone & District Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    फ़ोन नंबर (Phone)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ज़िला (District)
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="सुल्तानपुर, लखनऊ..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {editingId ? "नया पासवर्ड (बदलना न हो तो खाली छोड़ें)" : "पासवर्ड (Password) *"}
                </label>
                <input
                  type="password"
                  required={!editingId}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 text-slate-900 dark:text-white font-mono"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  सिस्टम भूमिका (Role & Privileges)
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 text-slate-900 dark:text-white"
                >
                  <option value="reader">पाठक (Reader - सामान्य यूज़र)</option>
                  <option value="editor">संपादक (Editor - खबरों की समीक्षा व प्रकाशन)</option>
                  <option value="admin">एडमिन (Admin - प्रबंधन अधिकार)</option>
                  <option value="superadmin">सुपर एडमिन (Super Admin - संपूर्ण सिस्टम अधिकार)</option>
                </select>
              </div>

              {/* Status & Verification Toggles */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">खाता सक्रिय रखें (Account Active)</span>
                    <span className="text-[10px] text-slate-400">निष्क्रिय करने पर यूज़र लॉगिन नहीं कर सकेगा</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">सत्यापित खाता (Verified User)</span>
                    <span className="text-[10px] text-slate-400">नाम के आगे नीला सत्यापन बैज दिखेगा</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isVerifiedJournalist}
                    onChange={(e) => setIsVerifiedJournalist(e.target.checked)}
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Avatar Upload */}
              <ImageUploader value={avatar} onChange={setAvatar} label="प्रोफ़ाइल फ़ोटो (Avatar Photo)" />

              {/* Bio */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  संक्षिप्त परिचय (Bio)
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="यूज़र के बारे में विवरण..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 text-slate-900 dark:text-white resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 font-bold text-white bg-red-600 hover:bg-red-700 active:scale-95 rounded-xl shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{editingId ? "अपडेट करें" : "खाता बनाएं"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: CONFIRM DELETE USER                             */}
      {/* ======================================================== */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="यूज़र खाता हटाएं?"
        message={`क्या आप सुनिश्चित हैं कि आप ${confirmModal.name || "इस यूज़र"} का खाता स्थायी रूप से हटाना चाहते हैं? यह कार्यवाही वापस नहीं ली जा सकती।`}
        onConfirm={confirmDelete}
        onClose={() => setConfirmModal({ isOpen: false, id: null, name: "" })}
      />
    </div>
  );
}
