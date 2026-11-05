const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { logActivity } = require("../utils/activity");
const Media = require("../models/Media");

const uploadDir = path.join(process.cwd(), "public", "uploads");

// Helper: Check if Cloudinary is configured
function getCloudinary() {
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    const cloudinary = require("cloudinary").v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    return cloudinary;
  }
  return null;
}

// Upload buffer to Cloudinary
function uploadBufferToCloudinary(cloudinary, buffer, filename, resourceType = "auto") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "the-swar-media",
        public_id: path.parse(filename).name,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

// POST /api/media/upload
exports.uploadMedia = async (req, res) => {
  try {
    const file = req.file || (req.files && req.files[0]);
    if (!file || !file.buffer) {
      return res.status(400).json({ success: false, message: "No media file provided or empty buffer." });
    }

    const origExt = path.extname(file.originalname || "").toLowerCase();
    const isVideo = (file.mimetype || "").startsWith("video/") || /mp4|webm|mov|mkv|avi|m4v/.test(origExt);
    const isPdf = file.mimetype === "application/pdf" || origExt === ".pdf";
    const prefix = isVideo ? "vid" : isPdf ? "pdf" : "img";

    let finalFilename = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}${origExt || ".jpg"}`;
    let finalBuffer = file.buffer;
    let finalMime = file.mimetype || (isVideo ? "video/mp4" : isPdf ? "application/pdf" : "image/jpeg");
    let finalSize = file.size || file.buffer.length;

    // Automatic WebP compression for images (saves ~75% payload)
    if (!isVideo && !isPdf && !(file.mimetype || "").includes("svg")) {
      try {
        finalBuffer = await sharp(file.buffer)
          .rotate()
          .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
          .webp({ quality: 80, effort: 4 })
          .toBuffer();
        finalMime = "image/webp";
        finalSize = finalBuffer.length;
        finalFilename = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
      } catch (sharpErr) {
        console.warn("[MediaController] WebP conversion fallback:", sharpErr.message);
      }
    }

    let finalUrl = "";
    const cloudinary = getCloudinary();

    // 1. Try Cloudinary if configured
    if (cloudinary) {
      try {
        const cldResult = await uploadBufferToCloudinary(
          cloudinary,
          finalBuffer,
          finalFilename,
          isVideo ? "video" : isPdf ? "raw" : "image"
        );
        finalUrl = cldResult.secure_url;
      } catch (cldErr) {
        console.warn("[MediaController] Cloudinary upload failed, using local/database fallback:", cldErr.message);
      }
    }

    // 2. Try writing to local disk (succeeds on VPS/local, fails gracefully on Vercel read-only)
    if (!finalUrl) {
      try {
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const diskPath = path.join(uploadDir, finalFilename);
        fs.writeFileSync(diskPath, finalBuffer);
        finalUrl = `/uploads/${finalFilename}`;
      } catch (diskErr) {
        // Expected in serverless environments (EROFS: read-only file system on Vercel)
        console.warn("[MediaController] Disk write bypassed (read-only filesystem):", diskErr.message);
      }
    }

    // 3. Database Persistence (Guarantees zero file loss and full Vercel compatibility)
    const mediaDoc = await Media.create({
      filename: finalFilename,
      originalName: file.originalname || finalFilename,
      mimetype: finalMime,
      size: finalSize,
      type: isVideo ? "video" : isPdf ? "pdf" : "image",
      url: finalUrl,
      data: finalUrl.startsWith("http") ? undefined : finalBuffer, // Store buffer only if not hosted on CDN
      user: req.user?._id,
    });

    // If local disk write was read-only, serve dynamically through /api/media/file/:id
    if (!finalUrl) {
      finalUrl = `/api/media/file/${mediaDoc._id}/${finalFilename}`;
      mediaDoc.url = finalUrl;
      await mediaDoc.save();
    }

    await logActivity(
      req,
      "UPLOAD_MEDIA",
      "media",
      `Uploaded ${isVideo ? "video" : isPdf ? "pdf" : "image"}: ${finalFilename}`
    );

    return res.status(201).json({
      success: true,
      url: finalUrl,
      filename: finalFilename,
      size: finalSize,
      mimetype: finalMime,
      type: isVideo ? "video" : isPdf ? "pdf" : "image",
      message: `${isVideo ? "Video" : isPdf ? "PDF" : "Image"} uploaded successfully`,
    });
  } catch (err) {
    console.error("[MediaController] Upload error:", err);
    return res.status(500).json({ success: false, message: err.message || "File upload failed" });
  }
};

// GET /api/media/file/:id/:filename? (Public media file streamer for Vercel/MongoDB stored assets)
exports.serveMediaFile = async (req, res) => {
  try {
    const { id } = req.params;
    const media = await Media.findById(id);

    if (!media || !media.data) {
      return res.status(404).send("File not found");
    }

    res.setHeader("Content-Type", media.mimetype || "image/webp");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("Content-Length", media.data.length);
    return res.end(media.data);
  } catch (err) {
    console.error("[MediaController] Serve file error:", err);
    return res.status(500).send("Error loading media file");
  }
};

// GET /api/media (Browse uploaded images & videos for Media Picker Library)
exports.getMediaLibrary = async (req, res) => {
  try {
    const { type } = req.query; // 'video' | 'image' | 'pdf'
    const query = {};
    if (type) query.type = type;

    // 1. Fetch from Database
    const dbMedia = await Media.find(query)
      .select("_id filename originalName mimetype size type url createdAt")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const mediaMap = new Map();
    dbMedia.forEach((item) => {
      mediaMap.set(item.filename, {
        id: item._id,
        filename: item.filename,
        url: item.url || `/api/media/file/${item._id}/${item.filename}`,
        size: item.size,
        type: item.type,
        createdAt: item.createdAt,
      });
    });

    // 2. Fetch from Local Disk if accessible
    try {
      if (fs.existsSync(uploadDir)) {
        const files = fs.readdirSync(uploadDir);
        files.forEach((file) => {
          if (!file.startsWith(".") && !mediaMap.has(file)) {
            const filePath = path.join(uploadDir, file);
            try {
              const stats = fs.statSync(filePath);
              const ext = path.extname(file).toLowerCase();
              const isVideo = /mp4|webm|mov|mkv|avi|m4v/.test(ext);
              const isPdf = ext === ".pdf";
              const itemType = isVideo ? "video" : isPdf ? "pdf" : "image";

              if (!type || type === itemType) {
                mediaMap.set(file, {
                  filename: file,
                  url: `/uploads/${file}`,
                  size: stats.size,
                  type: itemType,
                  createdAt: stats.birthtime || stats.mtime,
                });
              }
            } catch (e) {}
          }
        });
      }
    } catch (e) {}

    const mediaList = Array.from(mediaMap.values()).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return res.json({ success: true, media: mediaList });
  } catch (err) {
    console.error("[MediaController] Library fetch error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/media/:filename
exports.deleteMedia = async (req, res) => {
  try {
    const filename = path.basename(req.params.filename);

    // 1. Remove from MongoDB
    await Media.deleteMany({
      $or: [{ filename }, { _id: filename.match(/^[0-9a-fA-F]{24}$/) ? filename : null }],
    });

    // 2. Remove from Disk if exists
    try {
      const filePath = path.join(uploadDir, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {}

    await logActivity(req, "DELETE_MEDIA", "media", `Deleted media file: ${filename}`);
    return res.json({ success: true, message: "File removed" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
