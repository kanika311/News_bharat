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
  Calendar,
  User,
  Newspaper,
  Tv,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  SlidersHorizontal,
  Menu,
} from "lucide-react";
import { useLang } from "@/lib/langContext";
import { useAuth } from "@/lib/authContext";
import { apiFetch } from "@/lib/api";
import NotificationDrawer from "./NotificationDrawer";
import FilterDrawer from "./FilterDrawer";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang, t } = useLang();
  const { user: authUser, logout } = useAuth();

  const [categories, setCategories] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [liveTimestamp, setLiveTimestamp] = useState("");

  // User Auth State
  const [currentUser, setCurrentUser] = useState(null);
  const [siteSettings, setSiteSettings] = useState(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Live ticking clock in IST
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const datePart = now.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const timePart = now.toLocaleTimeString("en-US", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      setLiveTimestamp(`${datePart} | ${timePart}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [lang]);

  // Load Categories & Current User (Public website only displays reader accounts, not superadmin!)
  useEffect(() => {
    apiFetch("/api/settings")
      .then((res) => {
        if (res.success && res.settings) setSiteSettings(res.settings);
      })
      .catch(() => {});

    apiFetch("/api/categories?menuOnly=true")
      .then((res) => {
        if (res.success) setCategories(res.categories || []);
      })
      .catch(() => {});

    // Check if user is logged in (from auth context or backend)
    if (authUser) {
      setCurrentUser(authUser);
    } else {
      apiFetch("/api/auth/me")
        .then((res) => {
          if (res.success && res.user) {
            setCurrentUser(res.user);
          } else {
            setCurrentUser(null);
          }
        })
        .catch(() => setCurrentUser(null));
    }
  }, [pathname, authUser]);

  const activeUser = currentUser || authUser;

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
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("token");
        } catch (e) {}
      }
      setCurrentUser(null);
      setUserDropdownOpen(false);
      router.refresh();
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  return (
    <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Clean Single-Row Modern Header (Exact Swarnim Dastavej Layout) */}
      <div className="w-full px-2.5 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Left: Brand Logo & Dynamic Site Name with Timestamp (Exact Swarnim Dastavej Layout) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link href="/" className="flex items-center gap-2 group shrink-0" aria-label="Swar Media Home">
            <img
              src={siteSettings?.logo || "/logo.png"}
              alt={siteSettings?.siteName || "Swar Media Logo"}
              className="h-8 sm:h-11 w-auto object-contain drop-shadow-sm group-hover:scale-105 transition-transform shrink-0"
            />
            <div className="flex flex-col">
              <span className="text-xs sm:text-base font-black text-slate-900 dark:text-white leading-tight font-hindi">
                {lang === "hi" ? (siteSettings?.siteNameHi || "स्वर मीडिया") : (siteSettings?.siteName || "Swar Media")}
              </span>
              <span className="hidden sm:inline text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[150px] sm:max-w-none">
                {liveTimestamp || "IST"}
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Simplified Main Navigation Pills */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2.5">
          {/* 1. Live News Button (with pulsing red beacon) */}
          <Link
            href="/live"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              pathname === "/live"
                ? "bg-red-600 text-white shadow-xs"
                : "text-red-600 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/40"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping shrink-0" />
            <Tv className="w-3.5 h-3.5" />
            <span>{lang === "hi" ? "लाइव न्यूज़" : "Live News"}</span>
          </Link>

          {/* 2. Today's e-Paper (Prominent Red Pill) */}
          <Link
            href="/epaper"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all shadow-xs ${
              pathname === "/epaper"
                ? "bg-red-700 text-white ring-2 ring-red-400"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>{lang === "hi" ? "आज का अखबार ई-पेपर" : "Today's e-Paper"}</span>
          </Link>

          {/* 3. Videos */}
          <Link
            href="/videos"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
              pathname === "/videos"
                ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white"
                : "text-slate-700 dark:text-slate-300 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Video className="w-3.5 h-3.5 text-red-600" />
            <span>{lang === "hi" ? "वीडियो" : "Videos"}</span>
          </Link>

          {/* 4. Blogs */}
          <Link
            href="/live-blogs"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
              pathname === "/live-blogs"
                ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white"
                : "text-slate-700 dark:text-slate-300 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>{lang === "hi" ? "ब्लॉग्स" : "Blogs"}</span>
          </Link>
        </nav>

        {/* Right: Search (Always visible), Hamburger (Mobile), Icons (Desktop) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Search Trigger (Always visible on both Mobile and Desktop) */}
          <div className="relative shrink-0">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1.5 sm:p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
              title="Search News"
              aria-label="Search"
            >
              <Search className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-slate-800 dark:text-slate-200" />
            </button>

            {searchOpen && (
              <form
                onSubmit={handleSearchSubmit}
                className="absolute right-0 top-11 sm:top-12 z-50 w-[calc(100vw-32px)] max-w-[320px] sm:w-80 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95"
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

          {/* Desktop Only: Language Switcher (Hidden in Mobile, available inside Hamburger) */}
          <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 text-[9px] sm:text-[11px] font-bold shrink-0">
            <button
              onClick={() => setLang("hi")}
              className={`px-1.5 sm:px-2 py-0.5 rounded transition-colors ${
                lang === "hi" ? "bg-red-600 text-white" : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              HI
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

          {/* Desktop Only: Dark mode toggle (Hidden in Mobile, available inside Hamburger) */}
          <button
            onClick={toggleDark}
            className="hidden md:flex p-1 sm:p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            title="Toggle Dark Mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Desktop Only: Reader Login / Profile Button to Dashboard (Hidden in Mobile, available inside Hamburger) */}
          {activeUser ? (
            <Link
              href="/dashboard"
              title={lang === "hi" ? "डैशबोर्ड खोलें" : "Open Dashboard"}
              className="hidden md:flex items-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-1 bg-gradient-to-r from-red-50 to-amber-50 hover:from-red-100 hover:to-amber-100 dark:from-slate-800 dark:to-slate-800/80 dark:hover:from-red-950/40 border border-red-200/80 dark:border-slate-700 hover:border-red-400 rounded-full text-xs font-bold transition-all shadow-xs group cursor-pointer shrink-0"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-red-600 via-red-500 to-amber-500 text-white flex items-center justify-center font-black text-xs shadow-xs overflow-hidden shrink-0">
                {activeUser.avatar ? (
                  <img src={activeUser.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{activeUser.name ? activeUser.name.charAt(0).toUpperCase() : "U"}</span>
                )}
              </div>
              <span className="hidden sm:inline font-bold text-slate-800 dark:text-slate-200 group-hover:text-red-600 dark:group-hover:text-red-400 max-w-[90px] truncate leading-tight">
                {activeUser.name || (lang === "hi" ? "प्रोफ़ाइल" : "Profile")}
              </span>
              <span className="text-[10px] text-red-600 dark:text-red-400 font-extrabold hidden md:inline">
                डैशबोर्ड &rarr;
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden md:flex items-center gap-1 px-2.5 sm:px-4 py-1 sm:py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-full text-[11px] sm:text-xs font-bold shadow-xs transition-transform hover:scale-105 active:scale-95 shrink-0"
            >
              <User className="w-3.5 h-3.5" />
              <span>{lang === "hi" ? "लॉगिन" : "Login"}</span>
            </Link>
          )}

          {/* Mobile Hamburger Menu Button (Shows only Search + Hamburger on Mobile) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden flex items-center justify-center p-1.5 sm:p-2 text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-xs shrink-0 cursor-pointer"
            aria-label="Toggle Menu"
          >
            <Menu className="w-5 h-5 text-slate-900 dark:text-white" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden flex">
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
                    src={siteSettings?.logo || "/logo.png"}
                    alt={siteSettings?.siteName || "Swar Media Logo"}
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

              {/* User Account / Profile Card in Hamburger */}
              <div className="pt-3 pb-2">
                {activeUser ? (
                  <div className="p-3 bg-gradient-to-r from-red-50 to-amber-50 dark:from-slate-800 dark:to-slate-800/90 rounded-2xl border border-red-200/70 dark:border-slate-700 space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-red-600 via-red-500 to-amber-500 text-white flex items-center justify-center font-black text-sm shadow-xs overflow-hidden shrink-0">
                        {activeUser.avatar ? (
                          <img src={activeUser.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span>{activeUser.name ? activeUser.name.charAt(0).toUpperCase() : "U"}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {activeUser.name}
                        </div>
                        <div className="text-[10px] text-red-600 dark:text-red-400 font-bold">
                          {activeUser.role === "admin" || activeUser.role === "superadmin" ? "संपादक" : "नागरिक पत्रकार"}
                        </div>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-extrabold rounded-lg shadow-xs shrink-0"
                      >
                        डैशबोर्ड &rarr;
                      </Link>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-white rounded-xl text-xs font-black shadow-sm shadow-amber-500/20 active:scale-98 transition-all"
                  >
                    <User className="w-4 h-4" />
                    <span>{lang === "hi" ? "लॉगिन / साइन-अप करें" : "Login / Sign Up"}</span>
                  </Link>
                )}
              </div>

              {/* Quick Settings: Language & Dark Mode Toggles (Moved to Hamburger) */}
              <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                {/* Language Switcher */}
                <div className="flex items-center justify-between px-2.5 py-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">भाषा:</span>
                  <div className="flex items-center bg-white dark:bg-slate-900 rounded-lg p-0.5 text-[10px] font-black border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setLang("hi")}
                      className={`px-1.5 py-0.5 rounded transition-colors ${
                        lang === "hi" ? "bg-red-600 text-white" : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      HI
                    </button>
                    <button
                      type="button"
                      onClick={() => setLang("en")}
                      className={`px-1.5 py-0.5 rounded transition-colors ${
                        lang === "en" ? "bg-red-600 text-white" : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      EN
                    </button>
                  </div>
                </div>

                {/* Dark Mode Switcher */}
                <button
                  type="button"
                  onClick={toggleDark}
                  className="flex items-center justify-between px-2.5 py-2 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <span>{darkMode ? "लाइट मोड" : "डार्क मोड"}</span>
                  {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
                </button>
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
                  <span>{lang === "hi" ? "🔴 लाइव न्यूज़" : "🔴 Live News"}</span>
                </Link>

                {/* Mobile ePaper */}
                <Link
                  href="/epaper"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl"
                >
                  <Newspaper className="w-4 h-4 text-red-600" />
                  <span>{lang === "hi" ? "आज का अखबार ई-पेपर" : "Today's e-Paper"}</span>
                </Link>

                {/* Mobile Videos */}
                <Link
                  href="/videos"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl"
                >
                  <Video className="w-4 h-4 text-red-600" />
                  <span>{t("videos")}</span>
                </Link>

                {/* Mobile Blogs */}
                <Link
                  href="/live-blogs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl"
                >
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>{lang === "hi" ? "ब्लॉग्स" : "Blogs"}</span>
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
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              {activeUser && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 border border-red-200 dark:border-red-900/50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{lang === "hi" ? "साइन आउट (लॉगआउट)" : "Sign Out"}</span>
                </button>
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

      {/* Global Red Left Filter Drawer (SlidersHorizontal Drawer) */}
      <FilterDrawer
        isOpen={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
      />
    </header>
  );
}
