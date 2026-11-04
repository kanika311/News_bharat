"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FileText, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useLang } from "@/lib/langContext";

export default function StaticPageViewer() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;
  const { lang } = useLang();

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    if (slug === "contact") {
      router.replace("/");
      return;
    }
    apiFetch(`/api/pages/slug/${slug}`)
      .then((res) => {
        if (res.success && res.page) setPage(res.page);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold">Page Not Found</h1>
        <p className="text-xs text-slate-500 mt-2">The requested page does not exist.</p>
      </div>
    );
  }

  const contentToDisplay =
    lang === "hi" && page.contentHi ? page.contentHi : page.content;
  const titleToDisplay =
    lang === "hi" && page.titleHi ? page.titleHi : page.title;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {titleToDisplay}
        </h1>
        <p className="text-xs text-slate-400 mt-1">Official Publication Policy Document</p>
      </div>

      <div
        dangerouslySetInnerHTML={{ __html: contentToDisplay }}
        className="article-prose text-slate-800 dark:text-slate-200 leading-relaxed"
      />
    </div>
  );
}
