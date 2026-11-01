"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Eye,
  Calendar,
  Clock,
  MessageSquare,
  Users,
  TrendingUp,
  ArrowUpRight,
  PlusCircle,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { apiFetch } from "@/lib/api";

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await apiFetch("/api/dashboard/stats");
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error("Failed to load dashboard stats", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleModerateComment = async (commentId, status) => {
    try {
      await apiFetch(`/api/comments/${commentId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      fetchStats();
    } catch (e) {
      alert("Error updating comment");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Gathering newsroom metrics...</p>
      </div>
    );
  }

  const stats = data?.stats || {};
  const chartData = data?.chartData || [];
  const topArticles = data?.topArticles || [];
  const recentComments = data?.recentComments || [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-red-600 to-red-700 rounded-3xl text-white shadow-xl shadow-red-600/20">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider mb-2">
            Newsroom Desk
          </span>
          <h1 className="text-2xl font-black tracking-tight">Bharat Varta Editorial Command</h1>
          <p className="text-sm text-red-100 mt-1 max-w-xl">
            Real-time multi-channel overview across national, state, and digital publication feeds.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/articles/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-red-600 font-bold text-xs rounded-xl hover:bg-red-50 transition-colors shadow-md shadow-black/10"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Article</span>
          </Link>
          <Link
            href="/admin/live-blogs"
            className="flex items-center gap-2 px-4 py-2.5 bg-red-800 text-white font-bold text-xs rounded-xl hover:bg-red-900 transition-colors"
          >
            <span>Live Coverage</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Stories</span>
            <FileText className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalArticles || 0}</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Live in archive</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Views</span>
            <Eye className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {(stats.totalViews || 0).toLocaleString()}
          </p>
          <p className="text-[11px] text-blue-600 font-medium mt-1">Readership impressions</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Posts</span>
            <Calendar className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.todayArticles || 0}</p>
          <p className="text-[11px] text-slate-500 mt-1">Published today</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Drafts</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.draftArticles || 0}</p>
          <p className="text-[11px] text-amber-600 font-medium mt-1">Pending review</p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Comments</span>
            <MessageSquare className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalComments || 0}</p>
          <p className="text-[11px] text-purple-600 font-medium mt-1">
            {stats.pendingComments || 0} awaiting review
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Subscribers</span>
            <Users className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalSubscribers || 0}</p>
          <p className="text-[11px] text-cyan-600 font-medium mt-1">Email bulletin list</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Publication & View Velocity</h2>
            <p className="text-xs text-slate-500">Weekly traffic and story velocity trends</p>
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <TrendingUp className="w-4 h-4" />
            <span>Active growth</span>
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="views" stroke="#dc2626" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Grid: Top Stories & Recent Comments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Read Stories */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Top Read Articles</h2>
            <Link href="/admin/articles" className="text-xs font-semibold text-red-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {topArticles.map((art, idx) => (
              <div key={art._id} className="py-3 flex items-start justify-between gap-3 group">
                <div className="flex items-start gap-3">
                  <span className="text-sm font-black text-slate-300 w-5">{idx + 1}</span>
                  <div>
                    <Link
                      href={`/admin/articles/edit/${art._id}`}
                      className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-red-600 line-clamp-1 transition-colors"
                    >
                      {art.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/40 px-1.5 py-0.5 rounded">
                        {art.category?.name || "General"}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {art.language}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {art.viewCount.toLocaleString()}
                  </span>
                  <span className="block text-[10px] text-slate-400">views</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Comments */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Reader Comments</h2>
            <Link href="/admin/comments" className="text-xs font-semibold text-red-600 hover:underline">
              Manage
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentComments.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400 italic">No comments yet.</p>
            ) : (
              recentComments.map((com) => (
                <div key={com._id} className="py-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{com.name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold capitalize ${
                        com.status === "approved"
                          ? "bg-emerald-100 text-emerald-700"
                          : com.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {com.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 italic">
                    "{com.content}"
                  </p>
                  {com.status === "pending" && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleModerateComment(com._id, "approved")}
                        className="text-[11px] text-emerald-600 hover:underline font-semibold flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" /> Approve
                      </button>
                      <button
                        onClick={() => handleModerateComment(com._id, "rejected")}
                        className="text-[11px] text-red-600 hover:underline font-semibold flex items-center gap-1"
                      >
                        <XCircle className="w-3 h-3" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
