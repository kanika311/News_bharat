"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  Bell,
  CheckCheck,
  Flame,
  TrendingUp,
  Radio,
  Newspaper,
  ShieldAlert,
  Clock,
  Trash2,
  ExternalLink,
  Sliders,
} from "lucide-react";
import { useLang } from "@/lib/langContext";

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    category: "breaking",
    categoryLabelHi: "ब्रेकिंग न्यूज़",
    categoryLabelEn: "Breaking",
    titleHi: "संसद का विशेष सत्र: ऐतिहासिक आर्थिक विधेयकों पर सर्वदलीय सहमति के मजबूत आसार",
    titleEn: "Parliament Special Session: High-level consensus expected on economic reforms",
    snippetHi: "संसद के आगामी विशेष सत्र को लेकर सर्वदलीय बैठक में शीर्ष नेताओं के बीच सकारात्मक विमर्श।",
    snippetEn: "Key leaders deliberate on direct digital investment and economic infrastructure framework.",
    timeHi: "2 मिनट पहले",
    timeEn: "2 min ago",
    link: "/india",
    isRead: false,
    icon: Flame,
    color: "red",
  },
  {
    id: 2,
    category: "business",
    categoryLabelHi: "शेयर बाज़ार",
    categoryLabelEn: "Markets",
    titleHi: "सेंसेक्स 85,000 अंक के पार ऐतिहासिक स्तर पर पहुंचा, चौतरफा लिवाली से निवेशक गदगद",
    titleEn: "Sensex crosses 85,000 milestone as tech and banking equities skyrocket",
    snippetHi: "दलाल स्ट्रीट पर सुबह से ही तेज बढ़त, आईटी और बैंकिंग शेयर्स में अभूतपूर्व उछाल।",
    snippetEn: "Dalal Street witnesses all-time rally led by technology, energy and private banks.",
    timeHi: "14 मिनट पहले",
    timeEn: "14 min ago",
    link: "/business",
    isRead: false,
    icon: TrendingUp,
    color: "emerald",
  },
  {
    id: 3,
    category: "epaper",
    categoryLabelHi: "ई-पेपर संस्करण",
    categoryLabelEn: "e-Paper Edition",
    titleHi: "आज का भारत वार्ता ई-पेपर डिजिटल एडिशन अब पढ़ने के लिए उपलब्ध है",
    titleEn: "Today's Bharat Varta digital e-Paper edition is now available",
    snippetHi: "दिल्ली, मुंबई, लखनऊ और पटना संस्करण के सभी 8 पृष्ठ उच्च गुणवत्ता में पढ़ें।",
    snippetEn: "Flip through all 8 pages of Delhi, Mumbai, Lucknow & UP editions or download PDF.",
    timeHi: "45 मिनट पहले",
    timeEn: "45 min ago",
    link: "/epaper",
    isRead: false,
    icon: Newspaper,
    color: "blue",
  },
  {
    id: 4,
    category: "sports",
    categoryLabelHi: "क्रिकेट / खेल",
    categoryLabelEn: "Cricket",
    titleHi: "टी20 चैम्पियनशिप: अंतिम ओवर के रोमांच में भारत की ऐतिहासिक जीत",
    titleEn: "T20 Championship: India seals nail-biting final-over victory",
    snippetHi: "अंतिम गेंद पर शानदार चौका जड़कर टीम ने दर्ज की अविस्मरणीय जीत, जश्न में डूबा देश।",
    snippetEn: "Tremendous finish in high-pressure match thrills millions of cricket enthusiasts.",
    timeHi: "1 घंटा पहले",
    timeEn: "1 hr ago",
    link: "/sports",
    isRead: false,
    icon: Flame,
    color: "orange",
  },
  {
    id: 5,
    category: "breaking",
    categoryLabelHi: "इसरो मिशन",
    categoryLabelEn: "ISRO Mission",
    titleHi: "इसरो ने डीप-स्पेस अन्वेषण के लिए शक्तिशाली नए रॉकेट का किया सफल परीक्षण",
    titleEn: "ISRO successfully conducts high-thrust propulsion tests for deep-space exploration",
    snippetHi: "श्रीहरिकोटा अंतरिक्ष केंद्र से परीक्षण सफल, वैज्ञानिकों ने जताई अपार खुशी।",
    snippetEn: "Key milestone accomplished ahead of scheduled interplanetary voyage.",
    timeHi: "2 घंटे पहले",
    timeEn: "2 hrs ago",
    link: "/india",
    isRead: true,
    icon: Radio,
    color: "purple",
  },
  {
    id: 6,
    category: "politics",
    categoryLabelHi: "राजनीति",
    categoryLabelEn: "Politics",
    titleHi: "चुनाव आयोग ने आगामी राज्य विधानसभा चुनावों की निष्पक्ष तैयारियों की समीक्षा की",
    titleEn: "Election Commission reviews poll readiness and security arrangements",
    snippetHi: "मुख्य निर्वाचन आयुक्त ने सभी जिलों के पर्यवेक्षकों के साथ की विस्तृत समीक्षा बैठक।",
    snippetEn: "Comprehensive guidelines issued for transparent, accessible and smooth voting.",
    timeHi: "3 घंटे पहले",
    timeEn: "3 hrs ago",
    link: "/politics",
    isRead: true,
    icon: ShieldAlert,
    color: "red",
  },
  {
    id: 7,
    category: "breaking",
    categoryLabelHi: "वायु प्रदूषण",
    categoryLabelEn: "Air Quality",
    titleHi: "दिल्ली-एनसीआर में वायु गुणवत्ता सूचकांक 168 दर्ज, ग्रैप-2 के दिशा-निर्देश प्रभावी",
    titleEn: "Delhi-NCR AQI recorded at 168 (Moderate), strict GRAP-2 measures implemented",
    snippetHi: "सर्दियों की शुरुआत के साथ धूल नियंत्रण और वाहनों के प्रदूषण पर विशेष निगरानी।",
    snippetEn: "Authorities deploy anti-smog guns and mechanical sweepers across key hotspots.",
    timeHi: "4 घंटे पहले",
    timeEn: "4 hrs ago",
    link: "/india",
    isRead: true,
    icon: Clock,
    color: "amber",
  },
];

