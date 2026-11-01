"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      router.push("/admin");
    } catch (err) {
      setError(err.message || "Invalid credentials. Please verify and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = (quickEmail, quickPassword) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
    setSubmitting(true);
    login(quickEmail, quickPassword)
      .then(() => router.push("/admin"))
      .catch((err) => {
        setError(err.message);
        setSubmitting(false);
      });
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-red-950/40">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8">
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <img
            src="/logo.png"
            alt="Swar Media Logo"
            className="h-16 w-auto object-contain drop-shadow-xl mb-3"
          />
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            SWAR<span className="text-red-600">MEDIA</span> CMS
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Editorial Management Portal • सत्य, सुर और सरोकार
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3.5 mb-5 text-xs text-red-700 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bharatvarta.in"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-900 dark:text-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-900 dark:text-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-600/30 transition-all disabled:opacity-70"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign In to Editorial Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Logins */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
            Quick 1-Click Demo Accounts
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("admin@bharatvarta.in", "AdminPassword123!")}
              className="px-2 py-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors text-center"
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("editor@bharatvarta.in", "EditorPassword123!")}
              className="px-2 py-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors text-center"
            >
              Editor
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("reporter@bharatvarta.in", "ReporterPassword123!")}
              className="px-2 py-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors text-center"
            >
              Reporter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
