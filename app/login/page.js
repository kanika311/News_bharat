"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  ShieldCheck,
  Flame,
  ArrowLeft,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import { useLang } from "@/lib/langContext";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";
  const initialMode = searchParams.get("mode") === "register" ? "register" : "login";

  const { refreshUser } = useAuth();
  const { lang } = useLang();

  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (mode === "register") {
      if (!name.trim()) {
        setError(lang === "hi" ? "कृपया अपना नाम दर्ज करें।" : "Please enter your full name.");
        return;
      }
      if (password.length < 6) {
        setError(
          lang === "hi"
            ? "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।"
            : "Password must be at least 6 characters long."
        );
        return;
      }
      if (!confirmPassword) {
        setError(
          lang === "hi"
            ? "कृपया पासवर्ड की दोबारा पुष्टि करें।"
            : "Please confirm your password."
        );
        return;
      }
      if (password !== confirmPassword) {
        setError(
          lang === "hi"
            ? "दोनों पासवर्ड मेल नहीं खाते।"
            : "Passwords do not match."
        );
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        mode === "login"
          ? { email: email.trim(), password }
          : { name: name.trim(), email: email.trim(), password };

      const res = await apiFetch(endpoint, {
        method: "POST",
        body: payload,
      });

      if (res.success) {
        if (res.token && typeof window !== "undefined") {
          try {
            localStorage.setItem("token", res.token);
          } catch (e) {}
        }

        setSuccess(
          mode === "login"
            ? (lang === "hi" ? "सफलतापूर्वक लॉगिन हो गए! रीडायरेक्ट हो रहा है..." : "Logged in successfully! Redirecting...")
            : (lang === "hi" ? "खाता सफलतापूर्वक बन गया! स्वागत है..." : "Account created successfully! Welcome...")
        );

        if (refreshUser) {
          await refreshUser().catch(() => {});
        }

        setTimeout(() => {
          if (typeof window !== "undefined") {
            window.location.href = redirectUrl;
          } else {
            router.push(redirectUrl);
          }
        }, 500);
      } else {
        setError(res.message || (lang === "hi" ? "प्रमाणीकरण विफल रहा।" : "Authentication failed."));
      }
    } catch (err) {
      setError(err.message || (lang === "hi" ? "एक त्रुटि हुई। कृपया पुनः प्रयास करें।" : "An error occurred. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      {/* Top back navigation */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === "hi" ? "मुख्य पृष्ठ पर लौटें" : "Back to Home"}</span>
        </Link>
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Swar Media Portal
        </span>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Brand Banner with Royal Crimson & Gold theme */}
        <div className="bg-gradient-to-r from-[#8B0000] via-[#B30D12] to-[#80070a] p-6 text-white text-center relative overflow-hidden border-b border-amber-500/30">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center">
            <Link href="/" className="inline-block hover:scale-105 transition-transform mb-3">
              <img
                src="/logo.png"
                alt="The Swar Media"
                className="h-16 sm:h-20 w-auto object-contain drop-shadow-xl"
              />
            </Link>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              {mode === "login"
                ? (lang === "hi" ? "द स्वर मीडिया में साइन इन करें" : "Sign In to The Swar Media")
                : (lang === "hi" ? "नया पाठक खाता बनाएं" : "Create Reader Account")}
            </h1>
            <p className="text-xs text-amber-200 font-extrabold mt-1">
              {lang === "hi"
                ? "हर मुद्दे पर, युवा की आवाज • निष्पक्ष पत्रकारिता"
                : "Inform • Inspire • Empower • Leading News Portal"}
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
              setSuccess("");
            }}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mode === "login"
                ? "bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>{lang === "hi" ? "साइन इन (Sign In)" : "Sign In"}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError("");
              setSuccess("");
            }}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mode === "register"
                ? "bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>{lang === "hi" ? "नया खाता बनाएं (Register)" : "Register"}</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 text-xs text-red-700 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2.5 p-3.5 text-xs text-green-700 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/60 rounded-xl">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600 mt-0.5" />
              <span className="font-semibold leading-relaxed">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {lang === "hi" ? "पूरा नाम (Full Name)" : "Full Name"}
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={lang === "hi" ? "उदा. Kanika Aggarwal" : "e.g. Kanika Aggarwal"}
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-900 dark:text-white transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {lang === "hi" ? "ईमेल पता (Email Address)" : "Email Address"}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-900 dark:text-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {lang === "hi" ? "पासवर्ड (Password)" : "Password"}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-900 dark:text-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {mode === "register" && (
                <p className="text-[10px] text-slate-500 mt-1">
                  {lang === "hi" ? "कम से कम 6 अक्षर होने चाहिए।" : "Must be at least 6 characters."}
                </p>
              )}
            </div>

            {mode === "register" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {lang === "hi" ? "पासवर्ड की पुष्टि (Confirm Password)" : "Confirm Password"}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-slate-900 dark:text-white transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-bold rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{lang === "hi" ? "कृपया प्रतीक्षा करें..." : "Processing..."}</span>
                </>
              ) : (
                <>
                  <span>
                    {mode === "login"
                      ? (lang === "hi" ? "साइन इन करें" : "Sign In")
                      : (lang === "hi" ? "खाता बनाएं" : "Create Account")}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Reader Perks */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span>
                {lang === "hi"
                  ? "पसंदीदा खबरें बुकमार्क करें व समाचारों पर टिप्पणी करें"
                  : "Bookmark favorite stories & participate in reader comments"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
              <Flame className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span>
                {lang === "hi"
                  ? "ई-पेपर व ब्रेकिंग न्यूज़ अलर्ट्स प्राप्त करें"
                  : "Get real-time breaking news & e-Paper updates"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
