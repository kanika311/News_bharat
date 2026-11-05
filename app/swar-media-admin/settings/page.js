"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save, CheckCircle2, Loader2, Globe, Shield, MessageCircle, Phone, Sparkles, ExternalLink } from "lucide-react";
import { apiFetch } from "@/lib/api";
import ImageUploader from "@/components/admin/ImageUploader";

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState({
    siteName: "Swar Media",
    siteNameHi: "स्वर मीडिया",
    tagLine: "Voice of Truth & Integrity",
    tagLineHi: "सत्य, सुर और सरोकार",
    logo: "",
    favicon: "",
    adminName: "Rajesh Sharma (प्रधान संपादक)",
    contactEmail: "contact@swarmedia.in",
    contactPhone: "+91 11 2345 6789",
    whatsappNumber: "+91 98765 43210",
    isWhatsAppEnabled: true,
    whatsappDefaultMessage: "नमस्ते स्वर मीडिया! मुझे समाचार / विज्ञापन / सहयोग के संबंध में संपर्क करना है।",
    whatsappUseRandomMessages: true,
    whatsappRandomMessages: [
      "नमस्ते स्वर मीडिया! मुझे ताज़ा समाचार या ग्राउंड रिपोर्ट साझा करनी है।",
      "नमस्ते! स्वर मीडिया में विज्ञापन एवं सहयोग के संबंध में जानकारी चाहिए।",
      "नमस्ते स्वर मीडिया टीम! मुझे एक सुझाव / प्रतिक्रिया साझा करनी है।",
      "नमस्ते! मैं स्वर मीडिया डिजिटल पोर्टल से संपर्क कर रहा हूँ।",
    ],
    footerText: "© 2026 Swar Media Network. All rights reserved.",
    footerTextHi: "© 2026 स्वर मीडिया नेटवर्क। सर्वाधिकार सुरक्षित।",
    analyticsId: "",
    socialLinks: {
      facebook: "",
      twitter: "",
      youtube: "",
      instagram: "",
      telegram: "",
      whatsapp: "",
    },
    seoDefaults: {
      metaTitle: "",
      metaDescription: "",
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [randomMessagesText, setRandomMessagesText] = useState("");

  useEffect(() => {
    apiFetch("/api/settings")
      .then((res) => {
        if (res.success && res.settings) {
          const s = res.settings;
          const randomMsgs = Array.isArray(s.whatsappRandomMessages) && s.whatsappRandomMessages.length > 0
            ? s.whatsappRandomMessages
            : [
                "नमस्ते स्वर मीडिया! मुझे ताज़ा समाचार या ग्राउंड रिपोर्ट साझा करनी है।",
                "नमस्ते! स्वर मीडिया में विज्ञापन एवं सहयोग के संबंध में जानकारी चाहिए।",
                "नमस्ते स्वर मीडिया टीम! मुझे एक सुझाव / प्रतिक्रिया साझा करनी है।",
                "नमस्ते! मैं स्वर मीडिया डिजिटल पोर्टल से संपर्क कर रहा हूँ।",
              ];

          setSettings({
            ...s,
            whatsappNumber: s.whatsappNumber || "+91 98765 43210",
            isWhatsAppEnabled: s.isWhatsAppEnabled !== false,
            whatsappDefaultMessage: s.whatsappDefaultMessage || "नमस्ते स्वर मीडिया! मुझे समाचार / विज्ञापन / सहयोग के संबंध में संपर्क करना है।",
            whatsappUseRandomMessages: s.whatsappUseRandomMessages !== false,
            whatsappRandomMessages: randomMsgs,
            socialLinks: {
              ...settings.socialLinks,
              ...(s.socialLinks || {}),
            },
            seoDefaults: {
              ...settings.seoDefaults,
              ...(s.seoDefaults || {}),
            },
          });
          setRandomMessagesText(randomMsgs.join("\n"));
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess("");
    try {
      const parsedRandomMsgs = randomMessagesText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        ...settings,
        whatsappRandomMessages: parsedRandomMsgs.length > 0 ? parsedRandomMsgs : settings.whatsappRandomMessages,
      };

      await apiFetch("/api/settings", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setSuccess("Site configurations successfully saved!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      alert("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
        <p className="text-xs text-slate-500">Loading site configuration...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Portal Branding & Site Settings
          </h1>
          <p className="text-xs text-slate-500">
            Configure portal identity, logos, SEO defaults, social channels, and contact details
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/30 transition-all disabled:opacity-70"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Changes</span>
        </button>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-2xl border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Identity & Branding */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-red-600" />
            <span>Brand Identity</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Portal Name (English)
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Portal Name (Hindi)
              </label>
              <input
                type="text"
                value={settings.siteNameHi}
                onChange={(e) => setSettings({ ...settings, siteNameHi: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 font-hindi font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tagline (English)
              </label>
              <input
                type="text"
                value={settings.tagLine}
                onChange={(e) => setSettings({ ...settings, tagLine: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tagline (Hindi)
              </label>
              <input
                type="text"
                value={settings.tagLineHi}
                onChange={(e) => setSettings({ ...settings, tagLineHi: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 font-hindi"
              />
            </div>
          </div>

          <ImageUploader
            value={settings.logo}
            onChange={(url) => setSettings({ ...settings, logo: url })}
            label="Header Logo (Leave empty for stylized text branding)"
          />
        </div>

        {/* Contact & Legal */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-600" />
            <span>Contact & Legal Footnote</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Chief Editor / Admin Name (प्रधान संपादक)
              </label>
              <input
                type="text"
                value={settings.adminName || ""}
                onChange={(e) => setSettings({ ...settings, adminName: e.target.value })}
                placeholder="उदा. Rajesh Sharma (प्रधान संपादक)"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 font-hindi"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Editorial Contact Email
              </label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Newsroom Phone
              </label>
              <input
                type="text"
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Footer Copyright Text (English)
            </label>
            <input
              type="text"
              value={settings.footerText}
              onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Footer Copyright Text (Hindi)
            </label>
            <input
              type="text"
              value={settings.footerTextHi}
              onChange={(e) => setSettings({ ...settings, footerTextHi: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 font-hindi"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Google Analytics / Tracking Measurement ID
            </label>
            <input
              type="text"
              value={settings.analyticsId}
              onChange={(e) => setSettings({ ...settings, analyticsId: e.target.value })}
              placeholder="G-XXXXXXXXXX"
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* WhatsApp Floating Chat & Contact Helpline Settings */}
        <div className="md:col-span-2 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                <MessageCircle className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>WhatsApp फ्लोटिंग चैट एवं संपर्क हेल्पलाइन (WhatsApp Float & Helpline)</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                    Live Chat
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  वेबसाइट पर फ्लोटिंग व्हाट्सएप आइकन, हेल्पलाइन नंबर व रैंडम संदेश कॉन्फ़िगर करें
                </p>
              </div>
            </div>

            {/* Toggle Enable/Disable WhatsApp Button */}
            <label className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={settings.isWhatsAppEnabled}
                onChange={(e) => setSettings({ ...settings, isWhatsAppEnabled: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                फ्लोटिंग आइकन सक्रिय रखें (Active Float Button)
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* WhatsApp Contact Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                WhatsApp नंबर (Country Code सहित) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-emerald-600">
                  WA:
                </span>
                <input
                  type="text"
                  value={settings.whatsappNumber || ""}
                  onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                  placeholder="+91 98765 43210 या 919876543210"
                  className="w-full pl-10 pr-3 py-2 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                पाठक इस नंबर पर सीधे व्हाट्सएप संदेश भेज सकेंगे (उदा. +91 9876543210)
              </span>
            </div>

            {/* Calling Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                सामान्य हेल्पलाइन / कॉलिंग फोन नंबर (Newsroom Phone)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400">
                  <Phone className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  value={settings.contactPhone || ""}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                  placeholder="+91 11 2345 6789"
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-red-500 text-slate-900 dark:text-white"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                वेबसाइट फुटर व संपर्क पेज पर प्रदर्शित होने वाला फोन नंबर
              </span>
            </div>
          </div>

          {/* WhatsApp Default Message */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              डिफ़ॉल्ट प्री-फिल्ड संदेश (Default Pre-filled Message)
            </label>
            <input
              type="text"
              value={settings.whatsappDefaultMessage || ""}
              onChange={(e) => setSettings({ ...settings, whatsappDefaultMessage: e.target.value })}
              placeholder="नमस्ते स्वर मीडिया! मुझे समाचार / विज्ञापन / सहयोग के संबंध में संपर्क करना है।"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Random Messages Option */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.whatsappUseRandomMessages}
                  onChange={(e) =>
                    setSettings({ ...settings, whatsappUseRandomMessages: e.target.checked })
                  }
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>रैंडम संदेश विकल्प सक्रिय करें (Random Message Greeting)</span>
                </span>
              </label>
              <span className="text-[11px] text-slate-400">
                प्रत्येक पाठक के क्लिक पर नीचे दी गई सूची में से रैंडम संदेश चुना जाएगा
              </span>
            </div>

            {settings.whatsappUseRandomMessages && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  रैंडम स्वागत संदेशों की सूची (एक लाइन में एक संदेश लिखें):
                </label>
                <textarea
                  rows={4}
                  value={randomMessagesText}
                  onChange={(e) => setRandomMessagesText(e.target.value)}
                  placeholder="नमस्ते स्वर मीडिया! मुझे ताज़ा खबर साझा करनी है...&#10;नमस्ते! विज्ञापन हेतु संपर्क करना है...&#10;नमस्ते स्वर मीडिया टीम! मुझे एक सुझाव देना है..."
                  className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
                />
                <span className="text-[11px] text-slate-400 block">
                  💡 टिप: आप जितने चाहें अलग-अलग संदेश (जैसे समाचार, विज्ञापन, सुझाव आदि) लिख सकते हैं।
                </span>
              </div>
            )}
          </div>

          {/* Live Preview & Test Link */}
          {settings.whatsappNumber && (
            <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4 fill-current" />
                </div>
                <div className="text-[11px]">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    WhatsApp लिंक प्रीव्यू:
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-mono text-[10px]">
                    https://wa.me/{(settings.whatsappNumber || "").replace(/[^0-9]/g, "")}?text=...
                  </span>
                </div>
              </div>

              <a
                href={`https://wa.me/${(settings.whatsappNumber || "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                  settings.whatsappDefaultMessage || "नमस्ते स्वर मीडिया!"
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <span>व्हाट्सएप टेस्ट चैट खोलें</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Social Media Channels */}
        <div className="md:col-span-2 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Official Social Media & Broadcast Channels
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                YouTube Channel
              </label>
              <input
                type="url"
                value={settings.socialLinks?.youtube || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, youtube: e.target.value },
                  })
                }
                placeholder="https://youtube.com/..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                X / Twitter Handle
              </label>
              <input
                type="url"
                value={settings.socialLinks?.twitter || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, twitter: e.target.value },
                  })
                }
                placeholder="https://x.com/..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Facebook Page
              </label>
              <input
                type="url"
                value={settings.socialLinks?.facebook || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, facebook: e.target.value },
                  })
                }
                placeholder="https://facebook.com/..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Instagram Handle
              </label>
              <input
                type="url"
                value={settings.socialLinks?.instagram || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, instagram: e.target.value },
                  })
                }
                placeholder="https://instagram.com/..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Telegram Channel
              </label>
              <input
                type="url"
                value={settings.socialLinks?.telegram || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, telegram: e.target.value },
                  })
                }
                placeholder="https://t.me/..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                WhatsApp Channel
              </label>
              <input
                type="url"
                value={settings.socialLinks?.whatsapp || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialLinks: { ...settings.socialLinks, whatsapp: e.target.value },
                  })
                }
                placeholder="https://whatsapp.com/channel/..."
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
