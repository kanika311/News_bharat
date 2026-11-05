const mongoose = require("mongoose");

const MediaSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
      index: true,
    },
    originalName: {
      type: String,
      default: "",
    },
    mimetype: {
      type: String,
      default: "image/webp",
    },
    size: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      enum: ["image", "video", "pdf"],
      default: "image",
    },
    url: {
      type: String,
      default: "",
    },
    data: {
      type: Buffer,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Media || mongoose.model("Media", MediaSchema);
