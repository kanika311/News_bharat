"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Ticker from "./Ticker";
import TopicPills from "./TopicPills";
import Footer from "./Footer";
import { LangProvider } from "@/lib/langContext";

export default function PublicLayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <LangProvider>
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        <Header />
        <Ticker />
        <TopicPills />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </LangProvider>
  );
}
