"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Newspaper,
  Calendar,
  Download,
  Share2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  MapPin,
  Volume2,
  VolumeX,
  Search,
} from "lucide-react";
import { useLang } from "@/lib/langContext";

export default function EPaperPage() {
  const { lang } = useLang();
  const [selectedEdition, setSelectedEdition] = useState("lucknow");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const paperContainerRef = useRef(null);

  const totalPages = 4;

  const editions = [
    { id: "lucknow", name: "लखनऊ मुख्य संस्करण" },
    { id: "delhi", name: "दिल्ली मुख्य संस्करण" },
    { id: "mumbai", name: "मुंबई संस्करण" },
    { id: "patna", name: "पटना एवं बिहार संस्करण" },
  ];

  // Authentic Paper Flip Sound using Web Audio API Synthesizer
  const playPageTurnSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // 1. White noise buffer to simulate paper surface friction
      const bufferSize = Math.floor(ctx.sampleRate * 0.22);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.07));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // 2. Bandpass filter to give that specific crisp paper rustle frequency
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.18);
      filter.Q.value = 2.2;

      // 3. Gain envelope (attack & decay)
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      noise.stop(ctx.currentTime + 0.22);
    } catch (e) {
      console.warn("Audio synthesis:", e);
    }
  };

  const goToPage = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages || pageNum === currentPage) return;
    playPageTurnSound();
    setCurrentPage(pageNum);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  // Keyboard navigation (Left / Right arrow keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") handlePrevPage();
      if (e.key === "ArrowRight") handleNextPage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      paperContainerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="w-full bg-[#f8fafc] dark:bg-slate-950 min-h-screen py-4 sm:py-6">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 space-y-4">
        {/* ============================================================== */}
        {/* TOP CONTROLS BAR (Matches Swarnim Dastavej Layout Exactly)      */}
        {/* ============================================================== */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
          {/* Left: Date & Edition Selectors */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Date Picker */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>दिनांक:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              />
            </div>

            {/* Edition Dropdown */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <select
                value={selectedEdition}
                onChange={(e) => setSelectedEdition(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              >
                {editions.map((ed) => (
                  <option key={ed.id} value={ed.id} className="dark:bg-slate-900 text-slate-900 dark:text-white">
                    {ed.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right: Sound, Page Navigation & PDF */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Sound Toggle Button (Green icon like reference) */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playPageTurnSound();
              }}
              title={soundEnabled ? "Mute Page Flip Sound" : "Enable Page Flip Sound"}
              className={`p-2 rounded-xl border transition-colors flex items-center justify-center ${
                soundEnabled
                  ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800"
                  : "bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Page Navigation (< पिछला | 1 / 4 | अगला >) */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
              <button
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 disabled:opacity-40 disabled:hover:text-slate-600 transition-colors"
              >
                ‹ पिछला
              </button>

              <span className="px-2 py-1 text-slate-800 dark:text-slate-200 font-extrabold font-mono">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-extrabold rounded-lg shadow-xs transition-colors"
              >
                अगला ›
              </button>
            </div>

            {/* Full Screen Button */}
            <button
              onClick={toggleFullscreen}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>फुल पेज खोलें</span>
            </button>

            {/* Download PDF Button */}
            <button
              onClick={() => alert(`Downloading Swar Media e-Paper Page ${currentPage} (${selectedDate})...`)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* NEWSPAPER CANVAS WITH FLOATING PREV / NEXT BUTTONS             */}
        {/* ============================================================== */}
        <div
          ref={paperContainerRef}
          className="relative bg-[#e2e8f0]/80 dark:bg-slate-900/90 rounded-3xl p-4 sm:p-8 flex items-center justify-center min-h-[750px] shadow-inner overflow-hidden border border-slate-200 dark:border-slate-800 select-none"
        >
          {/* FLOATING LEFT CIRCULAR BUTTON (<) */}
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            aria-label="Previous Page"
            className={`absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700 transition-all z-20 ${
              currentPage <= 1
                ? "opacity-30 cursor-not-allowed"
                : "hover:scale-110 active:scale-95 hover:bg-red-50 hover:text-red-600 dark:hover:bg-slate-700 cursor-pointer"
            }`}
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>

          {/* FLOATING RIGHT CIRCULAR BUTTON (>) */}
          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            aria-label="Next Page"
            className={`absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700 transition-all z-20 ${
              currentPage >= totalPages
                ? "opacity-30 cursor-not-allowed"
                : "hover:scale-110 active:scale-95 hover:bg-red-50 hover:text-red-600 dark:hover:bg-slate-700 cursor-pointer"
            }`}
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>

          {/* REALISTIC NEWSPAPER PAGE (Crisp physical print style) */}
          <div className="relative w-full max-w-3xl bg-[#fefefe] text-slate-950 rounded-lg shadow-2xl border border-slate-300/80 overflow-hidden font-hindi">
            {/* Top Right "फुल स्क्रीन पढ़ें" overlay badge */}
            <button
              onClick={toggleFullscreen}
              className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 bg-black/75 hover:bg-black text-white text-[10px] font-bold rounded-full backdrop-blur-md transition-all shadow"
            >
              <Search className="w-3 h-3" />
              <span>फुल स्क्रीन पढ़ें</span>
            </button>

            {/* NEWSPAPER MASTHEAD (HEADER OF PAPER) */}
            <div className="border-b-4 border-slate-950 p-4 sm:p-5 bg-[#faf9f6]">
              {/* Top Sub-masthead */}
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-extrabold uppercase border-b border-slate-900 pb-1 text-slate-800">
                <span>वर्ष 26 • अंक 104 • डाक पंजीयन सं. 452</span>
                <span className="font-bold text-red-700">
                  {selectedEdition === "lucknow"
                    ? "लखनऊ मुख्य संस्करण"
                    : selectedEdition === "delhi"
                    ? "दिल्ली मुख्य संस्करण"
                    : selectedEdition === "mumbai"
                    ? "मुंबई संस्करण"
                    : "पटना संस्करण"}
                </span>
                <span>{selectedDate} • मूल्य ₹ 5.00 • पृष्ठ {currentPage}</span>
              </div>

              {/* Newspaper Main Title */}
              <div className="text-center py-2 sm:py-3 space-y-1">
                <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-950 font-serif">
                  स्वर मीडिया
                </h1>
                <p className="text-[10px] sm:text-xs font-black tracking-widest text-slate-700 uppercase">
                  हिन्दी दैनिक समाचार पत्र • निष्पक्षता, सत्य और जन सरोकार की बुलंद आवाज़
                </p>
              </div>

              {/* Bottom Tagline / Ticker inside Newspaper */}
              <div className="flex items-center justify-between border-t border-slate-900 pt-1 text-[9px] sm:text-[10px] font-bold text-slate-700">
                <span>संपादक: राजेश शर्मा</span>
                <span>इंटरनेट संस्करण: www.swarmedia.in</span>
                <span>मौसम: दिल्ली 24°C • लखनऊ 25°C • मुंबई 30°C</span>
              </div>
            </div>

            {/* DYNAMIC PAGE CONTENT BASED ON currentPage */}
            {currentPage === 1 && (
              /* ======================================================== */
              /* PAGE 1: FRONT PAGE (मुख्य पृष्ठ / राष्ट्रीय)            */
              /* ======================================================== */
              <div className="p-4 sm:p-6 space-y-5 bg-[#faf9f6]">
                {/* Top Banner Story */}
                <div className="border-b-2 border-slate-900 pb-4">
                  <div className="flex items-center justify-between text-xs text-red-700 font-black mb-1">
                    <span>केंद्रीय गृह मंत्रालय • विशेष रिपोर्ट</span>
                    <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded">प्रमुख खबर</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black leading-tight text-slate-950">
                    पार्टी का 350 सीट जीतने का लक्ष्य: नए संगठनात्मक फैसलों का हुआ एलान
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-700 font-bold mt-1 leading-snug">
                    अमित शाह ने कार्यकर्ताओं को संबोधित करते हुए कहा कि आगामी विधानसभा चुनावों में बूथ स्तर पर मजबूत पकड़ ही ऐतिहासिक जीत का आधार बनेगी।
                  </p>
                </div>

                {/* 2-Column Front Stories */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  {/* Left Column: Lead story with image */}
                  <div className="md:col-span-8 space-y-3 md:border-r border-slate-300 md:pr-5">
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-300">
                      <img
                        src="https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80"
                        alt="News Lead"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] px-1.5 py-0.5 rounded">
                        संसद भवन परिसर (फाइल फोटो)
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-black text-slate-950 leading-snug">
                      संसद के आगामी विशेष सत्र में ऐतिहासिक आर्थिक सुधारों और डिजिटल भारत पर नए विधेयक पेश होने के संकेत
                    </h3>

                    <p className="text-xs text-slate-800 leading-relaxed text-justify columns-1 sm:columns-2 gap-4">
                      नई दिल्ली: संसद के विशेष सत्र में देश की अर्थव्यवस्था और डिजिटल संरचना को बढ़ावा देने वाले ऐतिहासिक विधेयकों पर गहन चर्चा होगी। वित्त मंत्रालय और योजना आयोग के वरिष्ठ अधिकारियों ने मसौदा तैयार कर लिया है। सभी दलों के साथ सर्वदलीय बैठक आहूत की गई है।
                    </p>
                  </div>

                  {/* Right Column: Mercury to Gold Discovery & City Bulletins */}
                  <div className="md:col-span-4 space-y-4">
                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 space-y-1.5">
                      <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-200/60 px-1.5 py-0.5 rounded">
                        वैज्ञानिक शोध
                      </span>
                      <h4 className="text-sm font-black text-slate-950 leading-snug">
                        पारे (Mercury) से सोना! राजस्थान के वैज्ञानिक का दावा
                      </h4>
                      <p className="text-[11px] text-slate-700 leading-normal">
                        प्राचीन 'रसशास्त्र' और आचार्य नागार्जुन के ग्रंथों से मिला तरीका। शोधकर्ताओं ने लैब में प्राथमिक परीक्षण सफल रहने की बात कही।
                      </p>
                    </div>

                    <div className="border-t border-slate-300 pt-3 space-y-1">
                      <h4 className="text-xs font-black text-red-700">
                        जम्मू-कश्मीर: पूर्व पत्रकार निधि राजदान संग रचाई शादी
                      </h4>
                      <p className="text-[11px] text-slate-600 leading-normal">
                        उमर अब्दुल्ला के नए सफर पर सोशल मीडिया पर बधाईयों का तांता लगा।
                      </p>
                    </div>

                    <div className="border-t border-slate-300 pt-3 space-y-1">
                      <h4 className="text-xs font-black text-slate-900">
                        शेयर बाजार: सेंसेक्स 85,000 के पार
                      </h4>
                      <p className="text-[11px] text-slate-600 leading-normal">
                        आईटी और बैंकिंग शेयरों में जबरदस्त उछाल से निवेशकों की संपत्ति में 4 लाख करोड़ का इजाफा।
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentPage === 2 && (
              /* ======================================================== */
              /* PAGE 2: STATE & CITY (राज्य-शहर बुलेटिन)                 */
              /* ======================================================== */
              <div className="p-4 sm:p-6 space-y-5 bg-[#faf9f6]">
                <div className="border-b-2 border-red-700 pb-2 flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-black text-red-700">
                    राज्य-शहर • उत्तर प्रदेश हलचल
                  </h2>
                  <span className="text-xs font-bold text-slate-600">पेज 2 • ग्राउंड रिपोर्ट्स</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2 border border-slate-200 p-4 rounded-xl bg-white">
                    <span className="text-[10px] font-black text-white bg-red-600 px-2 py-0.5 rounded">
                      सुल्तानपुर
                    </span>
                    <h3 className="text-base font-black text-slate-950">
                      जल जीवन मिशन के कर्मचारियों पर जानलेवा हमला, 13 नामजद समेत 23 पर FIR दर्ज
                    </h3>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      उत्तर प्रदेश के सुल्तानपुर जिले में जल जीवन मिशन के तहत काम कर रहे कर्मचारियों पर दबंगों द्वारा हमला करने का मामला सामने आया है। पुलिस ने त्वरित कार्रवाई करते हुए मुख्य आरोपियों को हिरासत में लिया।
                    </p>
                  </div>

                  <div className="space-y-2 border border-slate-200 p-4 rounded-xl bg-white">
                    <span className="text-[10px] font-black text-white bg-slate-800 px-2 py-0.5 rounded">
                      लखनऊ
                    </span>
                    <h3 className="text-base font-black text-slate-950">
                      23वीं मंजिल से गिरकर पति-बेटे की मौत के बाद अफसर पत्नी ने की आत्महत्या की कोशिश
                    </h3>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      राजधानी लखनऊ के पॉश इलाके में स्थित बहुमंजिला इमारत की 23वीं मंजिल से गिरकर पिता-पुत्र की मौत हो गई। घटना के कुछ ही समय बाद सदमे में आई पत्नी ने जान देने का प्रयास किया, जिनका अस्पताल में इलाज जारी है।
                    </p>
                  </div>
                </div>

                <div className="border-t-2 border-slate-900 pt-4 space-y-3">
                  <h3 className="text-lg font-black text-slate-950">
                    अयोध्या में दीपोत्सव की तैयारियां तेज, 28 लाख दीयों से बनेगा नया विश्व रिकॉर्ड
                  </h3>
                  <p className="text-xs text-slate-700 columns-2 leading-relaxed text-justify">
                    रामनगरी अयोध्या में इस बार का दीपोत्सव भव्य और ऐतिहासिक होने जा रहा है। राम की पैड़ी पर 28 लाख दीये जलाकर नया गिनीज वर्ल्ड रिकॉर्ड बनाने की तैयारी है। 30 हजार से अधिक वालंटियर्स तैनात रहेंगे और सुरक्षा के कड़े इंतजाम किए गए हैं।
                  </p>
                </div>
              </div>
            )}

            {currentPage === 3 && (
              /* ======================================================== */
              /* PAGE 3: EDITORIAL & OPINION (संपादकीय एवं विचार)        */
              /* ======================================================== */
              <div className="p-4 sm:p-6 space-y-5 bg-[#faf9f6]">
                <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    संपादकीय • विचार और विमर्श
                  </h2>
                  <span className="text-xs font-bold text-slate-600">पेज 3 • संपादकीय मंच</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  <div className="md:col-span-8 space-y-3 md:border-r border-slate-300 md:pr-5">
                    <h3 className="text-xl font-black text-slate-950">
                      भारत का अंतरिक्ष विजन: आत्मनिर्भरता से वैश्विक नेतृत्व तक
                    </h3>
                    <p className="text-xs text-slate-500 font-bold">आलेख: डॉ. के. राधाकृष्णन (वरिष्ठ अंतरिक्ष विशेषज्ञ)</p>
                    <p className="text-xs text-slate-800 leading-relaxed columns-2 gap-4 text-justify pt-1">
                      हाल के वर्षों में भारतीय अंतरिक्ष अनुसंधान संगठन (इसरो) ने वैश्विक स्तर पर जो प्रतिष्ठा अर्जित की है, वह अप्रत्याशित है। चंद्रयान और आदित्य-एल1 मिशनों की सफलता ने यह साबित कर दिया है कि भारत किफायती लेकिन विश्वस्तरीय तकनीक का केंद्र है। आगामी गगनयान मिशन मानव अंतरिक्ष उड़ान के क्षेत्र में देश को एक नई ऊंचाई पर स्थापित करेगा।
                    </p>
                  </div>

                  <div className="md:col-span-4 space-y-4">
                    <div className="bg-slate-100 p-3 rounded-lg border border-slate-300 space-y-2">
                      <h4 className="text-xs font-black text-red-700 uppercase">आज का विचार</h4>
                      <p className="text-xs font-bold italic text-slate-800">
                        "सत्य को किसी सहारे की आवश्यकता नहीं होती, वह अपने तेज से स्वयं प्रकाशित होता है।"
                      </p>
                      <span className="text-[10px] text-slate-500 block text-right">— स्वामी विवेकानंद</span>
                    </div>

                    <div className="border-t border-slate-300 pt-3">
                      <h4 className="text-xs font-black text-slate-900 mb-1">पाठक मंच</h4>
                      <p className="text-[11px] text-slate-700 leading-relaxed">
                        शहरों में बढ़ते प्रदूषण पर ठोस कार्ययोजना जरूरी है। केवल पराली जलाने पर दोष मढ़ने के बजाय निर्माण धूल और वाहनों से होने वाले धुएं पर सख्त कार्रवाई होनी चाहिए।
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentPage === 4 && (
              /* ======================================================== */
              /* PAGE 4: SPORTS & BUSINESS (खेल एवं व्यापार)             */
              /* ======================================================== */
              <div className="p-4 sm:p-6 space-y-5 bg-[#faf9f6]">
                <div className="border-b-2 border-emerald-700 pb-2 flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-black text-emerald-800">
                    खेल एवं कारोबार • बिजनेस व स्पोर्ट्स डेस्क
                  </h2>
                  <span className="text-xs font-bold text-slate-600">पेज 4 • अंतिम पृष्ठ</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2 border border-slate-200 p-4 rounded-xl bg-white">
                    <span className="text-[10px] font-black text-white bg-blue-600 px-2 py-0.5 rounded">
                      क्रिकेट
                    </span>
                    <h3 className="text-base font-black text-slate-950">
                      Champions Trophy: रोहित शर्मा की कप्तानी में 15 सदस्यीय टीम का एलान
                    </h3>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      बीसीसीआई चयन समिति ने आगामी आईसीसी चैंपियंस ट्रॉफी के लिए भारतीय दल की घोषणा कर दी है। युवा ऑलराउंडरों को मौका दिया गया है, जबकि जसप्रीत बुमराह गेंदबाजी आक्रमण की अगुवाई करेंगे।
                    </p>
                  </div>

                  <div className="space-y-2 border border-slate-200 p-4 rounded-xl bg-white">
                    <span className="text-[10px] font-black text-white bg-emerald-700 px-2 py-0.5 rounded">
                      बाजार विश्लेषण
                    </span>
                    <h3 className="text-base font-black text-slate-950">
                      सोने और चांदी के भाव में रिकॉर्ड गिरावट, खरीदारों में उत्साह
                    </h3>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      वैश्विक बाजार में डॉलर की मजबूती के चलते बुलियन बाजार में सोने की कीमतों में 800 रुपये प्रति 10 ग्राम की नरमी देखी गई। चांदी 90,000 रुपये प्रति किलो के स्तर पर कारोबार कर रही है।
                    </p>
                  </div>
                </div>

                <div className="border-t-2 border-slate-900 pt-3 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>मुद्रा विनिमय: USD/INR: ₹83.95</span>
                  <span>क्रूड ऑयल: $74.20/बैरल</span>
                  <span>निफ्टी: 25,850 (+145)</span>
                </div>
              </div>
            )}

            {/* Bottom Right "फुल स्क्रीन पढ़ें" overlay badge */}
            <div className="p-3 bg-[#f1efe9] border-t border-slate-300 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-bold">
                स्वर मीडिया ई-अखबार • सर्वाधिकार सुरक्षित © 2026
              </span>
              <button
                onClick={toggleFullscreen}
                className="flex items-center gap-1 px-3 py-1 bg-black/80 hover:bg-black text-white text-[10px] font-bold rounded-full shadow transition-all"
              >
                <Search className="w-3 h-3" />
                <span>फुल स्क्रीन पढ़ें</span>
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM PAGINATION BAR */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="flex items-center gap-1 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-40 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl shadow-xs hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> पिछला पेज
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => goToPage(p)}
                className={`w-9 h-9 rounded-xl font-bold text-xs transition-all ${
                  currentPage === p
                    ? "bg-red-600 text-white shadow-md shadow-red-600/30 scale-105"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/20 transition-colors"
          >
            अगला पेज <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
