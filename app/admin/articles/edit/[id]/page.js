"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import ArticleForm from "@/components/admin/ArticleForm";
import { Loader2 } from "lucide-react";

export default function EditArticlePage() {
  const params = useParams();
  const id = params?.id;
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    apiFetch(`/api/articles/${id}`)
      .then((res) => {
        if (res.success && res.article) {
          setArticle(res.article);
        } else {
          setError(res.message || "Article not found");
        }
      })
      .catch((err) => setError(err.message || "Failed to load article"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
        <p className="text-xs text-slate-500">Loading story details...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="p-8 text-center text-red-600">
        <p className="font-bold">{error || "Article could not be loaded."}</p>
      </div>
    );
  }

  return <ArticleForm initialData={article} isEdit={true} />;
}
