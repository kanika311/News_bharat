"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const LangContext = createContext({
  lang: "hi",
  setLang: () => {},
  t: (key) => key,
});

const translations = {
  hi: {
    home: "होम",
    latest: "ताज़ा खबर",
    india: "देश",
    politics: "राजनीति",
    world: "दुनिया",
    sports: "खेल",
    entertainment: "मनोरंजन",
    business: "बिज़नेस",
    technology: "टेक",
    opinion: "विचार",
    videos: "वीडियो",
    photos: "फोटो",
    live: "लाइव",
    breaking: "बड़ी खबर",
    topStories: "प्रमुख खबरें",
    trending: "ट्रेंडिंग",
    mostRead: "सबसे ज्यादा पढ़ी गई",
    readMore: "पूरी खबर पढ़ें",
    subscribe: "सब्सक्राइब करें",
    newsletterTitle: "स्वर मीडिया न्यूज़लेटर",
    newsletterDesc: "देश और दुनिया की बड़ी खबरों का बुलेटिन सीधे अपने इनबॉक्स में पाएं।",
    emailPlaceholder: "अपना ईमेल दर्ज करें...",
    comments: "प्रतिक्रियाएं",
    leaveComment: "अपनी राय दें",
    postComment: "टिप्पणी भेजें",
    relatedArticles: "संबंधित खबरें",
    share: "शेयर करें",
    minuteRead: "मिनट का समय",
    views: "बार देखा गया",
    searchPlaceholder: "खबरें, विषय या व्यक्ति खोजें...",
    liveBlog: "लाइव अपडेट",
    viewAll: "सभी देखें",
  },
  en: {
    home: "Home",
    latest: "Latest News",
    india: "India",
    politics: "Politics",
    world: "World",
    sports: "Sports",
    entertainment: "Entertainment",
    business: "Business",
    technology: "Technology",
    opinion: "Opinion",
    videos: "Videos",
    photos: "Photos",
    live: "LIVE",
    breaking: "BREAKING NEWS",
    topStories: "Top Stories",
    trending: "Trending",
    mostRead: "Most Read",
    readMore: "Read Full Story",
    subscribe: "Subscribe",
    newsletterTitle: "Swar Media Daily Bulletin",
    newsletterDesc: "Get authoritative national, economic and world coverage delivered to your inbox.",
    emailPlaceholder: "Enter your email address...",
    comments: "Reader Comments",
    leaveComment: "Leave a Comment",
    postComment: "Post Comment",
    relatedArticles: "Related Stories",
    share: "Share",
    minuteRead: "min read",
    views: "views",
    searchPlaceholder: "Search stories, topics, reporters...",
    liveBlog: "Live Updates",
    viewAll: "View All",
  },
};

export function LangProvider({ children }) {
  const [lang, setLang] = useState("hi"); // Default Hindi (Aaj Tak style)

  useEffect(() => {
    const saved = localStorage.getItem("bv_lang");
    if (saved === "hi" || saved === "en") {
      setLang(saved);
    }
  }, []);

  const changeLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem("bv_lang", newLang);
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations["hi"]?.[key] || key;
  };

  return (
    <LangContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
