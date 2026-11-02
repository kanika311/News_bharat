const fs = require("fs");
const path = require("path");
const { logActivity } = require("../utils/activity");

const uploadDir = path.join(process.cwd(), "public", "uploads");

const sharp = require("sharp");

// POST /api/media/upload
exports.uploadMedia = async (req, res) => {
  try {
    const file = req.file || (req.files && req.files[0]);
    if (!file) {
      return res.status(400).json({ success: false, message: "No media file provided." });
    }

    const ext = path.extname(file.filename).toLowerCase();
    const isVideo = file.mimetype.startsWith("video/") || /mp4|webm|mov|mkv|avi|m4v/.test(ext);

    let finalFilename = file.filename;
    let finalSize = file.size;
    let finalMime = file.mimetype;

    // Automatic WebP compression for photos/images
    if (!isVideo && !file.mimetype.includes("svg")) {
      try {
        const originalPath = path.join(uploadDir, file.filename);
        const nameWithoutExt = path.parse(file.filename).name;
        const webpFilename = `${nameWithoutExt}.webp`;
        const webpPath = path.join(uploadDir, webpFilename);

        // Convert to WebP with 80% quality compression (saves ~70-80% file size)
        await sharp(originalPath)
          .rotate()
          .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
          .webp({ quality: 80, effort: 4 })
          .toFile(webpPath);

        const webpStats = fs.statSync(webpPath);
        finalSize = webpStats.size;
        finalFilename = webpFilename;
        finalMime = "image/webp";

        // Remove original non-webp file
        if (originalPath !== webpPath && fs.existsSync(originalPath)) {
          fs.unlinkSync(originalPath);
        }
      } catch (sharpErr) {
        console.error("WebP compression error, using original:", sharpErr);
      }
    }

    const fileUrl = `/uploads/${finalFilename}`;
    await logActivity(req, "UPLOAD_MEDIA", "media", `Uploaded ${isVideo ? "video" : "compressed webp image"}: ${finalFilename}`);

    return res.status(201).json({
      success: true,
      url: fileUrl,
      filename: finalFilename,
      size: finalSize,
      mimetype: finalMime,
      type: isVideo ? "video" : "image",
      message: `${isVideo ? "Video" : "WebP compressed image"} uploaded successfully`,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/media (Browse uploaded images & videos)
exports.getMediaLibrary = async (req, res) => {
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const { type } = req.query; // optional filter: 'video' | 'image'
    const files = fs.readdirSync(uploadDir);
    const mediaList = files
      .filter((file) => !file.startsWith("."))
      .map((file) => {
        const filePath = path.join(uploadDir, file);
        const stats = fs.statSync(filePath);
        const ext = path.extname(file).toLowerCase();
        const isVideo = /mp4|webm|mov|mkv|avi|m4v/.test(ext);
        return {
          filename: file,
          url: `/uploads/${file}`,
          size: stats.size,
          type: isVideo ? "video" : "image",
          createdAt: stats.birthtime || stats.mtime,
        };
      })
      .filter((item) => {
        if (type === "video") return item.type === "video";
        if (type === "image") return item.type === "image";
        return true;
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
