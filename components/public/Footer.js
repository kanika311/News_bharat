"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Youtube,
  Twitter,
  Facebook,
  Instagram,
  Send,
  MessageCircle,
  Mail,
  Phone,
  Shield,
  FileText,
  ChevronRight,
  Loader2,
  CheckCircle,
  User,
  Radio,
  Tv,
} from "lucide-react";
import { useLang } from "@/lib/langContext";
import { apiFetch } from "@/lib/api";

export default function Footer() {
  const { lang, t } = useLang();
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(null);
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subMessage, setSubMessage] = useState("");

  useEffect(() => {
    // 1. Fetch live site settings from MongoDB
    apiFetch("/api/settings")
      .then((res) => {
        if (res.success && res.settings) setSettings(res.settings);
      })
      .catch(() => {});

    // 2. Fetch categories for footer links
    apiFetch("/api/categories?menuOnly=true")
      .then((res) => {
        if (res.success) setCategories(res.categories || []);
      })
      .catch(() => {});
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribing(true);
    setSubMessage("");

    try {
      const res = await apiFetch("/api/subscribers", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSubMessage(res.message || "Thank you for subscribing!");
      setEmail("");
    } catch (err) {
      setSubMessage(err.message || "Failed to subscribe");
    } finally {
      setSubscribing(false);
    }
  };

  const adminName = settings?.adminName || "Rajesh Sharma (प्रधान संपादक)";
  const contactEmail = settings?.contactEmail || "Swarmedia4554@gmail.com";
  const contactPhone = settings?.contactPhone || "+91 8181935240";
  const logoUrl = settings?.logo || "/logo.png";
  const siteName =
    lang === "hi"
      ? settings?.siteNameHi || "द स्वर मीडिया"
      : settings?.siteName || "The Swar Media";
  const tagLine =
    lang === "hi"
      ? settings?.tagLineHi || "सच के साथ, समाज के लिए"
      : settings?.tagLine || "सच के साथ, समाज के लिए";
  const footerText = settings?.footerText || "Powered By JCRM Technologies";
  const footerTextHi = settings?.footerTextHi || "Swarmedia4554@gmail.com";
  const social = settings?.socialLinks || {};

  return (
    <footer className="bg-slate-950 text-slate-300 pt-12 pb-8 border-t-2 border-amber-500/40 mt-0">
      <div className="w-full px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Newsletter Banner in Deep Royal Navy & Rich Gold */}
        <div className="p-8 bg-gradient-to-r from-[#070e1e] via-[#0f1d3b] to-[#070e1e] rounded-3xl text-white shadow-2xl border-2 border-amber-400/70 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-400/50 px-3 py-0.5 rounded-full inline-block mb-2">
              INFORM • INSPIRE • EMPOWER
            </span>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              {t("newsletterTitle")}
            </h3>
            <p className="text-xs text-amber-100/90 mt-1">{t("newsletterDesc")}</p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex-1 max-w-md">
            <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-amber-400/50">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                className="w-full px-3 py-2 text-xs bg-transparent text-white placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={subscribing}
                className="px-5 py-2.5 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-600 hover:to-yellow-500 rounded-xl shrink-0 transition-all shadow-md disabled:opacity-70 cursor-pointer"
              >
                {subscribing ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : t("subscribe")}
              </button>
            </div>
            {subMessage && (
              <p className="text-xs text-yellow-300 font-semibold mt-2 pl-2 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{subMessage}</span>
              </p>
            )}
          </form>
        </div>

        {/* Multi-column Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 text-xs">
          {/* Col 1: Brand & Dynamic Social Channels */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={logoUrl}
                alt={siteName}
                className="h-14 sm:h-16 w-auto object-contain drop-shadow-xl"
              />
            </div>

            <p className="text-amber-400 font-black text-xs font-hindi tracking-wide flex items-center gap-1.5">
              <span>{tagLine}</span>
            </p>

            <p className="text-slate-400 leading-relaxed text-xs">
              द स्वर मीडिया निष्पक्ष, विश्वसनीय और ज़मीनी पत्रकारिता का प्रमुख हिंदी एवं राष्ट्रीय डिजिटल न्यूज़ पोर्टल है।
            </p>

            {/* Social Icons from Site Settings */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {social.youtube && (
                <a
                  href={social.youtube}
                  target="_blank"
                  rel="noreferrer"
                  title="YouTube"
                  className="w-8 h-8 rounded-full bg-slate-900 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {social.twitter && (
                <a
                  href={social.twitter}
                  target="_blank"
                  rel="noreferrer"
                  title="X (Twitter)"
                  className="w-8 h-8 rounded-full bg-slate-900 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {social.facebook && (
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noreferrer"
                  title="Facebook"
                  className="w-8 h-8 rounded-full bg-slate-900 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {social.instagram && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noreferrer"
                  title="Instagram"
                  className="w-8 h-8 rounded-full bg-slate-900 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {social.telegram && (
                <a
                  href={social.telegram}
                  target="_blank"
                  rel="noreferrer"
                  title="Telegram"
                  className="w-8 h-8 rounded-full bg-slate-900 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                >
                  <Send className="w-4 h-4" />
                </a>
              )}
              {social.whatsapp && (
                <a
                  href={social.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  title="WhatsApp"
                  className="w-8 h-8 rounded-full bg-slate-900 hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Categories */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs border-b border-red-600 pb-1 inline-block">
              News Desks (प्रमुख श्रेणियां)
            </h4>
            <ul className="space-y-2 text-slate-400">
              {categories.slice(0, 6).map((c) => (
                <li key={c._id}>
                  <Link href={`/${c.slug}`} className="hover:text-red-500 transition-colors">
                    {lang === "hi" ? c.nameHi : c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Special Features */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs border-b border-red-600 pb-1 inline-block">
              Special Features (विशेष)
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link href="/live" className="hover:text-red-500 transition-colors flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping shrink-0" />
                  <span>{lang === "hi" ? "लाइव न्यूज़ प्रसारण" : "Live News"}</span>
                </Link>
              </li>
              <li>
                <Link href="/epaper" className="hover:text-red-500 transition-colors">
                  {lang === "hi" ? "दैनिक ई-पेपर संस्करण" : "Daily e-Paper"}
                </Link>
              </li>
              <li>
                <Link href="/videos" className="hover:text-red-500 transition-colors">
                  {t("videos")}
                </Link>
              </li>
              <li>
                <Link href="/live-blogs" className="hover:text-red-500 transition-colors">
                  {lang === "hi" ? "लाइव ब्लॉग्स" : "Live Blogs"}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-red-500 transition-colors">
                  {lang === "hi" ? "नागरिक पत्रकार डैशबोर्ड" : "Citizen Journalist Desk"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Corporate & Legal (Contact Us removed) */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs border-b border-red-600 pb-1 inline-block">
              Corporate & Legal
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link href="/pages/about" className="hover:text-red-500 transition-colors">
                  About Us (हमारे बारे में)
                </Link>
              </li>
              <li>
                <Link href="/pages/privacy-policy" className="hover:text-red-500 transition-colors">
                  Privacy Policy (गोपनीयता नीति)
                </Link>
              </li>
              <li>
                <Link href="/pages/terms" className="hover:text-red-500 transition-colors">
                  Terms of Service (नियम और शर्तें)
                </Link>
              </li>
              <li>
                <Link href="/pages/advertise" className="hover:text-red-500 transition-colors">
                  Advertise With Us (विज्ञापन दें)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Editorial & Contact Details (Live from Admin Settings) */}
          <div className="space-y-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs border-b border-red-600 pb-1 inline-block">
              संपादकीय एवं संपर्क
            </h4>
            <div className="space-y-3 text-slate-300">
              {/* Admin / Chief Editor Name */}
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                  प्रधान संपादक / एडमिन
                </span>
                <p className="text-xs font-black text-white flex items-center gap-1.5 font-hindi">
                  <User className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>{adminName}</span>
                </p>
              </div>

              {/* Email */}
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                  ईमेल (Email)
                </span>
                <a
                  href={`mailto:${contactEmail}`}
                  className="flex items-center gap-1.5 text-xs text-slate-200 hover:text-red-400 transition-colors break-all font-medium"
                >
                  <Mail className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>{contactEmail}</span>
                </a>
              </div>

              {/* Phone */}
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                  न्यूज़रूम फ़ोन (Phone)
                </span>
                <a
                  href={`tel:${contactPhone.replace(/\s+/g, "")}`}
                  className="flex items-center gap-1.5 text-xs text-slate-200 hover:text-red-400 font-bold transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>{contactPhone}</span>
                </a>
              </div>

              {/* WhatsApp Community Direct Link */}
              {social.whatsapp && (
                <div className="pt-1">
                  <a
                    href={social.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 hover:bg-emerald-900 transition-colors text-[11px] font-bold"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp चैनल जुड़ें</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Copyright (Live from Admin Settings) */}
        <div className="pt-8 border-t border-slate-900 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <p className="font-semibold text-slate-400">{footerText}</p>
            <span className="hidden sm:inline text-slate-700">•</span>
            <p className="text-slate-500">{footerTextHi}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sitemap.xml" className="hover:underline">
              Sitemap
            </Link>
            <Link href="/robots.txt" className="hover:underline">
              Robots
            </Link>
            <span className="text-slate-600">Press Council of India Guidelines Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
