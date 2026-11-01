const fs = require("fs");
const path = require("path");
const { logActivity } = require("../utils/activity");

const uploadDir = path.join(process.cwd(), "public", "uploads");

// POST /api/media/upload
exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file provided." });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    await logActivity(req, "UPLOAD_MEDIA", "media", `Uploaded media file: ${req.file.filename}`);

    return res.status(201).json({
      success: true,
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      message: "Image uploaded successfully",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/media (Browse uploaded images)
exports.getMediaLibrary = async (req, res) => {
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const files = fs.readdirSync(uploadDir);
    const mediaList = files
      .filter((file) => !file.startsWith("."))
      .map((file) => {
        const filePath = path.join(uploadDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          url: `/uploads/${file}`,
          size: stats.size,
          createdAt: stats.birthtime || stats.mtime,
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({ success: true, media: mediaList });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/media/:filename
exports.deleteMedia = async (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(uploadDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      await logActivity(req, "DELETE_MEDIA", "media", `Deleted media file: ${filename}`);
      return res.json({ success: true, message: "File removed" });
    }

    return res.status(404).json({ success: false, message: "File not found" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
