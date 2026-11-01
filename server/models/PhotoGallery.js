const mongoose = require("mongoose");

const PhotoGallerySchema = new mongoose.Schema(
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
    description: {
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      required: true,
    },
    photos: [
      {
        url: { type: String, required: true },
        caption: { type: String, default: "" },
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.PhotoGallery || mongoose.model("PhotoGallery", PhotoGallerySchema);
