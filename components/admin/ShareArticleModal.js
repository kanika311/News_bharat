"use client";

import React, { useState } from "react";
import {
  X,
  Share2,
  Check,
  Copy,
  ExternalLink,
  MessageCircle,
  Twitter,
  Facebook,
  Instagram,
  Send,
  Sparkles,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function ShareArticleModal({
  isOpen,
  onClose,
  article,
  settings,
  selectedPlatforms = {
    whatsapp: true,
    facebook: true,
    twitter: true,
    instagram: true,
    telegram: true,
  },
}) {
  const [copied, setCopied] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [platforms, setPlatforms] = useState(selectedPlatforms);
  const [sharedStatus, setSharedStatus] = useState({});

  if (!isOpen || !article) return null;

  const socialLinks = settings?.socialLinks || {};
  const siteOrigin = typeof window !== "undefined" ? window.location.origin : "https://theswarmedia.com";
  const articleUrl = `${siteOrigin}/${article.category?.slug || "news"}/${article.slug || article._id}`;

  const shareText = `📢 *${article.title}*\n\n${article.excerpt || ""}\n\n👉 पूरी खबर पढ़ें: ${articleUrl}\n\nद स्वर मीडिया (The Swar Media) - सच के साथ, समाज के लिए`;

  const copyArticleLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const copyFullCaption = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(shareText);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2200);
    }
  };

  const recordShare = async (platformName) => {
    try {
      if (article._id) {
        await apiFetch(`/api/articles/${article._id}/social-share`, {
          method: "POST",
          body: JSON.stringify({ platform: platformName }),
        });
        setSharedStatus((prev) => ({ ...prev, [platformName]: true }));
      }
    } catch (e) {
      console.warn("Could not record share activity", e);
    }
  };

  // 1. Share WhatsApp
  const shareToWhatsApp = () => {
    recordShare("whatsapp");
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, "_blank");
  };

  // 2. Share Facebook
  const shareToFacebook = () => {
    recordShare("facebook");
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`;
    window.open(fbUrl, "_blank");
  };

  // 3. Share Twitter / X
  const shareToTwitter = () => {
    recordShare("twitter");
    const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(articleUrl)}`;
    window.open(twUrl, "_blank");
  };

  // 4. Share Telegram
  const shareToTelegram = () => {
    recordShare("telegram");
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(article.title)}`;
    window.open(tgUrl, "_blank");
  };

  // 5. Open Instagram Profile / Creator
  const openInstagram = () => {
    recordShare("instagram");
    copyFullCaption();
    const instaUrl = socialLinks.instagram || "https://instagram.com";
    window.open(instaUrl, "_blank");
  };

  // Broadcast to all active
  const handleBroadcastAll = () => {
    if (platforms.whatsapp) shareToWhatsApp();
    if (platforms.facebook) shareToFacebook();
    if (platforms.twitter) shareToTwitter();
    if (platforms.telegram) shareToTelegram();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-gradient-to-r from-amber-50/50 to-white dark:from-slate-900 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center shadow-md">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>सोशल मीडिया पर साझा करें (Share to Social Media?)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                क्या आप इस खबर को अपने आधिकारिक चैनल्स एवं WhatsApp कम्युनिटी पर भेजना चाहते हैं?
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Article Summary Box */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex items-center gap-3">
            {article.featuredImage?.url && (
              <img
                src={article.featuredImage.url}
                alt=""
                className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-300 dark:border-slate-600 bg-black"
              />
            )}
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400">
                {article.category?.name || "News"}
              </span>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                {article.title}
              </h4>
              <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">{articleUrl}</p>
            </div>
            <button
              type="button"
              onClick={copyArticleLink}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs shrink-0 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
              title="Copy link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "कॉपी हुआ" : "लिंक"}</span>
            </button>
          </div>

          {/* Social Channels Configured from Site Settings */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
              साइट सेटिंग्स में जुड़े आधिकारिक चैनल्स (Configured Social Channels):
            </span>

            {/* 1. WhatsApp Community */}
            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs hover:border-emerald-500/50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      व्हाट्सएप कम्युनिटी / ग्रुप (WhatsApp)
                    </span>
                    {sharedStatus.whatsapp && (
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.2 rounded-full">
                        ✓ साझा किया
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    लिंक: {socialLinks.whatsapp || "Site Settings में उपलब्ध"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {socialLinks.whatsapp && socialLinks.whatsapp.startsWith("http") && (
                  <a
                    href={socialLinks.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-slate-400 hover:text-slate-600 text-xs flex items-center gap-1"
                    title="कम्युनिटी लिंक खोलें"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={shareToWhatsApp}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>शेयर करें</span>
                </button>
              </div>
            </div>

            {/* 2. Facebook */}
            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs hover:border-blue-500/50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Facebook className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      फेसबुक पेज (Facebook)
                    </span>
                    {sharedStatus.facebook && (
                      <span className="text-[9px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.2 rounded-full">
                        ✓ साझा किया
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    पेज: {socialLinks.facebook || "https://facebook.com/swarmedia"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {socialLinks.facebook && (
                  <a
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-slate-400 hover:text-slate-600 text-xs"
                    title="फेसबुक पेज खोलें"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={shareToFacebook}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1"
                >
                  <Facebook className="w-3.5 h-3.5" />
                  <span>शेयर करें</span>
                </button>
              </div>
            </div>

            {/* 3. Twitter / X */}
            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs hover:border-slate-500/50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Twitter className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">X / Twitter</span>
                    {sharedStatus.twitter && (
                      <span className="text-[9px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded-full">
                        ✓ साझा किया
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    अकाउंट: {socialLinks.twitter || "https://x.com/swarmedia"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {socialLinks.twitter && (
                  <a
                    href={socialLinks.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-slate-400 hover:text-slate-600 text-xs"
                    title="X प्रोफाइल खोलें"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={shareToTwitter}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1"
                >
                  <Twitter className="w-3.5 h-3.5" />
                  <span>ट्वीट करें</span>
                </button>
              </div>
            </div>

            {/* 4. Telegram */}
            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs hover:border-sky-500/50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Send className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      टेलीग्राम चैनल (Telegram)
                    </span>
                    {sharedStatus.telegram && (
                      <span className="text-[9px] font-bold text-sky-600 bg-sky-50 dark:bg-sky-950 px-1.5 py-0.2 rounded-full">
                        ✓ साझा किया
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    चैनल: {socialLinks.telegram || "https://t.me/swarmedia"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {socialLinks.telegram && (
                  <a
                    href={socialLinks.telegram}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-slate-400 hover:text-slate-600 text-xs"
                    title="टेलीग्राम चैनल खोलें"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={shareToTelegram}
                  className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>पोस्ट करें</span>
                </button>
              </div>
            </div>

            {/* 5. Instagram */}
            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs hover:border-pink-500/50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-yellow-500 via-pink-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Instagram className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      इंस्टाग्राम (Instagram)
                    </span>
                    {sharedStatus.instagram && (
                      <span className="text-[9px] font-bold text-pink-600 bg-pink-50 dark:bg-pink-950 px-1.5 py-0.2 rounded-full">
                        ✓ खोला गया
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    प्रोफाइल: {socialLinks.instagram || "https://instagram.com/swarmedia"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={copyFullCaption}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  {copiedCaption ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedCaption ? "कॉपी हुआ" : "कैप्शन कॉपी"}</span>
                </button>

                <button
                  type="button"
                  onClick={openInstagram}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>ओपन करें</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500">
            * लिंक्स <b>Site Settings</b> से स्वतः लिए गए हैं।
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              पूर्ण / बंद करें (Done)
            </button>
            <button
              type="button"
              onClick={handleBroadcastAll}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-xs rounded-xl shadow-sm ring-1 ring-amber-400/80 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>सभी पर शेयर करें (Broadcast All)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
