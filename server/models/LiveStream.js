const mongoose = require("mongoose");

const LiveStreamSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "Swar Media Live: Special Field Coverage & Breaking News",
    },
    titleHi: {
      type: String,
      default: "स्वर मीडिया लाइव: विशेष ग्राउंड रिपोर्टिंग एवं ब्रेकिंग बुलेटिन",
    },
    reporterName: {
      type: String,
      default: "राजेश शर्मा (विशेष संवाददाता)",
    },
    reporterLocation: {
      type: String,
      default: "संसद भवन, नई दिल्ली",
    },
    streamType: {
      type: String,
      enum: ["camera", "url"],
      default: "camera",
    },
    streamUrl: {
      type: String,
      default: "https://www.youtube.com/watch?v=live_stream",
    },
    cameraVideoUrl: {
      type: String,
      default: "",
    },
    isLive: {
      type: Boolean,
      default: true,
    },
    viewers: {
      type: Number,
      default: 1420,
    },
    breakingHeadline: {
      type: String,
      default: "बड़ी खबर: स्वर मीडिया ग्राउंड रिपोर्टर सीधे ग्राउंड जीरो से लाइव",
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.LiveStream || mongoose.model("LiveStream", LiveStreamSchema);
