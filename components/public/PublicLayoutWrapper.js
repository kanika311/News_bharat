"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Ticker from "./Ticker";
import Footer from "./Footer";
import { LangProvider } from "@/lib/langContext";
import { AuthProvider } from "@/lib/authContext";

export default function PublicLayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/swar-media-admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <AuthProvider>
      <LangProvider>
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
          {/* Sticky Header & Breaking Ticker Combined Container */}
          <div className="sticky top-0 z-40 w-full shadow-xs">
            <Header />
            <Ticker />
          </div>
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </LangProvider>
    </AuthProvider>
  );
}
