const mongoose = require("mongoose");

const SettingSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      default: "Bharat Varta",
    },
    siteNameHi: {
      type: String,
      default: "भारत वार्ता",
    },
    tagLine: {
      type: String,
      default: "Truth, Courage & Integrity",
    },
    tagLineHi: {
      type: String,
      default: "सत्य, साहस और सरोकार",
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
      default: "contact@bharatvarta.in",
    },
    contactPhone: {
      type: String,
      default: "+91 11 2345 6789",
    },
    socialLinks: {
      facebook: { type: String, default: "https://facebook.com" },
      twitter: { type: String, default: "https://x.com" },
      youtube: { type: String, default: "https://youtube.com" },
      instagram: { type: String, default: "https://instagram.com" },
      telegram: { type: String, default: "https://telegram.org" },
      whatsapp: { type: String, default: "https://whatsapp.com" },
    },
    footerText: {
      type: String,
      default: "© 2026 Bharat Varta Media Network. All rights reserved.",
    },
    footerTextHi: {
      type: String,
      default: "© 2026 भारत वार्ता मीडिया नेटवर्क। सर्वाधिकार सुरक्षित।",
    },
    analyticsId: {
      type: String,
      default: "",
    },
    seoDefaults: {
      metaTitle: {
        type: String,
        default: "Bharat Varta | भारत वार्ता - Hindi & English Latest News",
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
