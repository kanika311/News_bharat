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
  const isDashboard = pathname.startsWith("/dashboard");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <AuthProvider>
      <LangProvider>
        <div
          className={`flex flex-col ${
            isDashboard ? "lg:h-screen lg:overflow-hidden min-h-screen" : "min-h-screen"
          } bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors`}
        >
          {/* Sticky Header & Breaking Ticker Combined Container */}
          <div className="sticky top-0 z-40 w-full shadow-xs shrink-0">
            <Header />
            <Ticker />
          </div>
          <main className={`flex-1 ${isDashboard ? "lg:min-h-0 lg:overflow-hidden" : ""}`}>{children}</main>
          {!isDashboard && <Footer />}
        </div>
      </LangProvider>
    </AuthProvider>
  );
}
