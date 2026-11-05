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
    const isPdf = file.mimetype === "application/pdf" || ext === ".pdf";
    const prefix = isVideo ? "vid" : isPdf ? "pdf" : "img";
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${prefix}-${uniqueSuffix}${ext}`);
  },
});

// File filter (images, videos, and PDF documents)
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif|svg|mp4|webm|mov|mkv|avi|m4v|pdf/;
  const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
  const mime = file.mimetype.toLowerCase();

  if (
    allowed.test(ext) ||
    mime.startsWith("image/") ||
    mime.startsWith("video/") ||
    mime === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only images, videos, and PDF documents are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 150 * 1024 * 1024 }, // 150MB limit for video clips
});

module.exports = upload;
