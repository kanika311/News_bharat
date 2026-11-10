"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  Eye,
  Share2,
  Calendar,
  MessageSquare,
  Send,
  CheckCircle,
  Copy,
  ChevronRight,
  Loader2,
  AlertCircle,
  Heart,
  ThumbsUp,
  Images,
  Film,
  ZoomIn,
  ChevronLeft,
  X,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useLang } from "@/lib/langContext";
import AdSlot from "@/components/public/AdSlot";

function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
}

export default function ArticleDetailPage() {
  const params = useParams();
  const slug = params?.slug;
  const categorySlug = params?.category;
  const { lang, t } = useLang();

  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Likes state
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Comment submission state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentMessage, setCommentMessage] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;

    async function loadArticleData() {
      setLoading(true);
      setError("");
      try {
        const res = await apiFetch(`/api/articles/slug/${slug}`);
        if (res.success && res.article) {
          setArticle(res.article);
          setLikesCount(res.article.likesCount || 0);

          if (typeof window !== "undefined") {
            const hasLiked = localStorage.getItem(`liked_article_${res.article._id}`);
            if (hasLiked) setIsLiked(true);
          }

          // Pre-fill user details if logged in
          apiFetch("/api/auth/me")
            .then((uRes) => {
              if (uRes.success && uRes.user) {
                setName((prev) => prev || uRes.user.name || "");
                setEmail((prev) => prev || uRes.user.email || "");
              }
            })
            .catch(() => {});

          // Fetch related stories and comments
          const [relRes, comRes] = await Promise.all([
            apiFetch(`/api/articles/related/${res.article._id}`),
            apiFetch(`/api/comments/article/${res.article._id}`),
          ]);

          if (relRes.success) setRelatedArticles(relRes.articles || []);
          if (comRes.success) setComments(comRes.comments || []);
        } else {
          setError(res.message || "Article not found.");
        }
      } catch (err) {
        setError(err.message || "Failed to load story");
      } finally {
        setLoading(false);
      }
    }

    loadArticleData();
  }, [slug]);

  const handleLike = async () => {
    if (!article || isLiked) return;
    setIsLiked(true);
    setLikesCount((prev) => prev + 1);

    if (typeof window !== "undefined") {
      localStorage.setItem(`liked_article_${article._id}`, "true");
    }

    try {
      const res = await apiFetch(`/api/articles/${article._id}/like`, { method: "POST" });
      if (res.success && res.likesCount) {
        setLikesCount(res.likesCount);
      }
    } catch (e) {
      console.error("Like error", e);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !content || !article) return;
    setCommentSubmitting(true);
    setCommentMessage("");

    try {
      const res = await apiFetch("/api/comments", {
        method: "POST",
        body: JSON.stringify({
          articleId: article._id,
          name,
          email,
          content,
        }),
      });
      if (res.success && res.comment) {
        setComments((prev) => [res.comment, ...prev]);
        setCommentMessage(lang === "hi" ? "आपकी प्रतिक्रिया प्रकाशित हो गई है!" : "Your comment has been published!");
      } else {
        setCommentMessage(res.message || "Comment submitted.");
      }
      setContent("");
    } catch (err) {
      setCommentMessage(err.message || "Error submitting comment.");
    } finally {
      setCommentSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-3">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
        <p className="text-xs uppercase tracking-widest text-slate-400">Loading Article...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-black text-slate-800">404 - Article Not Found</h1>
        <p className="text-sm text-slate-500">{error || "The requested article could not be located."}</p>
        <Link href="/" className="inline-block px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold text-xs">
          Return to Homepage
        </Link>
      </div>
    );
  }

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <article className="max-w-7xl mx-auto px-4 py-6">
      {/* JSON-LD NewsArticle Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": article.title,
            "description": article.excerpt || article.subtitle,
            "image": [article.featuredImage?.url],
            "datePublished": article.publishedAt || article.createdAt,
            "dateModified": article.updatedAt,
            "author": [{
              "@type": "Person",
              "name": article.author?.name || "Swar Media Desk",
            }],
            "publisher": {
              "@type": "NewsMediaOrganization",
              "name": "Swar Media",
              "logo": {
                "@type": "ImageObject",
                "url": "http://localhost:3000/logo.png"
              }
            }
          }),
        }}
      />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4">
        <Link href="/" className="hover:text-red-600">
          {t("home")}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/${article.category?.slug || categorySlug}`} className="hover:text-red-600 font-semibold text-red-600">
          {lang === "hi" && article.category?.nameHi ? article.category.nameHi : article.category?.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="truncate max-w-xs">{article.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Main Article Body (Left Side on Desktop - 8 cols) */}
        <div className="lg:col-span-8 space-y-6 min-w-0">
          {/* Headline & Subhead */}
          <div className="space-y-3">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase text-white bg-red-600">
              {lang === "hi" && article.category?.nameHi ? article.category.nameHi : article.category?.name}
            </span>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
              {article.title}
            </h1>

            {article.subtitle && (
              <p className="text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 leading-snug">
                {article.subtitle}
              </p>
            )}
          </div>

          {/* Author Byline & Social Share Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-3">
              <img
                src={article.author?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"}
                alt=""
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <div>
                <Link
                  href={`/author/${article.author?._id}`}
                  className="font-bold text-slate-900 dark:text-white hover:text-red-600 transition-colors"
                >
                  {article.author?.name || "Swar Media Desk"}
                </Link>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(article.publishedAt || article.createdAt).toLocaleString()}</span>
                  <span>•</span>
                  <span>{article.readingTime || 2} {t("minuteRead")}</span>
                </div>
              </div>
            </div>

            {/* Social Sharing & Like Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLike}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-90 ${
                  isLiked
                    ? "bg-red-600 text-white shadow-red-600/30 ring-2 ring-red-400"
                    : "bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/60"
                }`}
                title="Like this story"
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-white" : ""}`} />
                <span>{likesCount}</span>
              </button>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + " " + currentUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
              >
                <span>WhatsApp</span>
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(currentUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold flex items-center gap-1.5"
              >
                <span>X / Twitter</span>
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5"
              >
                <span>Facebook</span>
              </a>
              <button
                onClick={handleCopyLink}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors"
                title="Copy Link"
              >
                {copied ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Featured Image with Caption */}
          {article.featuredImage?.url && (
            <figure className="space-y-2">
              <div className="rounded-3xl overflow-hidden bg-slate-900 shadow-md">
                <img
                  src={article.featuredImage.url}
                  alt={article.featuredImage.alt || article.title}
                  className="w-full max-h-[580px] object-cover object-top"
                />
              </div>
              {article.featuredImage.caption && (
                <figcaption className="text-xs text-slate-500 italic pl-2 border-l-2 border-red-600">
                  {article.featuredImage.caption}
                </figcaption>
              )}
            </figure>
          )}

          {/* Rich Content Article Prose */}
          <div
            dangerouslySetInnerHTML={{ __html: article.content }}
            className="article-prose font-sans leading-relaxed text-slate-800 dark:text-slate-200 pt-2"
          />

          {/* Multiple Photos Gallery */}
          {article.galleryImages && article.galleryImages.length > 0 && (
            <section className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Images className="w-5 h-5 text-amber-500" />
                  <span>{lang === "hi" ? "तस्वीरें / फोटो गैलरी" : "Photo Gallery"}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                    {article.galleryImages.length} फोटो
                  </span>
                </h3>
                <span className="text-xs text-slate-400">
                  {lang === "hi" ? "बड़ा देखने के लिए क्लिक करें" : "Click to enlarge"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {article.galleryImages.map((img, gIdx) => (
                  <figure
                    key={gIdx}
                    onClick={() => setLightboxIndex(gIdx)}
                    className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer"
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden">
                      <img
                        src={img.url}
                        alt={img.caption || `Photo ${gIdx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <div className="flex items-center justify-between w-full text-white text-xs">
                        <span className="truncate pr-2 font-medium">{img.caption || `Photo ${gIdx + 1}`}</span>
                        <ZoomIn className="w-4 h-4 shrink-0 text-amber-400" />
                      </div>
                    </div>
                    {img.caption && (
                      <figcaption className="p-2 text-[11px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 truncate">
                        {img.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </section>
          )}

          {/* Multiple Videos Gallery */}
          {article.galleryVideos && article.galleryVideos.length > 0 && (
            <section className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-red-600" />
                <span>{lang === "hi" ? "वीडियो कवरेज" : "Video Coverage"}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300">
                  {article.galleryVideos.length} वीडियो
                </span>
              </h3>

              <div className="space-y-6">
                {article.galleryVideos.map((vid, vIdx) => {
                  const ytEmbed = getYouTubeEmbedUrl(vid.url);
                  return (
                    <div
                      key={vIdx}
                      className="rounded-3xl overflow-hidden bg-black border border-slate-200 dark:border-slate-800 shadow-md"
                    >
                      <div className="aspect-video w-full bg-black">
                        {ytEmbed ? (
                          <iframe
                            src={ytEmbed}
                            title={vid.title || `Video ${vIdx + 1}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full border-0"
                          />
                        ) : (
                          <video
                            src={vid.url}
                            controls
                            className="w-full h-full object-contain"
                          />
                        )}
                      </div>
                      {(vid.title || vid.caption) && (
                        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                          {vid.title && (
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              {vid.title}
                            </h4>
                          )}
                          {vid.caption && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {vid.caption}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Tags list */}
          {article.tags && article.tags.length > 0 && (
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Related Topics
              </span>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((t) => (
                  <Link
                    key={t._id || t}
                    href={`/tag/${t.slug || t}`}
                    className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    #{t.name || t}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* READER ENGAGEMENT & LIKE CARD */}
          <div className="p-6 bg-gradient-to-r from-red-50 via-white to-red-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 rounded-3xl border border-red-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform ${
                isLiked ? "bg-red-600 text-white shadow-red-600/30 scale-105" : "bg-red-100 dark:bg-red-950 text-red-600"
              }`}>
                <Heart className={`w-6 h-6 ${isLiked ? "fill-white animate-pulse" : ""}`} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  {lang === "hi" ? "क्या आपको यह खबर पसंद आई?" : "Did you like this news report?"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {lang === "hi"
                    ? `${likesCount} लोगों ने इसे पसंद किया • अपनी राय भी अवश्य दें`
                    : `${likesCount} readers appreciated this story • Share your thoughts below`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLike}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 ${
                isLiked
                  ? "bg-red-600 text-white shadow-red-600/30"
                  : "bg-white dark:bg-slate-800 text-red-600 border border-red-200 dark:border-red-900 hover:bg-red-50"
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-white" : ""}`} />
              <span>{isLiked ? (lang === "hi" ? "लाइक किया" : "Liked") : (lang === "hi" ? "लाइक करें" : "Like Story")}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-extrabold">
                {likesCount}
              </span>
            </button>
          </div>

          {/* COMMENTS SECTION */}
          <section className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-red-600" />
                <span>{t("comments")} ({comments.length})</span>
              </h2>
            </div>

            {/* Submit Comment Form */}
            <form onSubmit={handleCommentSubmit} className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t("leaveComment")}
              </h3>

              {commentMessage && (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{commentMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name (आपका नाम)..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Email (ईमेल)..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
                />
              </div>

              <textarea
                required
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts on this story..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 resize-y"
              />

              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  disabled={commentSubmitting}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-600/30 flex items-center gap-2 transition-all disabled:opacity-70"
                >
                  {commentSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{t("postComment")}</span>
                </button>
              </div>
            </form>

            {/* Approved Comments List */}
            <div className="space-y-3">
              {comments.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4">No comments posted yet. Be the first to share your opinion!</p>
              ) : (
                comments.map((com) => (
                  <div key={com._id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">{com.name}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(com.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {com.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Sticky Sidebar (Sponsored Ad & Related Articles - 4 cols) */}
        <aside className="lg:col-span-4 lg:sticky lg:top-[105px] lg:h-[calc(100vh-120px)] lg:overflow-y-auto no-scrollbar space-y-6 self-start">
          <AdSlot slot="sidebar" />

          {/* Related Articles Card */}
          {relatedArticles.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-red-600 rounded-full" />
                <span>{t("relatedArticles")}</span>
              </h3>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {relatedArticles.map((rel) => (
                  <Link
                    key={rel._id}
                    href={`/${rel.category?.slug || "news"}/${rel.slug}`}
                    className="py-3 flex items-start gap-3 group"
                  >
                    {rel.featuredImage?.url && (
                      <img
                        src={rel.featuredImage.url}
                        alt=""
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-100"
                      />
                    )}
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-red-600 transition-colors line-clamp-2">
                        {rel.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 block">
                        {new Date(rel.publishedAt || rel.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Lightbox Modal for Photo Gallery */}
      {lightboxIndex !== null && article?.galleryImages?.[lightboxIndex] && (
        <div
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 rounded-full cursor-pointer z-10"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>

          {lightboxIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(lightboxIndex - 1);
              }}
              className="absolute left-4 p-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full cursor-pointer z-10"
              title="Previous"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {lightboxIndex < article.galleryImages.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(lightboxIndex + 1);
              }}
              className="absolute right-4 p-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full cursor-pointer z-10"
              title="Next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl max-h-[85vh] flex flex-col items-center cursor-default"
          >
            <img
              src={article.galleryImages[lightboxIndex].url}
              alt=""
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl"
            />
            {article.galleryImages[lightboxIndex].caption && (
              <p className="text-white/90 text-center text-sm font-medium mt-3 bg-black/60 px-4 py-1.5 rounded-full">
                {article.galleryImages[lightboxIndex].caption}
              </p>
            )}
            <span className="text-white/50 text-xs mt-1">
              {lightboxIndex + 1} / {article.galleryImages.length}
            </span>
          </div>
        </div>
      )}
    </article>
  );
}
