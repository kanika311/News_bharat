const mongoose = require("mongoose");

const TickerSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    textHi: {
      type: String,
      default: "",
      trim: true,
    },
    link: {
      type: String,
      default: "",
    },
    priority: {
      type: Number,
      default: 1, // higher shows first
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

TickerSchema.index({ isActive: 1, priority: -1 });

module.exports = mongoose.models.Ticker || mongoose.model("Ticker", TickerSchema);
