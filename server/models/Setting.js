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
    adminName: {
      type: String,
      default: "Rajesh Sharma (प्रधान संपादक)",
    },
    contactEmail: {
      type: String,
      default: "contact@swarmedia.in",
    },
    contactPhone: {
      type: String,
      default: "+91 11 2345 6789",
    },
    whatsappNumber: {
      type: String,
      default: "+91 98765 43210",
    },
    isWhatsAppEnabled: {
      type: Boolean,
      default: true,
    },
    whatsappDefaultMessage: {
      type: String,
      default: "नमस्ते स्वर मीडिया! मुझे समाचार / सुझाव / सहयोग के संबंध में संपर्क करना है।",
    },
    whatsappUseRandomMessages: {
      type: Boolean,
      default: true,
    },
    whatsappRandomMessages: {
      type: [String],
      default: [
        "नमस्ते स्वर मीडिया! मुझे ताज़ा समाचार या ग्राउंड रिपोर्ट साझा करनी है।",
        "नमस्ते! स्वर मीडिया में विज्ञापन एवं सहयोग के संबंध में जानकारी चाहिए।",
        "नमस्ते स्वर मीडिया टीम! मुझे एक सुझाव / प्रतिक्रिया साझा करनी है।",
        "नमस्ते! मैं स्वर मीडिया डिजिटल पोर्टल से संपर्क कर रहा हूँ।",
      ],
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
