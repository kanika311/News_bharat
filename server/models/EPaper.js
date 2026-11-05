const mongoose = require("mongoose");

const EPaperSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      default: "दैनिक स्वर मीडिया",
    },
    edition: {
      type: String,
      required: true,
      trim: true,
      default: "लखनऊ मुख्य संस्करण",
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    dateStr: {
      type: String,
      default: "",
      index: true,
    },
    pdfUrl: {
      type: String,
      required: true,
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      default: "",
      trim: true,
    },
    pageCount: {
      type: Number,
      default: 4,
    },
    fileSize: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.EPaper || mongoose.model("EPaper", EPaperSchema);
