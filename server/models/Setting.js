const mongoose = require("mongoose");

const SettingSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      default: "Swar Media",
    },
    siteNameHi: {
      type: String,
      default: "स्वर मीडिया",
    },
    tagLine: {
      type: String,
      default: "Voice of Truth & Integrity",
    },
    tagLineHi: {
      type: String,
      default: "सत्य, सुर और सरोकार",
    },
    logo: {
      type: String,
      default: "",
    },
    favicon: {
      type: String,
      default: "",
    },
    contactEmail: {
      type: String,
      default: "contact@swarmedia.in",
    },
    contactPhone: {
      type: String,
      default: "+91 11 2345 6789",
    },
    socialLinks: {
      facebook: { type: String, default: "https://facebook.com/swarmedia" },
      twitter: { type: String, default: "https://x.com/swarmedia" },
      youtube: { type: String, default: "https://youtube.com/swarmedia" },
      instagram: { type: String, default: "https://instagram.com/swarmedia" },
      telegram: { type: String, default: "https://t.me/swarmedia" },
      whatsapp: { type: String, default: "https://whatsapp.com" },
    },
    footerText: {
      type: String,
      default: "© 2026 Swar Media Network. All rights reserved.",
    },
    footerTextHi: {
      type: String,
      default: "© 2026 स्वर मीडिया नेटवर्क। सर्वाधिकार सुरक्षित।",
    },
    analyticsId: {
      type: String,
      default: "",
    },
    seoDefaults: {
      metaTitle: {
        type: String,
        default: "Swar Media | स्वर मीडिया - Hindi & English Latest News",
      },
      metaDescription: {
        type: String,
        default: "Leading bilingual news portal offering breaking news, politics, sports, entertainment and in-depth analysis.",
      },
    },
    leadStoryIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Article",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.models.Setting || mongoose.model("Setting", SettingSchema);
