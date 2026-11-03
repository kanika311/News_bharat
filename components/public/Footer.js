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
} from "lucide-react";
import { useLang } from "@/lib/langContext";
import { apiFetch } from "@/lib/api";

export default function Footer() {
  const { lang, t } = useLang();
  const [categories, setCategories] = useState([]);
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subMessage, setSubMessage] = useState("");

  useEffect(() => {
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

  return (
    <footer className="bg-slate-950 text-slate-300 pt-12 pb-8 border-t border-slate-900 mt-0">
      <div className="w-full px-3 sm:px-4 space-y-12">
        {/* Newsletter Banner */}
        <div className="p-8 bg-gradient-to-r from-red-900 via-red-800 to-slate-900 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-red-600/60 px-2 py-0.5 rounded-full inline-block mb-2">
              Stay Informed • सजग रहें
            </span>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              {t("newsletterTitle")}
            </h3>
            <p className="text-xs text-red-100 mt-1">{t("newsletterDesc")}</p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex-1 max-w-md">
            <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-red-700/50">
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
                className="px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shrink-0 transition-colors shadow-md disabled:opacity-70"
              >
                {subscribing ? <Loader2 className="w-4 h-4 animate-spin" /> : t("subscribe")}
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 text-xs">
          {/* Col 1: Brand */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Swar Media Logo"
                className="h-14 sm:h-16 w-auto object-contain drop-shadow-lg"
              />
            </div>

            <p className="text-slate-400 leading-relaxed text-xs max-w-sm">
              Swar Media is India's premier bilingual news portal delivering real-time national,
              international, political, sports, and business reporting with highest editorial
              standards.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <Send className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs border-b border-red-600 pb-1 inline-block">
              News Desks
            </h4>
            <ul className="space-y-2 text-slate-400">
              {categories.slice(0, 5).map((c) => (
                <li key={c._id}>
                  <Link href={`/${c.slug}`} className="hover:text-red-500 transition-colors">
                    {lang === "hi" ? c.nameHi : c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: More Categories */}
          <div className="space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-xs border-b border-red-600 pb-1 inline-block">
              Special Features
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link href="/videos" className="hover:text-red-500 transition-colors">
                  {t("videos")}
                </Link>
              </li>
              <li>
                <Link href="/photos" className="hover:text-red-500 transition-colors">
                  {t("photos")}
                </Link>
              </li>
              {categories.slice(5).map((c) => (
                <li key={c._id}>
                  <Link href={`/${c.slug}`} className="hover:text-red-500 transition-colors">
                    {lang === "hi" ? c.nameHi : c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Corporate & Compliance */}
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
                <Link href="/pages/contact" className="hover:text-red-500 transition-colors">
                  Contact Us (संपर्क करें)
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
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-slate-900 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Swar Media Network. All Rights Reserved. • सर्वाधिकार सुरक्षित।</p>
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
