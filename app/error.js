"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    console.error("App Router Caught Error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-950">
      <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mb-4 shadow-sm">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
        कुछ तकनीकी समस्या आई (Something went wrong)
      </h2>
      <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-2">
        {error?.message || "पेज लोड करने में अस्थायी समस्या हुई। कृपया पुनः प्रयास करें।"}
      </p>

      <div className="flex items-center gap-3 mt-6">
        <button
          type="button"
          onClick={() => reset()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>पुनः लोड करें (Try Again)</span>
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>मुख्य पृष्ठ (Home)</span>
        </Link>
      </div>
    </div>
  );
}

