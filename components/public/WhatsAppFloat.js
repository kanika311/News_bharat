"use client";

import React, { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function WhatsAppFloat() {
  const [config, setConfig] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Fetch public settings for WhatsApp number and configured messages
    apiFetch("/api/settings")
      .then((res) => {
        if (res && res.success && res.settings) {
          const s = res.settings;
          setConfig({
            whatsappNumber: s.whatsappNumber || "+91 98765 43210",
            isWhatsAppEnabled: s.isWhatsAppEnabled !== false,
            defaultMessage:
              s.whatsappDefaultMessage ||
              "नमस्ते द स्वर मीडिया! मुझे समाचार / विज्ञापन / सहयोग के संबंध में संपर्क करना है।",
            useRandomMessages: s.whatsappUseRandomMessages !== false,
            randomMessages:
              Array.isArray(s.whatsappRandomMessages) && s.whatsappRandomMessages.length > 0
                ? s.whatsappRandomMessages
                : [
                    "नमस्ते द स्वर मीडिया! मुझे ताज़ा समाचार या ग्राउंड रिपोर्ट साझा करनी है।",
                    "नमस्ते! द स्वर मीडिया में विज्ञापन एवं सहयोग के संबंध में जानकारी चाहिए।",
                    "नमस्ते द स्वर मीडिया टीम! मुझे एक सुझाव / प्रतिक्रिया साझा करनी है।",
                    "नमस्ते! मैं द स्वर मीडिया डिजिटल पोर्टल से संपर्क कर रहा हूँ।",
                  ],
          });
        }
      })
      .catch(() => {});
  }, []);

  // Show welcome tooltip after 2.5 seconds, auto-hide after 7 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 2500);

    const hideTimer = setTimeout(() => {
      setShowTooltip(false);
    }, 9500);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!config || !config.isWhatsAppEnabled) {
    return null;
  }

  // Format phone number for wa.me
  const cleanNumber = (config.whatsappNumber || "").replace(/[^0-9]/g, "");
  const formattedPhone = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;

  const handleClick = (e) => {
    if (!formattedPhone) return;

    // Pick a message: either random greeting or default message
    let chosenMessage = config.defaultMessage;
    if (config.useRandomMessages && config.randomMessages && config.randomMessages.length > 0) {
      const randomIndex = Math.floor(Math.random() * config.randomMessages.length);
      chosenMessage = config.randomMessages[randomIndex];
    }

    // Optionally include current page title/URL context if available
    if (typeof window !== "undefined") {
      const currentUrl = window.location.href;
      const docTitle = document.title ? document.title.split("|")[0].trim() : "";
      if (docTitle && !currentUrl.endsWith("/") && !currentUrl.includes("/dashboard")) {
        chosenMessage = `${chosenMessage}\n\n(संदर्भ: ${docTitle} - ${currentUrl})`;
      }
    }

    const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(chosenMessage)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="fixed bottom-6 right-5 sm:bottom-7 sm:right-7 z-40 flex flex-col items-end pointer-events-auto select-none"
      aria-label="WhatsApp Support"
    >
      {/* Interactive Tooltip Card */}
      {showTooltip && !dismissed && (
        <div className="relative mb-2.5 max-w-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3 shadow-xl text-slate-800 dark:text-slate-100 text-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDismissed(true);
              setShowTooltip(false);
            }}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-2 pr-4 font-bold text-slate-900 dark:text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>स्वर मीडिया हेल्पलाइन</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
            ताज़ा खबर, सुझाव या विज्ञापन हेतु सीधे व्हाट्सएप पर संपर्क करें।
          </p>
        </div>
      )}

      {/* Floating Circular WhatsApp Button (Matches user screenshot: #25D366, white chat bubble) */}
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        className="group relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 hover:shadow-2xl hover:shadow-emerald-600/50 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-4 focus:ring-emerald-400/40"
        title="WhatsApp पर चैट करें"
      >
        {/* Pulsing glow ring */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-30 group-hover:opacity-60 animate-ping pointer-events-none" />

        {/* WhatsApp Official SVG Icon */}
        <svg
          viewBox="0 0 32 32"
          className="w-7 h-7 sm:w-8 sm:h-8 fill-current relative z-10 transition-transform group-hover:rotate-6"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M16 2a13.9 13.9 0 0 0-12.1 20.8L2 30l7.4-1.9A13.9 13.9 0 1 0 16 2zm0 25.5a11.5 11.5 0 0 1-5.9-1.6l-.4-.3-4.4 1.2 1.2-4.3-.3-.4A11.6 11.6 0 1 1 16 27.5zm6.4-8.6c-.3-.2-2-.1-2.3-1.1-.3-.2-.5-.3-.7.1-.2.3-.8 1.1-1 1.3-.2.2-.4.2-.7.1a9.2 9.2 0 0 1-2.7-1.7 10.2 10.2 0 0 1-1.9-2.3c-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.4.3-.6.1-.2 0-.4 0-.5l-.9-2.2c-.3-.7-.5-.6-.7-.6h-.6c-.2 0-.6.1-.9.4s-1.2 1.2-1.2 2.9c0 1.7 1.3 3.3 1.4 3.5.2.2 2.5 3.8 6 5.3.8.4 1.5.6 2 .8.8.3 1.6.2 2.2.1.7-.1 2-.8 2.3-1.6.3-.8.3-1.5.2-1.6-.1-.2-.3-.3-.6-.5z" />
        </svg>

        {/* Active online badge dot */}
        <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900 shadow-xs" />
      </button>
    </div>
  );
}

