const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Disk storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const isVideo = file.mimetype.startsWith("video/") || /mp4|webm|mov|mkv|avi|m4v/.test(ext);
    const prefix = isVideo ? "vid" : "img";
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${prefix}-${uniqueSuffix}${ext}`);
  },
});

// File filter (images and videos)
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif|svg|mp4|webm|mov|mkv|avi|m4v/;
  const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
  const mime = file.mimetype.toLowerCase();

  if (allowed.test(ext) || mime.startsWith("image/") || mime.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images (JPG, PNG, WEBP, GIF, SVG) and videos (MP4, WEBM, MOV, MKV) are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 150 * 1024 * 1024 }, // 150MB limit for video clips
});

module.exports = upload;
