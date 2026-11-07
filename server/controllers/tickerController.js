const Ticker = require("../models/Ticker");
const { logActivity } = require("../utils/activity");

// GET /api/ticker
exports.getTickers = async (req, res) => {
  try {
    const { activeOnly } = req.query;
    const filter = {};
    if (activeOnly === "true") {
      filter.isActive = true;
    }

    const tickers = await Ticker.find(filter).sort("-priority -createdAt").lean();
    res.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=180");
    return res.json({ success: true, tickers });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/ticker
exports.createTicker = async (req, res) => {
  try {
    const { text, textHi, link, priority, isActive, expiresAt } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: "Ticker text is required." });
    }

    const ticker = new Ticker({
      text,
      textHi: textHi || text,
      link: link || "",
      priority: priority !== undefined ? Number(priority) : 1,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    await ticker.save();
    await logActivity(req, "CREATE_TICKER", "ticker", `Created breaking news ticker: "${text}"`);

    return res.status(201).json({ success: true, ticker, message: "Ticker created successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/ticker/:id
exports.updateTicker = async (req, res) => {
  try {
    const ticker = await Ticker.findById(req.params.id);
    if (!ticker) {
      return res.status(404).json({ success: false, message: "Ticker not found" });
    }

    const { text, textHi, link, priority, isActive, expiresAt } = req.body;
    if (text !== undefined) ticker.text = text;
    if (textHi !== undefined) ticker.textHi = textHi;
    if (link !== undefined) ticker.link = link;
    if (priority !== undefined) ticker.priority = Number(priority);
    if (isActive !== undefined) ticker.isActive = Boolean(isActive);
    if (expiresAt !== undefined) ticker.expiresAt = expiresAt ? new Date(expiresAt) : null;

    await ticker.save();
    await logActivity(req, "UPDATE_TICKER", "ticker", `Updated ticker: "${ticker.text}"`);

    return res.json({ success: true, ticker, message: "Ticker updated successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/ticker/:id
exports.deleteTicker = async (req, res) => {
  try {
    const ticker = await Ticker.findByIdAndDelete(req.params.id);
    if (!ticker) {
      return res.status(404).json({ success: false, message: "Ticker not found" });
    }

    await logActivity(req, "DELETE_TICKER", "ticker", `Deleted ticker: "${ticker.text}"`);
    return res.json({ success: true, message: "Ticker deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
