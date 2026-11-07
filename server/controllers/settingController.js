const Setting = require("../models/Setting");
const { logActivity } = require("../utils/activity");

// Helper to get or create site settings document
async function getOrCreateSettings() {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = await Setting.create({
      siteName: "The Swar Media",
      siteNameHi: "द स्वर मीडिया",
      tagLine: "हर मुद्दे पर, युवा की आवाज",
      tagLineHi: "हर मुद्दे पर, युवा की आवाज",
      logo: "/logo.png",
      favicon: "/logo.png",
    });
  }
  return settings;
}

// GET /api/settings (Public / Admin)
exports.getSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.set("Cache-Control", "public, s-maxage=120, stale-while-revalidate=300");
    return res.json({ success: true, settings });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/settings (Admin update)
exports.updateSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    const updateData = req.body;

    Object.keys(updateData).forEach((key) => {
      settings[key] = updateData[key];
    });

    await settings.save();
    await logActivity(req, "UPDATE_SETTINGS", "settings", "Updated site settings");

    return res.json({ success: true, settings, message: "Site settings updated successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/settings/homepage-layout (Homepage Manager lead stories)
exports.updateHomepageLayout = async (req, res) => {
  try {
    const { leadStoryIds } = req.body;
    const settings = await getOrCreateSettings();

    if (Array.isArray(leadStoryIds)) {
      settings.leadStoryIds = leadStoryIds;
      await settings.save();
    }

    await logActivity(req, "UPDATE_HOMEPAGE_LAYOUT", "settings", "Updated homepage story layout and order");
    return res.json({ success: true, settings, message: "Homepage stories reordered successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
