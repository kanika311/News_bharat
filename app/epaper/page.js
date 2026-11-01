"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Newspaper,
  Calendar,
  Download,
  Share2,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  MapPin,
} from "lucide-react";
import { useLang } from "@/lib/langContext";

export default function EPaperPage() {
  const { lang } = useLang();
  const [selectedEdition, setSelectedEdition] = useState("delhi");
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);

  const totalPages = 8;
  const todayDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const editions = [
    { id: "delhi", name: "Delhi Main (दिल्ली मुख्य संस्करण)" },
    { id: "mumbai", name: "Mumbai Edition (मुंबई संस्करण)" },
    { id: "lucknow", name: "Lucknow & UP (लखनऊ एवं उत्तर प्रदेश)" },
    { id: "patna", name: "Patna & Bihar (पटना एवं बिहार)" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center font-black shadow-md shadow-red-600/30">
            <Newspaper className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                BHARAT VARTA e-PAPER
              </h1>
              <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full font-hindi">
                ई-पेपर
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-red-600" />
              <span>{todayDate}</span>
            </p>
          </div>
        </div>

        {/* Edition & Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <MapPin className="w-4 h-4 text-red-600" />
            <select
              value={selectedEdition}
              onChange={(e) => setSelectedEdition(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              {editions.map((ed) => (
                <option key={ed.id} value={ed.id} className="dark:bg-slate-900">
                  {ed.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => alert("Downloading PDF edition of Bharat Varta e-Paper...")}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors shadow-md shadow-red-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Main Newspaper Paper View */}
      <div className="bg-slate-900 rounded-3xl p-4 sm:p-8 flex flex-col items-center justify-center min-h-[600px] shadow-2xl relative overflow-hidden">
        {/* Navigation Floating Buttons */}
        <div className="flex items-center justify-between w-full max-w-4xl mb-4 text-white">
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm">
            <span>Page {currentPage} of {totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.2))}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.2))}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Newspaper Page Canvas */}
        <div
          className="bg-white text-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top center" }}
        >
          {/* Newspaper Masthead */}
          <div className="border-b-4 border-black p-6 text-center space-y-2 bg-[#fcfbf9]">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest border-b border-black pb-1.5 text-slate-700">
              <span>VOL. XXVI NO. 102</span>
              <span>NEW DELHI • {todayDate.toUpperCase()}</span>
              <span>16 PAGES • ₹ 5.00</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-red-700 font-hindi leading-none">
              भारत वार्ता
            </h2>
            <p className="text-xs uppercase font-extrabold tracking-widest text-slate-800">
              BHARAT VARTA • सत्य, साहस और सरोकार • TRUTH, COURAGE & INTEGRITY
            </p>
          </div>

          {/* Newspaper Page 1 Grid */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#fcfbf9] text-xs">
            {/* Lead Story */}
            <div className="md:col-span-8 space-y-3 border-r-0 md:border-r border-slate-300 pr-0 md:pr-6">
              <span className="text-[10px] font-black uppercase text-red-700 bg-red-100 px-2 py-0.5 rounded">
                EXCLUSIVE FRONT PAGE DISPATCH
              </span>
              <h3 className="text-xl sm:text-2xl font-black leading-tight text-slate-950 font-hindi">
                संसद के आगामी विशेष सत्र में ऐतिहासिक आर्थिक विधेयकों पर सर्वदलीय सहमति के आसार
              </h3>
              <p className="font-semibold text-slate-700 leading-snug">
                नई दिल्ली: सरकार और विपक्षी दलों के बीच डिजिटल इंफ्रास्ट्रक्चर और निवेश संवर्धन पर उच्चस्तरीय चर्चा।
              </p>
              <img
                src="https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1000&q=80"
                alt=""
                className="w-full h-64 object-cover rounded-xl"
              />
              <p className="leading-relaxed text-slate-800 columns-2 gap-4 text-justify pt-1">
                भारतीय अर्थव्यवस्था के विकास को नई गति देने के उद्देश्य से संसद का विशेष सत्र आहूत किया गया है। वित्त मंत्रालय के शीर्ष अधिकारियों के अनुसार नए विधायी ढांचे से प्रत्यक्ष विदेशी निवेश में अप्रत्याशित वृद्धि होने की संभावना है। उद्योग जगत और सूक्ष्म उद्यमों को कर रियायतों का बड़ा तोहफा मिलने के संकेत मिले हैं।
              </p>
            </div>

            {/* Side Column Stories */}
            <div className="md:col-span-4 space-y-6">
              <div className="space-y-2 border-b border-slate-300 pb-4">
                <span className="text-[10px] font-bold text-red-600 uppercase">SPACE EXPLORATION</span>
                <h4 className="text-sm font-black font-hindi leading-tight">
                  इसरो ने डीप-स्पेस अन्वेषण के लिए नए शक्तिशाली रॉकेट का किया सफल परीक्षण
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  श्रीहरिकोटा: वैज्ञानिकों ने सौर मंडल के चुंबकीय क्षेत्रों के अध्ययन हेतु अत्याधुनिक प्रोब को निर्धारित कक्षा में स्थापित किया।
                </p>
              </div>

              <div className="space-y-2 border-b border-slate-300 pb-4">
                <span className="text-[10px] font-bold text-emerald-700 uppercase">MARKETS HIGH</span>
                <h4 className="text-sm font-black font-hindi leading-tight">
                  सेंसेक्स 85,000 अंक के पार, निवेशकों की संपत्ति में 4 लाख करोड़ का इजाफा
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  मुंबई: आईटी और बैंकिंग सेक्टर में चौतरफा लिवाली के दम पर दलाल स्ट्रीट पर ऐतिहासिक तेजी।
                </p>
              </div>

              <div className="p-3 bg-red-50 rounded-xl border border-red-200 space-y-1">
                <span className="text-[10px] font-bold text-red-700 uppercase">WEATHER DESK</span>
                <p className="text-[11px] font-medium text-slate-800">
                  उत्तर भारत में हल्की ठंड की दस्तक, दिल्ली का तापमान 22°C दर्ज।
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Page Switcher Bar */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="flex items-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl"
          >
            <ChevronLeft className="w-4 h-4" /> Previous Page
          </button>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-8 h-8 rounded-lg font-bold text-xs transition-colors ${
                  currentPage === p
                    ? "bg-white text-slate-900 shadow-md"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl"
          >
            Next Page <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
