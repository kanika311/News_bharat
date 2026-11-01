"use client";

import React, { useState } from "react";
import { X, Mail, Lock, User, CheckCircle2, AlertCircle, Sparkles, LogIn, UserPlus } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useLang } from "@/lib/langContext";

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const { lang, t } = useLang();
  const [tab, setTab] = useState("login"); // "login" | "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const endpoint = tab === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload = tab === "login" ? { email, password } : { name, email, password };
      
      const res = await apiFetch(endpoint, {
        method: "POST",
        body: payload,
      });

      if (res.success) {
        setSuccess(tab === "login" ? "Logged in successfully!" : "Account created successfully!");
        if (onAuthSuccess) {
          onAuthSuccess(res.user);
        }
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setError(res.message || "Authentication failed");
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError("");
    setLoading(true);
    try {
      // Login with pre-seeded editor account or demo reader account
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        body: { email: "editor@bharatvarta.in", password: "Password123!" },
      });

      if (res.success) {
        setSuccess("Signed in as Demo Reader / Editor!");
        if (onAuthSuccess) {
          onAuthSuccess(res.user);
        }
        setTimeout(() => {
          onClose();
        }, 700);
      } else {
        setError(res.message || "Demo login failed");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-red-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-xl">
              BV
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">
                {lang === "hi" ? "भारत वार्ता में स्वागत है" : "Welcome to Bharat Varta"}
              </h3>
              <p className="text-xs text-red-100 font-medium">
                {lang === "hi" ? "सत्य, निष्पक्षता और त्वरित समाचार" : "Truth, Courage & Fast News"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
          <button
            onClick={() => {
              setTab("login");
              setError("");
              setSuccess("");
            }}
            className={`flex-1 py-3 flex items-center justify-center gap-2 transition-colors border-b-2 ${
              tab === "login"
                ? "border-red-600 text-red-600 bg-red-50/40 dark:bg-red-950/20"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>{lang === "hi" ? "साइन इन (Sign In)" : "Sign In"}</span>
          </button>
          <button
            onClick={() => {
              setTab("register");
              setError("");
              setSuccess("");
            }}
            className={`flex-1 py-3 flex items-center justify-center gap-2 transition-colors border-b-2 ${
              tab === "register"
                ? "border-red-600 text-red-600 bg-red-50/40 dark:bg-red-950/20"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{lang === "hi" ? "नया खाता बनाएं (Register)" : "Create Account"}</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === "register" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === "hi" ? "पूरा नाम (Full Name)" : "Full Name"}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-red-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === "hi" ? "ईमेल पता (Email Address)" : "Email Address"}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-red-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === "hi" ? "पासवर्ड (Password)" : "Password"}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-red-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-red-600/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>{lang === "hi" ? "प्रतीक्षा करें..." : "Processing..."}</span>
              ) : (
                <span>
                  {tab === "login"
                    ? lang === "hi"
                      ? "साइन इन करें"
                      : "Sign In"
                    : lang === "hi"
                    ? "खाता बनाएं"
                    : "Create Account"}
                </span>
              )}
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[11px] text-slate-500 mb-2">
              {lang === "hi" ? "त्वरित परीक्षण के लिए:" : "For instant evaluation:"}
            </p>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{lang === "hi" ? "⚡ 1-क्लिक डेमो रीडर साइन इन" : "⚡ 1-Click Demo Reader Sign In"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
