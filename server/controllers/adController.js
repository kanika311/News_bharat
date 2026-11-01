const Ad = require("../models/Ad");
const { logActivity } = require("../utils/activity");

// GET /api/ads/slot/:slot (Public)
exports.getAdBySlot = async (req, res) => {
  try {
    const { slot } = req.params;
    const now = new Date();

    const ad = await Ad.findOne({
      slot,
      isActive: true,
      $or: [{ startDate: { $lte: now }, endDate: { $gte: now } }, { endDate: null }],
    }).sort("-updatedAt");

    if (ad) {
      // Async increment impression
      ad.impressions += 1;
      await ad.save();
    }

    return res.json({ success: true, ad });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/ads/:id/click (Public track click)
exports.trackClick = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (ad) {
      ad.clicks += 1;
      await ad.save();
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/ads (Admin list)
exports.getAdminAds = async (req, res) => {
  try {
    const ads = await Ad.find().sort("-createdAt").lean();
    return res.json({ success: true, ads });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/ads (Admin create)
exports.createAd = async (req, res) => {
  try {
    const { name, slot, type, imageUrl, targetUrl, scriptCode, isActive, startDate, endDate } = req.body;
    if (!name || !slot) {
      return res.status(400).json({ success: false, message: "Name and slot are required." });
    }

    const ad = new Ad({
      name,
      slot,
      type: type || "image",
      imageUrl: imageUrl || "",
      targetUrl: targetUrl || "",
      scriptCode: scriptCode || "",
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
    });

    await ad.save();
    await logActivity(req, "CREATE_AD", "ad", `Created ad banner: "${name}" for slot ${slot}`);

    return res.status(201).json({ success: true, ad, message: "Ad banner created successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/ads/:id
exports.updateAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ success: false, message: "Ad not found" });
    }

    const { name, slot, type, imageUrl, targetUrl, scriptCode, isActive, startDate, endDate } = req.body;
    if (name !== undefined) ad.name = name;
    if (slot !== undefined) ad.slot = slot;
    if (type !== undefined) ad.type = type;
    if (imageUrl !== undefined) ad.imageUrl = imageUrl;
    if (targetUrl !== undefined) ad.targetUrl = targetUrl;
    if (scriptCode !== undefined) ad.scriptCode = scriptCode;
    if (isActive !== undefined) ad.isActive = Boolean(isActive);
    if (startDate !== undefined) ad.startDate = startDate ? new Date(startDate) : new Date();
    if (endDate !== undefined) ad.endDate = endDate ? new Date(endDate) : null;

    await ad.save();
    await logActivity(req, "UPDATE_AD", "ad", `Updated ad: "${ad.name}"`);

    return res.json({ success: true, ad, message: "Ad updated successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/ads/:id
exports.deleteAd = async (req, res) => {
  try {
    const ad = await Ad.findByIdAndDelete(req.params.id);
    if (!ad) {
      return res.status(404).json({ success: false, message: "Ad not found" });
    }

    await logActivity(req, "DELETE_AD", "ad", `Deleted ad: "${ad.name}"`);
    return res.json({ success: true, message: "Ad deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
