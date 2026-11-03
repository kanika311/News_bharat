"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Moon,
  Sun,
  X,
  Radio,
  Video,
  Flame,
  Globe,
  TrendingUp,
  Share2,
  Calendar,
  User,
  Newspaper,
  Tv,
  Bell,
  Wind,
  LogOut,
  Bookmark,
  ChevronDown,
  UserPlus,
} from "lucide-react";
import { useLang } from "@/lib/langContext";
import { apiFetch } from "@/lib/api";
import NotificationDrawer from "./NotificationDrawer";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang, t } = useLang();

  const [categories, setCategories] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [liveTimestamp, setLiveTimestamp] = useState("");
  
  // User Auth State
  const [currentUser, setCurrentUser] = useState(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Notification Drawer State
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

  // Live ticking clock in IST
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const datePart = now.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const timePart = now.toLocaleTimeString("en-US", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      setLiveTimestamp(`${datePart} | ${timePart} IST`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [lang]);

  // Load Categories & Current User
  useEffect(() => {
    apiFetch("/api/categories?menuOnly=true")
      .then((res) => {
        if (res.success) setCategories(res.categories || []);
      })
      .catch(() => {});

    // Check if user is logged in
    apiFetch("/api/auth/me")
      .then((res) => {
        if (res.success && res.user) {
          setCurrentUser(res.user);
        }
      })
      .catch(() => {});
  }, []);

  const toggleDark = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
      setUserDropdownOpen(false);
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-md transition-colors">
      {/* 1. Aaj Tak Style Top Utility Header (Single compact row on mobile) */}
      <div className="bg-[#f8f9fa] dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-[10px] sm:text-[11px] py-1 px-3 sm:px-4 border-b border-slate-200 dark:border-slate-800">
        <div className="w-full flex items-center justify-between gap-2">
          {/* Left: Live Timestamp + Desktop Network Links */}
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap flex items-center gap-1 font-mono text-[10px] sm:text-[11px]">
              <Calendar className="w-3 h-3 text-red-600 shrink-0" />
              <span>{liveTimestamp || "IST"}</span>
            </span>

            {/* Quick Network Links visible on md+ */}
            <div className="hidden md:flex items-center gap-2.5 font-medium whitespace-nowrap text-[11px] border-l border-slate-300 dark:border-slate-700 pl-2.5">
              <Link href="/" className="font-bold text-red-600 hover:underline">
                Swar Media
              </Link>
              <Link
                href="/epaper"
                className="flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:text-red-600 transition-colors font-semibold"
              >
                <Newspaper className="w-3 h-3 text-red-600" />
                <span>{lang === "hi" ? "ई-पेपर" : "e-Paper"}</span>
              </Link>
              <Link
                href="/live/live-budget-preparation-economic-council"
                className="hover:text-red-600 transition-colors"
              >
                {lang === "hi" ? "लाइव टीवी" : "Live TV"}
              </Link>
              <Link href="/business" className="hover:text-red-600 transition-colors">
                {lang === "hi" ? "कारोबार" : "Business"}
              </Link>
              <Link href="/tech" className="hover:text-red-600 transition-colors">
                {lang === "hi" ? "टेक" : "Tech"}
              </Link>
              <Link href="/videos" className="hover:text-red-600 transition-colors">
                {lang === "hi" ? "वीडियो" : "Videos"}
              </Link>
            </div>
          </div>

          {/* Right: Language switch + Dark mode + Sign In / Register Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-200 dark:bg-slate-800 rounded-lg p-0.5 text-[9px] sm:text-[10px] font-bold">
              <button
                onClick={() => setLang("hi")}
                className={`px-1.5 sm:px-2 py-0.5 rounded transition-colors ${
                  lang === "hi" ? "bg-red-600 text-white" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => setLang("en")}
                className={`px-1.5 sm:px-2 py-0.5 rounded transition-colors ${
                  lang === "en" ? "bg-red-600 text-white" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                EN
              </button>
            </div>

            {/* Dark mode */}
            <button
              onClick={toggleDark}
              className="p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded"
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" /> : <Moon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
            </button>

            {/* User Sign In / Profile Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-[10px] sm:text-xs font-bold shadow-xs transition-colors"
                >
                  <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="max-w-[70px] sm:max-w-[100px] truncate">{currentUser.name || "Reader"}</span>
                  <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 opacity-80" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 top-8 z-50 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 text-xs"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{currentUser.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-[9px] font-bold uppercase">
                        {currentUser.role}
                      </span>
                    </div>

                    <Link
                      href="/epaper"
                      className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
                    >
                      <Newspaper className="w-3.5 h-3.5 text-red-600" />
                      <span>{lang === "hi" ? "ई-पेपर पढ़ें" : "Read e-Paper"}</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{lang === "hi" ? "साइन आउट" : "Sign Out"}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/login"
                  className="flex items-center gap-1 px-2.5 sm:px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-[10px] sm:text-xs font-bold shadow-xs transition-transform hover:scale-105 active:scale-95"
                >
                  <User className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>{lang === "hi" ? "साइन इन" : "Sign In"}</span>
                </Link>
                <Link
                  href="/register"
                  className="hidden md:flex items-center gap-1 px-2.5 sm:px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md text-[10px] sm:text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <UserPlus className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-600" />
                  <span>{lang === "hi" ? "रजिस्टर" : "Register"}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Branding & Action Bar (Clean white background) */}
      <div className="w-full px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink min-w-0">
          <Link href="/" className="flex items-center group shrink-0" aria-label="Swar Media Home">
            <img
              src="/logo.png"
              alt="Swar Media Logo"
              className="h-11 sm:h-13 md:h-15 w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform shrink-0"
            />
          </Link>
        </div>

        {/* Right: Aaj Tak Style Header Badges */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Edition Pill (Desktop only) */}
          <div className="hidden xl:flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <span>EDITION</span>
            <span className="text-red-600">🇮🇳 IN ▾</span>
          </div>

          {/* E-PAPER Prominent Badge (Visible on sm+) */}
          <Link
            href="/epaper"
            className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 hover:border-red-500 text-red-600 dark:text-red-400 rounded-xl text-[11px] sm:text-xs font-bold transition-all shadow-xs hover:scale-105"
          >
            <Newspaper className="w-3.5 h-3.5 text-red-600" />
            <span className="font-extrabold">{lang === "hi" ? "ई-पेपर" : "E-PAPER"}</span>
          </Link>

          {/* AQI Indicator */}
          <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 rounded-lg text-[11px] font-bold border border-amber-200 dark:border-amber-800" title="Delhi AQI: Moderate">
            <Wind className="w-3.5 h-3.5" />
            <span>AQI: 168</span>
          </div>

          {/* Videos */}
          <Link
            href="/videos"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            title="Swar Media Videos"
          >
            <Video className="w-4 h-4 text-red-600" />
            <span className="text-[11px] font-extrabold uppercase hidden xl:inline">VIDEOS</span>
          </Link>

          {/* Live Blog Badge */}
          <Link
            href="/live-blogs"
            className="hidden lg:flex items-center gap-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded-full text-[11px] font-extrabold border border-amber-200 dark:border-amber-800 transition-all hover:scale-105"
            title="Live Blogs - Real-time Text Updates"
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>{lang === "hi" ? "लाइव ब्लॉग" : "LIVE BLOGS"}</span>
          </Link>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setNotificationDrawerOpen(true)}
              className="p-1.5 sm:p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative"
              title="Notifications Drawer"
              aria-label="Open notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800 dark:text-slate-200" />
              <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-red-600 text-white text-[8px] sm:text-[9px] font-black rounded-full flex items-center justify-center shadow-xs animate-pulse">
                7
              </span>
            </button>
          </div>

          {/* Live News Video Streaming Button */}
          <Link
            href="/live"
            className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-[10px] sm:text-xs font-black shadow-md shadow-red-600/25 transition-transform hover:scale-105"
            title="Live News Video Streaming"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
            <Tv className="w-3.5 h-3.5" />
            <span>LIVE</span>
          </Link>

          {/* Search Trigger */}
          <div className="relative">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1.5 sm:p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
              title="Search News"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {searchOpen && (
              <form
                onSubmit={handleSearchSubmit}
                className="absolute right-0 top-10 sm:top-12 z-50 w-72 sm:w-80 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95"
              >
                <div className="relative">
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("searchPlaceholder")}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 text-slate-900 dark:text-white"
                  />
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* 3. Category Navigation Bar (Smooth touch swipe on mobile) */}
      <nav className="relative bg-red-600 text-white shadow-xs">
        <div className="w-full px-2 sm:px-4 flex items-center justify-between">
          <div
            className="flex items-center overflow-x-auto no-scrollbar scroll-smooth space-x-1 py-1"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <Link
              href="/"
              className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-black tracking-wide whitespace-nowrap transition-colors ${
                pathname === "/" ? "bg-red-800 text-white" : "hover:bg-red-700 text-white/95"
              }`}
            >
              {t("home")}
            </Link>

            {/* Microdrama */}
            <Link
              href="/search?q=microdrama"
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-bold whitespace-nowrap hover:bg-red-700 text-white/95 transition-colors"
            >
              {lang === "hi" ? "माइक्रोड्रामा" : "Microdrama"}
            </Link>

            {/* Direct ePaper tab in navbar */}
            <Link
              href="/epaper"
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-black whitespace-nowrap transition-colors ${
                pathname === "/epaper"
                  ? "bg-red-800 text-white"
                  : "bg-red-700/60 hover:bg-red-800 text-yellow-300 font-bold"
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>{lang === "hi" ? "ई-पेपर" : "e-Paper"}</span>
            </Link>

            {categories.map((cat) => {
              const active = pathname === `/${cat.slug}`;
              const label = lang === "hi" ? cat.nameHi || cat.name : cat.name;
              return (
                <Link
                  key={cat._id}
                  href={`/${cat.slug}`}
                  className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                    active ? "bg-red-800 text-white" : "hover:bg-red-700 text-white/90"
                  }`}
                >
                  {label}
                </Link>
              );
            })}

            {/* Live TV Video Streaming */}
            <Link
              href="/live"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-black whitespace-nowrap transition-colors ${
                pathname === "/live"
                  ? "bg-red-950 text-white shadow-inner"
                  : "bg-red-700/80 hover:bg-red-800 text-white font-extrabold"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
              <Tv className="w-3.5 h-3.5" />
              <span>{lang === "hi" ? "लाइव टीवी" : "Live TV"}</span>
            </Link>

            {/* Live Blog */}
            <Link
              href="/live-blogs"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-black whitespace-nowrap transition-colors ${
                pathname.startsWith("/live-blogs")
                  ? "bg-red-950 text-white shadow-inner"
                  : "hover:bg-red-700 text-amber-200 hover:text-white"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === "hi" ? "लाइव ब्लॉग" : "Live Blog"}</span>
            </Link>

            <Link
              href="/videos"
              className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                pathname === "/videos" ? "bg-red-800 text-white" : "hover:bg-red-700 text-white/90"
              }`}
            >
              {t("videos")}
            </Link>

            <Link
              href="/photos"
              className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                pathname === "/photos" ? "bg-red-800 text-white" : "hover:bg-red-700 text-white/90"
              }`}
            >
              {t("photos")}
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs lg:hidden flex">
          <div className="w-80 max-w-[85%] bg-white dark:bg-slate-900 h-full p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center"
                  aria-label="Swar Media Home"
                >
                  <img
                    src="/logo.png"
                    alt="Swar Media Logo"
                    className="h-10 sm:h-12 w-auto object-contain drop-shadow"
                  />
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Timestamp on mobile drawer */}
              <div className="py-2 text-[11px] text-slate-500 font-mono border-b border-slate-100 dark:border-slate-800">
                {liveTimestamp}
              </div>

              <div className="py-4 space-y-1">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 font-bold text-sm text-slate-900 dark:text-white hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl"
                >
                  {t("home")}
                </Link>

                {/* Mobile Live TV */}
                <Link
                  href="/live"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-red-600 bg-red-50 dark:bg-red-950/40 rounded-xl"
                >
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                  <Tv className="w-4 h-4" />
                  <span>{lang === "hi" ? "🔴 लाइव टीवी (Live TV)" : "🔴 Live TV Stream"}</span>
                </Link>

                {/* Mobile Live Blog */}
                <Link
                  href="/live-blogs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl"
                >
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>{lang === "hi" ? "लाइव ब्लॉग (Live Blogs)" : "Live Blogs"}</span>
                </Link>

                {/* Mobile ePaper */}
                <Link
                  href="/epaper"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl"
                >
                  <Newspaper className="w-4 h-4 text-red-600" />
                  <span>{lang === "hi" ? "ई-पेपर (Digital ePaper)" : "e-Paper Edition"}</span>
                </Link>

                {categories.map((cat) => (
                  <Link
                    key={cat._id}
                    href={`/${cat.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl"
                  >
                    {lang === "hi" ? cat.nameHi : cat.name}
                  </Link>
                ))}

                <Link
                  href="/videos"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-red-50 rounded-xl"
                >
                  {t("videos")}
                </Link>

                <Link
                  href="/photos"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-red-50 rounded-xl"
                >
                  {t("photos")}
                </Link>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              {currentUser ? (
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-red-600" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {currentUser.name}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full py-2 bg-red-600 text-white font-bold text-xs rounded-lg"
                  >
                    {lang === "hi" ? "साइन आउट" : "Sign Out"}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-red-600/30"
                  >
                    <User className="w-4 h-4" />
                    <span>{lang === "hi" ? "साइन इन (Sign In)" : "Sign In"}</span>
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-red-600" />
                    <span>{lang === "hi" ? "नया खाता बनाएं (Register)" : "Register New Account"}</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}


      {/* Right-Side Sliding Notification Drawer */}
      <NotificationDrawer
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
      />
    </header>
  );
}
