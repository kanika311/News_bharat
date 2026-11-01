const Subscriber = require("../models/Subscriber");
const { logActivity } = require("../utils/activity");

// POST /api/subscribers (Public newsletter subscription)
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes("@")) {
      return res.status(400).json({ success: false, message: "Please provide a valid email address." });
    }

    const existing = await Subscriber.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        await existing.save();
      }
      return res.json({ success: true, message: "You are already subscribed to Bharat Varta newsletter!" });
    }

    const sub = new Subscriber({ email: email.toLowerCase() });
    await sub.save();

    return res.status(201).json({ success: true, message: "Thank you for subscribing to daily news bulletins!" });
  } catch (err) {
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
