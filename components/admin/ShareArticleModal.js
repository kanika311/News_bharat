"use client";

import React, { useState, useEffect } from "react";
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
  Edit2,
  Loader2,
  Save,
  Info,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function ShareArticleModal({
  isOpen,
  onClose,
  article,
  settings,
  onSettingsUpdate,
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
  const [toastMessage, setToastMessage] = useState("");

  // Editable links state
  const [links, setLinks] = useState({
    whatsapp: "",
    facebook: "",
    twitter: "",
    instagram: "",
    telegram: "",
  });

  // Inline link edit state
  const [editingPlatform, setEditingPlatform] = useState(null);
  const [tempLink, setTempLink] = useState("");
  const [saveToSiteSettings, setSaveToSiteSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Sync links from settings when opened or settings change
  useEffect(() => {
    if (settings?.socialLinks) {
      setLinks({
        whatsapp: settings.socialLinks.whatsapp || "https://whatsapp.com",
        facebook: settings.socialLinks.facebook || "https://facebook.com/swarmedia",
        twitter: settings.socialLinks.twitter || "https://x.com/swarmedia",
        instagram: settings.socialLinks.instagram || "https://instagram.com/swarmedia",
        telegram: settings.socialLinks.telegram || "https://t.me/swarmedia",
      });
    } else {
      setLinks({
        whatsapp: "https://whatsapp.com",
        facebook: "https://facebook.com/swarmedia",
        twitter: "https://x.com/swarmedia",
        instagram: "https://instagram.com/swarmedia",
        telegram: "https://t.me/swarmedia",
      });
    }
  }, [settings, isOpen]);

  if (!isOpen || !article) return null;

  const siteOrigin = typeof window !== "undefined" ? window.location.origin : "https://theswarmedia.com";
  const articleUrl = `${siteOrigin}/${article.category?.slug || "news"}/${article.slug || article._id}`;

  const shareText = `📢 *${article.title}*\n\n${article.excerpt || ""}\n\n👉 पूरी खबर पढ़ें: ${articleUrl}\n\nद स्वर मीडिया (The Swar Media) - सच के साथ, समाज के लिए`;

  const showToast = (msg, duration = 3500) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, duration);
  };

  const copyArticleLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      showToast("✓ आर्टिकल लिंक क्लिपबोर्ड पर कॉपी हो गया!");
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const copyFullCaption = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(shareText);
      setCopiedCaption(true);
      showToast("✓ पूरी खबर व लिंक कॉपी हो गया! आप इसे सीधे कहीं भी पेस्ट (Paste) कर सकते हैं।");
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

  // --- Inline Link Edit Handlers ---
  const startEditing = (platform, currentVal) => {
    setEditingPlatform(platform);
    setTempLink(currentVal || "");
  };

  const cancelEditing = () => {
    setEditingPlatform(null);
    setTempLink("");
  };

  const handleSaveLink = async (platform) => {
    const cleanUrl = tempLink.trim();
    if (!cleanUrl) {
      showToast("कृपया एक वैध लिंक दर्ज करें");
      return;
    }

    const updatedLinks = {
      ...links,
      [platform]: cleanUrl,
    };
    setLinks(updatedLinks);

    // Save to Site Settings if checked
    if (saveToSiteSettings) {
      setSavingSettings(true);
      try {
        const res = await apiFetch("/api/settings", {
          method: "PUT",
          body: JSON.stringify({
            socialLinks: {
              ...(settings?.socialLinks || {}),
              [platform]: cleanUrl,
            },
          }),
        });

        if (res.success && res.settings) {
          if (onSettingsUpdate) {
            onSettingsUpdate(res.settings);
          }
          showToast(`✓ नया लिंक सुरक्षित हो गया और साइट सेटिंग्स में भी सेव कर दिया गया!`);
        } else {
          showToast(`✓ लिंक इस शेयरिंग के लिए अपडेट कर दिया गया!`);
        }
      } catch (err) {
        showToast(`✓ लिंक अपडेट हुआ (साइट सेटिंग्स सेव नहीं हो सकी: ${err.message})`);
      } finally {
        setSavingSettings(false);
      }
    } else {
      showToast(`✓ लिंक इस शेयरिंग के लिए अपडेट कर दिया गया!`);
    }

    setEditingPlatform(null);
    setTempLink("");
  };

  // --- DIRECT SHARING ACTIONS ---

  // 1. WhatsApp: Direct to Community / Channel Link OR text intent
  const shareToWhatsApp = () => {
    recordShare("whatsapp");
    const targetUrl = links.whatsapp;

    // If it's a specific WhatsApp channel or group invite link
    const isChannelOrGroup =
      targetUrl &&
      (targetUrl.includes("whatsapp.com/channel") ||
        targetUrl.includes("chat.whatsapp.com") ||
        targetUrl.includes("/channel/"));

    if (isChannelOrGroup) {
      copyFullCaption();
      showToast("✓ खबर कॉपी हो गई! व्हाट्सएप कम्युनिटी लिंक खुल रहा है, वहां सीधे Paste करें।");
      window.open(targetUrl, "_blank");
    } else {
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
      window.open(waUrl, "_blank");
      showToast("✓ व्हाट्सएप शेयर विंडो खुल गई है!");
    }
  };

  const openWhatsAppGeneralShare = () => {
    recordShare("whatsapp");
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, "_blank");
  };

  // 2. Facebook: Direct to configured Page / Group link OR feed share dialog
  const shareToFacebook = () => {
    recordShare("facebook");
    const targetUrl = links.facebook;

    // If custom page/group/share URL
    if (targetUrl && targetUrl.startsWith("http")) {
      copyFullCaption();
      showToast("✓ खबर और लिंक कॉपी हो गया! फेसबुक पेज/ग्रुप खुल रहा है, वहां सीधे पोस्ट करें।");
      window.open(targetUrl, "_blank");
    } else {
      const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`;
      window.open(fbUrl, "_blank");
    }
  };

  const openFacebookShareDialog = () => {
    recordShare("facebook");
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`;
    window.open(fbUrl, "_blank");
  };

  // 3. Twitter / X: Direct Tweet Intent
  const shareToTwitter = () => {
    recordShare("twitter");
    const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(articleUrl)}`;
    window.open(twUrl, "_blank");
    showToast("✓ X / Twitter पोस्ट विंडो खुल गई है!");
  };

  const openTwitterDirectProfile = () => {
    if (links.twitter && links.twitter.startsWith("http")) {
      window.open(links.twitter, "_blank");
    }
  };

  // 4. Telegram: Direct to Channel OR Telegram share intent
  const shareToTelegram = () => {
    recordShare("telegram");
    const targetUrl = links.telegram;

    if (targetUrl && targetUrl.includes("t.me/") && !targetUrl.includes("share/url")) {
      copyFullCaption();
      showToast("✓ खबर कॉपी हो गई! टेलीग्राम चैनल खुल रहा है, वहां सीधे पेस्ट करें।");
      window.open(targetUrl, "_blank");
    } else {
      const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(article.title)}`;
      window.open(tgUrl, "_blank");
    }
  };

  // 5. Instagram: Direct to Instagram Profile / Channel link
  const openInstagram = () => {
    recordShare("instagram");
    copyFullCaption();
    const instaUrl = links.instagram || "https://instagram.com";
    showToast("✓ कैप्शन व लिंक कॉपी हो गया! इंस्टाग्राम खुल रहा है, पोस्ट/स्टोरी में पेस्ट करें।");
    window.open(instaUrl, "_blank");
  };

  // Broadcast to all active
  const handleBroadcastAll = () => {
    if (platforms.whatsapp) shareToWhatsApp();
    if (platforms.facebook) shareToFacebook();
    if (platforms.twitter) shareToTwitter();
    if (platforms.telegram) shareToTelegram();
    if (platforms.instagram) openInstagram();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
                लिंक बदलें और सीधे उसी लिंक/कम्युनिटी पर खबर शेयर करें:
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Toast Banner */}
        {toastMessage && (
          <div className="mx-5 mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage("")}
              className="p-1 hover:text-emerald-950"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

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

          {/* Social Channels List with In-Place Link Editing */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                चैनल्स व लिंक्स (सीधे इसी लिंक पर शेयर होगा):
              </span>
              <span className="text-[10px] text-amber-600 font-bold">
                * 'बदलें' दबाकर कोई भी नया लिंक डाल सकते हैं
              </span>
            </div>

            {/* 1. WHATSAPP COMMUNITY */}
            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2.5 hover:border-emerald-500/50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
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

                    {/* Display Link & Edit Trigger */}
                    {editingPlatform !== "whatsapp" ? (
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[11px] text-slate-500 font-mono truncate max-w-[250px] sm:max-w-sm">
                          लिंक: {links.whatsapp || "लिंक सेट नहीं है"}
                        </p>
                        <button
                          type="button"
                          onClick={() => startEditing("whatsapp", links.whatsapp)}
                          className="text-[10px] font-bold text-amber-600 hover:text-amber-700 hover:underline flex items-center gap-0.5 shrink-0 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>बदलें (Change)</span>
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* WhatsApp Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={openWhatsAppGeneralShare}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium cursor-pointer"
                    title="सामान्य व्हाट्सएप चैट / कॉन्टैक्ट्स पर भेजें"
                  >
                    <span>चैट शेयर</span>
                  </button>
                  <button
                    type="button"
                    onClick={shareToWhatsApp}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>कम्युनिटी पर शेयर करें</span>
                  </button>
                </div>
              </div>

              {/* Inline Link Edit Drawer for WhatsApp */}
              {editingPlatform === "whatsapp" && (
                <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2">
                  <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-200 block">
                    WhatsApp कम्युनिटी या ग्रुप का नया लिंक डालें:
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={tempLink}
                      onChange={(e) => setTempLink(e.target.value)}
                      placeholder="https://whatsapp.com/channel/... अथवा https://chat.whatsapp.com/..."
                      className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    <button
                      type="button"
                      disabled={savingSettings}
                      onClick={() => handleSaveLink("whatsapp")}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      {savingSettings ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      <span>सेव करें</span>
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                    >
                      रद्द
                    </button>
                  </div>
                  <label className="flex items-center gap-2 text-[10px] font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveToSiteSettings}
                      onChange={(e) => setSaveToSiteSettings(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-emerald-600"
                    />
                    <span>इस लिंक को Site Settings में भी हमेशा के लिए अपडेट करें</span>
                  </label>
                </div>
              )}
            </div>

            {/* 2. FACEBOOK PAGE / GROUP */}
            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2.5 hover:border-blue-500/50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Facebook className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        फेसबुक पेज / ग्रुप (Facebook)
                      </span>
                      {sharedStatus.facebook && (
                        <span className="text-[9px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.2 rounded-full">
                          ✓ साझा किया
                        </span>
                      )}
                    </div>

                    {/* Display Link & Edit Trigger */}
                    {editingPlatform !== "facebook" ? (
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[11px] text-slate-500 font-mono truncate max-w-[250px] sm:max-w-sm">
                          पेज/लिंक: {links.facebook || "लिंक सेट नहीं है"}
                        </p>
                        <button
                          type="button"
                          onClick={() => startEditing("facebook", links.facebook)}
                          className="text-[10px] font-bold text-amber-600 hover:text-amber-700 hover:underline flex items-center gap-0.5 shrink-0 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>बदलें (Change)</span>
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Facebook Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={openFacebookShareDialog}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium cursor-pointer"
                    title="फेसबुक शेयर डायलॉग खोलें"
                  >
                    <span>डायलॉग</span>
                  </button>
                  <button
                    type="button"
                    onClick={shareToFacebook}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Facebook className="w-3.5 h-3.5" />
                    <span>पेज पर शेयर करें</span>
                  </button>
                </div>
              </div>

              {/* Inline Link Edit Drawer for Facebook */}
              {editingPlatform === "facebook" && (
                <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800 space-y-2">
                  <span className="text-[11px] font-bold text-blue-900 dark:text-blue-200 block">
                    फेसबुक पेज या ग्रुप का सीधा लिंक डालें:
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={tempLink}
                      onChange={(e) => setTempLink(e.target.value)}
                      placeholder="https://www.facebook.com/share/..."
                      className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                    <button
                      type="button"
                      disabled={savingSettings}
                      onClick={() => handleSaveLink("facebook")}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      {savingSettings ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      <span>सेव करें</span>
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                    >
                      रद्द
                    </button>
                  </div>
                  <label className="flex items-center gap-2 text-[10px] font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveToSiteSettings}
                      onChange={(e) => setSaveToSiteSettings(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-blue-600"
                    />
                    <span>इस लिंक को Site Settings में भी हमेशा के लिए अपडेट करें</span>
                  </label>
                </div>
              )}
            </div>

            {/* 3. INSTAGRAM */}
            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2.5 hover:border-pink-500/50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-yellow-500 via-pink-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
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

                    {/* Display Link & Edit Trigger */}
                    {editingPlatform !== "instagram" ? (
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[11px] text-slate-500 font-mono truncate max-w-[250px] sm:max-w-sm">
                          प्रोफाइल: {links.instagram || "लिंक सेट नहीं है"}
                        </p>
                        <button
                          type="button"
                          onClick={() => startEditing("instagram", links.instagram)}
                          className="text-[10px] font-bold text-amber-600 hover:text-amber-700 hover:underline flex items-center gap-0.5 shrink-0 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>बदलें (Change)</span>
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Instagram Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={copyFullCaption}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCaption ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
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

              {/* Inline Link Edit Drawer for Instagram */}
              {editingPlatform === "instagram" && (
                <div className="p-3 bg-pink-50/60 dark:bg-pink-950/30 rounded-xl border border-pink-200 dark:border-pink-800 space-y-2">
                  <span className="text-[11px] font-bold text-pink-900 dark:text-pink-200 block">
                    इंस्टाग्राम प्रोफाइल या चैनल का सीधा लिंक डालें:
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={tempLink}
                      onChange={(e) => setTempLink(e.target.value)}
                      placeholder="https://instagram.com/your_handle"
                      className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-pink-500 font-mono"
                    />
                    <button
                      type="button"
                      disabled={savingSettings}
                      onClick={() => handleSaveLink("instagram")}
                      className="px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      {savingSettings ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      <span>सेव करें</span>
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                    >
                      रद्द
                    </button>
                  </div>
                  <label className="flex items-center gap-2 text-[10px] font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveToSiteSettings}
                      onChange={(e) => setSaveToSiteSettings(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-pink-600"
                    />
                    <span>इस लिंक को Site Settings में भी हमेशा के लिए अपडेट करें</span>
                  </label>
                </div>
              )}
            </div>

            {/* 4. X / TWITTER */}
            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2.5 hover:border-slate-500/50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Twitter className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">X / Twitter</span>
                      {sharedStatus.twitter && (
                        <span className="text-[9px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded-full">
                          ✓ साझा किया
                        </span>
                      )}
                    </div>

                    {/* Display Link & Edit Trigger */}
                    {editingPlatform !== "twitter" ? (
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[11px] text-slate-500 font-mono truncate max-w-[250px] sm:max-w-sm">
                          अकाउंट: {links.twitter || "लिंक सेट नहीं है"}
                        </p>
                        <button
                          type="button"
                          onClick={() => startEditing("twitter", links.twitter)}
                          className="text-[10px] font-bold text-amber-600 hover:text-amber-700 hover:underline flex items-center gap-0.5 shrink-0 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>बदलें (Change)</span>
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Twitter Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {links.twitter && (
                    <button
                      type="button"
                      onClick={openTwitterDirectProfile}
                      className="p-1.5 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                      title="X प्रोफाइल खोलें"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={shareToTwitter}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Twitter className="w-3.5 h-3.5" />
                    <span>ट्वीट करें</span>
                  </button>
                </div>
              </div>

              {/* Inline Link Edit Drawer for Twitter */}
              {editingPlatform === "twitter" && (
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 space-y-2">
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white block">
                    X (Twitter) प्रोफाइल का लिंक डालें:
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={tempLink}
                      onChange={(e) => setTempLink(e.target.value)}
                      placeholder="https://x.com/your_handle"
                      className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-slate-800 font-mono"
                    />
                    <button
                      type="button"
                      disabled={savingSettings}
                      onClick={() => handleSaveLink("twitter")}
                      className="px-3 py-1.5 bg-black text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      {savingSettings ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      <span>सेव करें</span>
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                    >
                      रद्द
                    </button>
                  </div>
                  <label className="flex items-center gap-2 text-[10px] font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveToSiteSettings}
                      onChange={(e) => setSaveToSiteSettings(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-slate-900"
                    />
                    <span>इस लिंक को Site Settings में भी हमेशा के लिए अपडेट करें</span>
                  </label>
                </div>
              )}
            </div>

            {/* 5. TELEGRAM CHANNEL */}
            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2.5 hover:border-sky-500/50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Send className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
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

                    {/* Display Link & Edit Trigger */}
                    {editingPlatform !== "telegram" ? (
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[11px] text-slate-500 font-mono truncate max-w-[250px] sm:max-w-sm">
                          चैनल: {links.telegram || "लिंक सेट नहीं है"}
                        </p>
                        <button
                          type="button"
                          onClick={() => startEditing("telegram", links.telegram)}
                          className="text-[10px] font-bold text-amber-600 hover:text-amber-700 hover:underline flex items-center gap-0.5 shrink-0 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>बदलें (Change)</span>
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Telegram Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={shareToTelegram}
                    className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>चैनल पर शेयर करें</span>
                  </button>
                </div>
              </div>

              {/* Inline Link Edit Drawer for Telegram */}
              {editingPlatform === "telegram" && (
                <div className="p-3 bg-sky-50/60 dark:bg-sky-950/30 rounded-xl border border-sky-200 dark:border-sky-800 space-y-2">
                  <span className="text-[11px] font-bold text-sky-900 dark:text-sky-200 block">
                    टेलीग्राम चैनल या ग्रुप का लिंक डालें:
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={tempLink}
                      onChange={(e) => setTempLink(e.target.value)}
                      placeholder="https://t.me/your_channel"
                      className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-mono"
                    />
                    <button
                      type="button"
                      disabled={savingSettings}
                      onClick={() => handleSaveLink("telegram")}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      {savingSettings ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      <span>सेव करें</span>
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
                    >
                      रद्द
                    </button>
                  </div>
                  <label className="flex items-center gap-2 text-[10px] font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveToSiteSettings}
                      onChange={(e) => setSaveToSiteSettings(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-sky-600"
                    />
                    <span>इस लिंक को Site Settings में भी हमेशा के लिए अपडेट करें</span>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>यहाँ बदला गया लिंक सीधे उसी ग्रुप/पेज/कम्युनिटी को खोलेगा।</span>
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
