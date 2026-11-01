const ActivityLog = require("../models/ActivityLog");

async function logActivity(req, action, moduleName, details = "") {
  try {
    const user = req.user;
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || "";

    await ActivityLog.create({
      user: user ? user._id : null,
      userName: user ? user.name : "Anonymous",
      userRole: user ? user.role : "guest",
      action,
      module: moduleName,
      details,
      ipAddress,
    });
  } catch (err) {
    console.error("[ActivityLog] Failed to record log:", err.message);
  }
}

module.exports = { logActivity };
