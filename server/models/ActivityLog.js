const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    userName: {
      type: String,
      default: "System",
    },
    userRole: {
      type: String,
      default: "system",
    },
    action: {
      type: String,
      required: true, // e.g. "CREATE_ARTICLE", "UPDATE_CATEGORY", "DELETE_USER"
    },
    module: {
      type: String,
      required: true, // "article", "category", "user", "comment", etc.
    },
    details: {
      type: String,
      default: "",
    },
    ipAddress: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

ActivityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.models.ActivityLog || mongoose.model("ActivityLog", ActivityLogSchema);
