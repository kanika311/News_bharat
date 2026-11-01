const mongoose = require("mongoose");

const LiveBlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    titleHi: {
      type: String,
      default: "",
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["live", "ended"],
      default: "live",
      index: true,
    },
    coverImage: {
      type: String,
      default: "",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    entries: [
      {
        title: { type: String, required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        authorName: { type: String, default: "Bharat Varta Desk" },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.models.LiveBlog || mongoose.model("LiveBlog", LiveBlogSchema);
