"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <html lang="hi">
      <body className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 text-white font-sans text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-950/80 text-red-500 flex items-center justify-center mb-4 border border-red-800">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight">
          सिस्टम त्रुटि (Application Error)
        </h2>
        <p className="text-xs text-slate-400 max-w-md mt-2">
          {error?.message || "साइट लोड करने में समस्या आई।"}
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg cursor-pointer transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reload Application</span>
        </button>
      </body>
    </html>
  );
}

