const Video = require("../models/Video");
const { logActivity } = require("../utils/activity");

// GET /api/videos
exports.getVideos = async (req, res) => {
  try {
    const { category, limit = 12 } = req.query;
    const filter = {};
    if (category) filter.category = category;

    const videos = await Video.find(filter)
      .populate("category", "name nameHi slug")
      .sort("-createdAt")
      .limit(Number(limit))
      .lean();

    return res.json({ success: true, videos });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/videos
exports.createVideo = async (req, res) => {
  try {
    const { title, titleHi, videoUrl, thumbnail, category, duration, isFeatured, socialLinks } = req.body;
    if (!title || !videoUrl) {
      return res.status(400).json({ success: false, message: "Title and video URL are required." });
    }

    const video = new Video({
      title,
      titleHi: titleHi || title,
      videoUrl,
      thumbnail: thumbnail || "",
      category: category || null,
      duration: duration || "02:30",
      isFeatured: Boolean(isFeatured),
      socialLinks: socialLinks || {},
    });

    await video.save();
    await logActivity(req, "CREATE_VIDEO", "video", `Created video: "${title}"`);

    return res.status(201).json({ success: true, video, message: "Video added successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/videos/:id
exports.updateVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: "Video not found" });
    }

    const { title, titleHi, videoUrl, thumbnail, category, duration, isFeatured, socialLinks } = req.body;
    if (title !== undefined) video.title = title;
    if (titleHi !== undefined) video.titleHi = titleHi;
    if (videoUrl !== undefined) video.videoUrl = videoUrl;
    if (thumbnail !== undefined) video.thumbnail = thumbnail;
    if (category !== undefined) video.category = category || null;
    if (duration !== undefined) video.duration = duration;
    if (isFeatured !== undefined) video.isFeatured = Boolean(isFeatured);
    if (socialLinks !== undefined) video.socialLinks = socialLinks;

    await video.save();
    await logActivity(req, "UPDATE_VIDEO", "video", `Updated video: "${video.title}"`);

    return res.json({ success: true, video, message: "Video updated successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/videos/:id
exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) {
      return res.status(404).json({ success: false, message: "Video not found" });
    }

    await logActivity(req, "DELETE_VIDEO", "video", `Deleted video: "${video.title}"`);
    return res.json({ success: true, message: "Video deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
