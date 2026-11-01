const mongoose = require("mongoose");

const AdSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slot: {
      type: String,
      enum: ["header", "sidebar", "in_article", "footer", "popup"],
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["image", "script"],
      default: "image",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    targetUrl: {
      type: String,
      default: "",
    },
    scriptCode: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    impressions: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Ad || mongoose.model("Ad", AdSchema);
