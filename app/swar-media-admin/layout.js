"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/lib/authContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNavbar from "@/components/admin/AdminNavbar";
import { Loader2 } from "lucide-react";

function AdminLayoutInner({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLoginPage = pathname === "/swar-media-admin/login";

  // If on login page, render full screen immediately without loading spinner
  if (isLoginPage) {
    return <main className="min-h-screen bg-slate-950">{children}</main>;
  }

  // Safe side-effect redirection inside useEffect (prevents React 18 render crash)
  useEffect(() => {
    if (!loading && !isLoginPage) {
      if (!user) {
        router.replace("/swar-media-admin/login");
      } else if (!["superadmin", "editor", "reporter", "admin"].includes(user.role)) {
        router.replace("/swar-media-admin/login?error=forbidden");
      }
    }
  }, [loading, user, isLoginPage, router]);

  // Loading state with fallback button
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white gap-3 p-4">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
        <p className="text-xs uppercase tracking-widest text-slate-400">Loading Swar Media CMS...</p>
        <Link
          href="/swar-media-admin/login"
          className="text-xs text-red-400 hover:text-red-300 underline mt-3 transition-colors"
        >
          समय लग रहा है? सीधे लॉगिन पृष्ठ पर जाएं &rarr;
        </Link>
      </div>
    );
  }

  // If not on login page and not authenticated, render pleasant waiting state while router.replace executes
  if (!user || !["superadmin", "editor", "reporter", "admin"].includes(user?.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white gap-3 p-4">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
        <p className="text-xs uppercase tracking-widest text-slate-400">लॉगिन पर भेजा जा रहा है...</p>
        <Link
          href="/swar-media-admin/login"
          className="text-xs text-red-400 hover:text-red-300 underline mt-2 transition-colors"
        >
          सीधे लॉगिन पृष्ठ पर जाएं &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <AdminNavbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <AuthProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AuthProvider>
  );
}
