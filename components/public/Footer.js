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
  AlertCircle,
  User,
  Radio,
  Tv,
  Newspaper,
  Scale,
  BookOpen,
  Megaphone,
  Briefcase,
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
  const [subStatus, setSubStatus] = useState(null); // "success" | "error"

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
    const cleanEmail = (email || "").trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setSubStatus("error");
      setSubMessage(lang === "hi" ? "कृपया एक वैध ईमेल पता दर्ज करें।" : "Please enter a valid email address.");
      return;
    }

    setSubscribing(true);
    setSubMessage("");
    setSubStatus(null);

    try {
      const res = await apiFetch("/api/subscribers", {
        method: "POST",
        body: JSON.stringify({ email: cleanEmail }),
      });
      if (res && res.success) {
        setSubStatus("success");
        setSubMessage(
          res.message ||
            (lang === "hi"
              ? "दैनिक बुलेटिन की सदस्यता के लिए धन्यवाद!"
              : "Thank you for subscribing!")
        );
        setEmail("");
      } else {
        setSubStatus("error");
        setSubMessage(
          res?.message ||
            (lang === "hi"
              ? "सदस्यता दर्ज नहीं हो सकी, कृपया पुनः प्रयास करें।"
              : "Failed to subscribe, please try again.")
        );
      }
    } catch (err) {
      setSubStatus("error");
      setSubMessage(
        err.message ||
          (lang === "hi"
            ? "सदस्यता दर्ज नहीं हो सकी, कृपया पुनः प्रयास करें।"
            : "Failed to subscribe, please try again.")
      );
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
    <footer className="bg-[#FFF8EE] text-slate-800 pt-10 pb-8 border-t-4 border-[#C9962A] mt-0 shadow-inner">
      <div className="w-full px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Newsletter Banner in Warm Ivory & Gold Theme */}
        <div className="p-6 sm:p-8 bg-white/95 rounded-3xl text-slate-900 shadow-md border-2 border-[#E4C56A] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="text-[10px] font-black uppercase tracking-widest bg-amber-100 text-[#854D0E] border border-[#C9962A]/60 px-3 py-1 rounded-full inline-block mb-2">
              INFORM • INSPIRE • EMPOWER
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-[#16325C] tracking-tight">
              {t("newsletterTitle")}
            </h3>
            <p className="text-xs text-slate-600 mt-1">{t("newsletterDesc")}</p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex-1 max-w-md">
            <div className="flex items-center gap-2 bg-[#FFF8EE] p-1.5 rounded-2xl border border-[#E4C56A] focus-within:border-[#C9962A] transition-colors">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                className="w-full px-3 py-2 text-xs bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={subscribing}
                className="px-5 py-2.5 text-xs font-black text-slate-950 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-600 hover:to-yellow-500 rounded-xl shrink-0 transition-all shadow-sm ring-1 ring-amber-400/80 disabled:opacity-70 cursor-pointer"
              >
                {subscribing ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : t("subscribe")}
              </button>
            </div>
            {subMessage && (
              <p
                className={`text-xs font-bold mt-2 pl-2 flex items-center gap-1.5 ${
                  subStatus === "success" ? "text-emerald-700" : "text-rose-600"
                }`}
              >
                {subStatus === "success" ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                )}
                <span>{subMessage}</span>
              </p>
            )}
          </form>
        </div>

        {/* Multi-column Navigation (Exact Swarnim Dastavej Layout & Styling) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-xs">
          {/* Col 1: Brand Logo, Description, RNI Registration, Social & WhatsApp Community */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={logoUrl}
                alt={siteName}
                className="h-14 sm:h-16 w-auto object-contain drop-shadow"
              />
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black text-[#16325C] font-hindi tracking-tight">
                  {siteName}
                </span>
                <span className="text-[11px] font-bold text-[#C9962A]">
                  {tagLine}
                </span>
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed text-xs">
              उत्तर प्रदेश व राष्ट्रीय स्तर का अग्रणी, निष्पक्ष एवं निर्भीक हिंदी दैनिक समाचार पत्र व डिजिटल मीडिया नेटवर्क।
            </p>

            {/* RNI / Registration Box */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#C9962A] bg-[#FFF5E2] text-[#854D0E] font-bold text-xs shadow-2xs">
                <span>पंजीकरण: RNI No. UP/HIN/2026/876</span>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="space-y-2 pt-1">
              <h5 className="text-xs font-black text-[#16325C] uppercase tracking-wide">
                सोशल मीडिया पर जुड़ें
              </h5>
              <div className="flex flex-wrap items-center gap-2">
                {social.facebook && (
                  <a
                    href={social.facebook}
                    target="_blank"
                    rel="noreferrer"
                    title="Facebook"
                    className="w-8 h-8 rounded-xl bg-white border border-[#C9962A]/50 text-blue-600 hover:bg-[#C9962A] hover:text-white shadow-2xs flex items-center justify-center transition-all hover:scale-105"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {social.twitter && (
                  <a
                    href={social.twitter}
                    target="_blank"
                    rel="noreferrer"
                    title="X (Twitter)"
                    className="w-8 h-8 rounded-xl bg-white border border-[#C9962A]/50 text-slate-900 hover:bg-[#C9962A] hover:text-white shadow-2xs flex items-center justify-center transition-all hover:scale-105"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {social.instagram && (
                  <a
                    href={social.instagram}
                    target="_blank"
                    rel="noreferrer"
                    title="Instagram"
                    className="w-8 h-8 rounded-xl bg-white border border-[#C9962A]/50 text-pink-600 hover:bg-[#C9962A] hover:text-white shadow-2xs flex items-center justify-center transition-all hover:scale-105"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {social.youtube && (
                  <a
                    href={social.youtube}
                    target="_blank"
                    rel="noreferrer"
                    title="YouTube"
                    className="w-8 h-8 rounded-xl bg-white border border-[#C9962A]/50 text-red-600 hover:bg-[#C9962A] hover:text-white shadow-2xs flex items-center justify-center transition-all hover:scale-105"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                )}
                {social.whatsapp && (
                  <a
                    href={social.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    title="WhatsApp"
                    className="w-8 h-8 rounded-xl bg-white border border-[#C9962A]/50 text-emerald-600 hover:bg-[#C9962A] hover:text-white shadow-2xs flex items-center justify-center transition-all hover:scale-105"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* WhatsApp Community Follow Button (Exact green button from screenshot) */}
            <div className="pt-1">
              <a
                href={social.whatsapp || "https://whatsapp.com/channel/swarmedia"}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5c] text-white text-xs font-black shadow-sm shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white text-white" />
                <span>व्हाट्सएप कम्युनिटी फॉलो करें</span>
              </a>
            </div>
          </div>

          {/* Col 2: प्रमुख श्रेणियां (Top Categories) */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-[#16325C] border-b-2 border-[#E4C56A] pb-1.5 flex items-center gap-1.5">
              <span>प्रमुख श्रेणियां</span>
            </h4>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-slate-700">
              {categories.length > 0 ? (
                categories.slice(0, 10).map((c) => (
                  <Link
                    key={c._id}
                    href={`/${c.slug}`}
                    className="hover:text-[#C9962A] font-medium transition-colors line-clamp-1 py-0.5"
                  >
                    {lang === "hi" && c.nameHi ? c.nameHi : c.name}
                  </Link>
                ))
              ) : (
                <>
                  <Link href="/state-city" className="hover:text-[#C9962A] font-medium py-0.5">उत्तर प्रदेश</Link>
                  <Link href="/search?q=सुलतानपुर" className="hover:text-[#C9962A] font-medium py-0.5">सुल्तानपुर विशेष</Link>
                  <Link href="/search?q=लखनऊ" className="hover:text-[#C9962A] font-medium py-0.5">लखनऊ दैनिक</Link>
                  <Link href="/india" className="hover:text-[#C9962A] font-medium py-0.5">देश / राष्ट्रीय</Link>
                  <Link href="/politics" className="hover:text-[#C9962A] font-medium py-0.5">राजनीति</Link>
                  <Link href="/business" className="hover:text-[#C9962A] font-medium py-0.5">कारोबार</Link>
                  <Link href="/sports" className="hover:text-[#C9962A] font-medium py-0.5">खेल जगत</Link>
                  <Link href="/videos" className="hover:text-[#C9962A] font-medium py-0.5">वीडियो न्यूज़</Link>
                </>
              )}
            </div>
          </div>

          {/* Col 3: डिजिटल सेवाएं व नीतियां (Digital Services & Policies with Gold Icons) */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-[#16325C] border-b-2 border-[#E4C56A] pb-1.5 flex items-center gap-1.5">
              <span>डिजिटल सेवाएं व नीतियां</span>
            </h4>
            <ul className="space-y-2.5 text-slate-700">
              <li>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 hover:text-[#C9962A] font-semibold transition-colors group"
                >
                  <Megaphone className="w-4 h-4 text-[#C9962A] group-hover:scale-110 transition-transform shrink-0" />
                  <span>नागरिक पत्रकारिता</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/epaper"
                  className="flex items-center gap-2 hover:text-[#C9962A] font-semibold transition-colors group"
                >
                  <Newspaper className="w-4 h-4 text-[#C9962A] group-hover:scale-110 transition-transform shrink-0" />
                  <span>दैनिक ई-पेपर (डिजिटल संस्करण)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/pages/advertise"
                  className="flex items-center gap-2 hover:text-[#C9962A] font-semibold transition-colors group"
                >
                  <Briefcase className="w-4 h-4 text-[#C9962A] group-hover:scale-110 transition-transform shrink-0" />
                  <span>क्लासिफाइड एवं निविदाएं</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/pages/privacy-policy"
                  className="flex items-center gap-2 hover:text-[#C9962A] font-semibold transition-colors group"
                >
                  <Shield className="w-4 h-4 text-[#C9962A] group-hover:scale-110 transition-transform shrink-0" />
                  <span>गोपनीयता नीति</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/pages/terms"
                  className="flex items-center gap-2 hover:text-[#C9962A] font-semibold transition-colors group"
                >
                  <Scale className="w-4 h-4 text-[#C9962A] group-hover:scale-110 transition-transform shrink-0" />
                  <span>नियम एवं शर्तें</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/pages/about"
                  className="flex items-center gap-2 hover:text-[#C9962A] font-semibold transition-colors group"
                >
                  <BookOpen className="w-4 h-4 text-[#C9962A] group-hover:scale-110 transition-transform shrink-0" />
                  <span>संपादकीय नीति व परिचय</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: संपादकीय एवं संपर्क (Editorial & Contact Desk) */}
          <div className="space-y-3 bg-white/90 p-4 rounded-2xl border border-[#E4C56A] shadow-xs">
            <h4 className="text-sm font-black text-[#16325C] border-b border-[#E4C56A] pb-1.5">
              संपादकीय एवं संपर्क
            </h4>
            <div className="space-y-3 text-slate-700">
              {/* Admin / Chief Editor Name */}
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                  प्रधान संपादक / एडमिन
                </span>
                <p className="text-xs font-black text-slate-900 flex items-center gap-1.5 font-hindi">
                  <User className="w-3.5 h-3.5 text-[#C9962A] shrink-0" />
                  <span>{adminName}</span>
                </p>
              </div>

              {/* Email */}
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                  ईमेल (Email)
                </span>
                <a
                  href={`mailto:${contactEmail}`}
                  className="flex items-center gap-1.5 text-xs text-slate-800 hover:text-[#C9962A] transition-colors break-all font-semibold"
                >
                  <Mail className="w-3.5 h-3.5 text-[#C9962A] shrink-0" />
                  <span>{contactEmail}</span>
                </a>
              </div>

              {/* Phone */}
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                  न्यूज़रूम फ़ोन (Phone)
                </span>
                <a
                  href={`tel:${contactPhone.replace(/\s+/g, "")}`}
                  className="flex items-center gap-1.5 text-xs text-slate-800 hover:text-[#C9962A] font-black transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#C9962A] shrink-0" />
                  <span>{contactPhone}</span>
                </a>
              </div>

              {/* Live Link to E-paper & Studio */}
              <div className="pt-1 flex items-center gap-2">
                <Link
                  href="/epaper"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100/90 text-[#854D0E] font-bold text-[10px] border border-[#C9962A]/50 hover:bg-[#C9962A] hover:text-white transition-colors"
                >
                  <Newspaper className="w-3 h-3" />
                  <span>ई-अखबार पढ़ें</span>
                </Link>
                <Link
                  href="/live"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-100 text-red-700 font-bold text-[10px] border border-red-300 hover:bg-red-600 hover:text-white transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                  <span>लाइव न्यूज़</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="pt-6 border-t border-[#E4C56A] text-[11px] text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <p className="font-bold text-slate-700">{footerText}</p>
            <span className="hidden sm:inline text-slate-400">•</span>
            <p className="text-slate-600">{footerTextHi}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sitemap.xml" className="hover:text-[#C9962A] font-semibold transition-colors">
              Sitemap
            </Link>
            <Link href="/robots.txt" className="hover:text-[#C9962A] font-semibold transition-colors">
              Robots
            </Link>
            <span className="text-slate-500 hidden md:inline">Press Council of India Guidelines Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
