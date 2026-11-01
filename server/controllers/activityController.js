const ActivityLog = require("../models/ActivityLog");

// GET /api/activity
exports.getActivityLogs = async (req, res) => {
  try {
    const { module: mod, page = 1, limit = 30 } = req.query;
    const filter = {};
    if (mod) filter.module = mod;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 30;
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .populate("user", "name email role avatar")
        .sort("-createdAt")
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ActivityLog.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      logs,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      page: pageNum,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
