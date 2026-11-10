const Subscriber = require("../models/Subscriber");
const { logActivity } = require("../utils/activity");

// POST /api/subscribers & POST /api/subscribers/subscribe (Public newsletter subscription)
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "कृपया एक वैध ईमेल पता दर्ज करें (Please provide a valid email address).",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const existing = await Subscriber.findOne({ email: cleanEmail });
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        await existing.save();

        try {
          await logActivity(req, "SUBSCRIBE", "subscriber", `Reactivated newsletter subscription: ${cleanEmail}`);
        } catch (e) {}

        return res.json({
          success: true,
          message: "आपकी सदस्यता पुनः सक्रिय कर दी गई है! (Your subscription has been reactivated!)",
        });
      }

      return res.json({
        success: true,
        message: "आप पहले से ही दैनिक बुलेटिन से जुड़े हैं! (You are already subscribed to Swar Media bulletins!)",
      });
    }

    const sub = new Subscriber({ email: cleanEmail, isActive: true });
    await sub.save();

    // Log activity so subscriber immediately appears in Admin Activity Logs & dashboard
    try {
      await logActivity(req, "SUBSCRIBE", "subscriber", `New newsletter subscriber: ${cleanEmail}`);
    } catch (e) {}

    return res.status(201).json({
      success: true,
      message: "दैनिक बुलेटिन की सदस्यता लेने के लिए धन्यवाद! (Thank you for subscribing to daily news bulletins!)",
    });
  } catch (err) {
    console.error("[Subscriber Error]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/subscribers (Admin list)
exports.getSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort("-createdAt").lean();
    return res.json({ success: true, subscribers, total: subscribers.length });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/subscribers/export-csv
exports.exportSubscribersCSV = async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort("-createdAt").lean();

    let csv = "ID,Email,SubscribedAt,Status\r\n";
    subscribers.forEach((s) => {
      csv += `"${s._id}","${s.email}","${new Date(s.createdAt).toISOString()}","${s.isActive ? "Active" : "Inactive"}"\r\n`;
    });

    res.header("Content-Type", "text/csv");
    res.attachment(`subscribers-${Date.now()}.csv`);
    return res.send(csv);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/subscribers/:id
exports.deleteSubscriber = async (req, res) => {
  try {
    await Subscriber.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Subscriber removed" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
