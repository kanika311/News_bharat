const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      default: "",
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    language: {
      type: String,
      enum: ["hi", "en"],
      default: "hi",
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      default: "",
      trim: true,
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    featuredImage: {
      url: {
        type: String,
        default: "",
      },
      caption: {
        type: String,
        default: "",
      },
      alt: {
        type: String,
        default: "",
      },
    },
    galleryImages: [
      {
        url: String,
        caption: String,
      },
    ],
    status: {
      type: String,
      enum: ["draft", "pending", "published", "scheduled"],
      default: "draft",
      index: true,
    },
    scheduledAt: {
      type: Date,
      default: null,
    },
    publishedAt: {
      type: Date,
      default: null,
      index: true,
    },
    isBreaking: {
      type: Boolean,
      default: false,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isTrending: {
      type: Boolean,
      default: false,
      index: true,
    },
    isTopStory: {
      type: Boolean,
      default: false,
      index: true,
    },
    viewCount: {
      type: Number,
      default: 0,
      index: true,
    },
    likesCount: {
      type: Number,
      default: 0,
      index: true,
    },
    readingTime: {
      type: Number,
      default: 2, // estimated minutes
    },
    seo: {
      metaTitle: { type: String, default: "" },
      metaDescription: { type: String, default: "" },
      canonicalUrl: { type: String, default: "" },
      keywords: [{ type: String }],
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound indexes
ArticleSchema.index({ status: 1, isDeleted: 1, publishedAt: -1 });
ArticleSchema.index({ category: 1, status: 1, publishedAt: -1 });
ArticleSchema.index({ title: "text", subtitle: "text", content: "text" });

module.exports = mongoose.models.Article || mongoose.model("Article", ArticleSchema);
