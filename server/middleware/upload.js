const multer = require("multer");
const path = require("path");

// Memory storage engine: completely safe for Vercel, Serverless, and local environments
// Eliminates EROFS (read-only filesystem) crashes
const storage = multer.memoryStorage();

// File filter (images, videos, and PDF documents)
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif|svg|mp4|webm|mov|mkv|avi|m4v|pdf/;
  const ext = path.extname(file.originalname || "").toLowerCase().replace(".", "");
  const mime = (file.mimetype || "").toLowerCase();

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
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max limit
});

module.exports = upload;