export default function NotificationDrawer({ isOpen, onClose }) {
  const { lang } = useLang();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState("all");
  const [pushEnabled, setPushEnabled] = useState(true);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );
  };

  const dismissNotification = (e, id) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const filteredNotifications =
    activeFilter === "all"
      ? notifications
      : notifications.filter((n) => n.category === activeFilter);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        {/* Drawer Panel */}
        <div className="w-screen max-w-md sm:max-w-lg bg-white dark:bg-slate-900 shadow-2xl flex flex-col h-full border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
          
          {/* 1. Drawer Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-red-600 to-red-700 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black tracking-tight">
                    {lang === "hi" ? "ताज़ा नोटिफिकेशन्स" : "Live Notifications"}
                  </h2>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-white text-red-600 text-[10px] font-black uppercase">
                      {unreadCount} {lang === "hi" ? "नया" : "New"}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-red-100 font-medium">
                  {lang === "hi" ? "भारत वार्ता 24x7 संपादकीय अलर्ट" : "Bharat Varta 24x7 Editorial Alerts"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-2 rounded-xl hover:bg-white/20 text-white/90 hover:text-white transition-colors"
                  title={lang === "hi" ? "सभी को पढ़ा हुआ मार्क करें" : "Mark all as read"}
                >
                  <CheckCheck className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/20 text-white transition-colors"
                aria-label="Close notifications"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 2. Filter Pills */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: "all", labelHi: "सभी", labelEn: "All" },
              { id: "breaking", labelHi: "ब्रेकिंग", labelEn: "Breaking" },
              { id: "business", labelHi: "बाज़ार", labelEn: "Markets" },
              { id: "epaper", labelHi: "ई-पेपर", labelEn: "e-Paper" },
              { id: "sports", labelHi: "खेल", labelEn: "Sports" },
              { id: "politics", labelHi: "राजनीति", labelEn: "Politics" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                  activeFilter === f.id
                    ? "bg-red-600 text-white shadow-xs"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-red-400"
                }`}
              >
                {lang === "hi" ? f.labelHi : f.labelEn}
              </button>
            ))}
          </div>

          {/* 3. Notification List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-2 sm:p-3 space-y-2">
            {filteredNotifications.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Bell className="w-12 h-12 stroke-1 mb-2 text-slate-300 dark:text-slate-600" />
                <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                  {lang === "hi" ? "कोई नया नोटिफिकेशन नहीं है" : "No notifications in this filter"}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {lang === "hi"
                    ? "संपादकीय टीम के नए अपडेट यहां दिखाई देंगे।"
                    : "Fresh updates will appear here automatically."}
                </p>
              </div>
            ) : (
              filteredNotifications.map((n) => {
                const IconComponent = n.icon || Bell;
                return (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`group relative p-3.5 rounded-2xl transition-all cursor-pointer border ${
                      !n.isRead
                        ? "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40 shadow-xs"
                        : "bg-white dark:bg-slate-800/60 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                          n.color === "red"
                            ? "bg-red-100 dark:bg-red-950 text-red-600"
                            : n.color === "emerald"
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-600"
                            : n.color === "blue"
                            ? "bg-blue-100 dark:bg-blue-950 text-blue-600"
                            : n.color === "orange"
                            ? "bg-orange-100 dark:bg-orange-950 text-orange-600"
                            : n.color === "purple"
                            ? "bg-purple-100 dark:bg-purple-950 text-purple-600"
                            : "bg-amber-100 dark:bg-amber-950 text-amber-600"
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                            {lang === "hi" ? n.categoryLabelHi : n.categoryLabelEn}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            <span>{lang === "hi" ? n.timeHi : n.timeEn}</span>
                          </span>
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                          )}
                        </div>

                        <Link
                          href={n.link}
                          onClick={onClose}
                          className="block text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors leading-snug line-clamp-2"
                        >
                          {lang === "hi" ? n.titleHi : n.titleEn}
                        </Link>

                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {lang === "hi" ? n.snippetHi : n.snippetEn}
                        </p>
                      </div>

                      {/* Dismiss item button */}
                      <button
                        onClick={(e) => dismissNotification(e, n.id)}
                        className="absolute right-3 top-3 p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title="Dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 4. Drawer Footer */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {lang === "hi" ? "ब्राउज़र अलर्ट सक्षम रखें" : "Browser Push Alerts"}
              </span>
              <button
                type="button"
                onClick={() => setPushEnabled(!pushEnabled)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  pushEnabled ? "bg-red-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    pushEnabled ? "translate-x-4" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200 dark:border-slate-800 text-xs">
              <button
                onClick={clearAll}
                disabled={notifications.length === 0}
                className="text-slate-500 hover:text-red-600 disabled:opacity-40 font-semibold flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{lang === "hi" ? "सभी साफ करें" : "Clear All"}</span>
              </button>

              <Link
                href="/epaper"
                onClick={onClose}
                className="text-red-600 hover:text-red-700 font-bold flex items-center gap-1 hover:underline"
              >
                <span>{lang === "hi" ? "ई-पेपर डिजिटल पढ़ें" : "Read e-Paper"}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
