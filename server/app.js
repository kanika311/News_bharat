const express = require("express");
const compression = require("compression");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const path = require("path");

// Route imports
const authRoutes = require("./routes/authRoutes");
const articleRoutes = require("./routes/articleRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const tagRoutes = require("./routes/tagRoutes");
const tickerRoutes = require("./routes/tickerRoutes");
const videoRoutes = require("./routes/videoRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const liveBlogRoutes = require("./routes/liveBlogRoutes");
const liveStreamRoutes = require("./routes/liveStreamRoutes");
const commentRoutes = require("./routes/commentRoutes");
const adRoutes = require("./routes/adRoutes");
const userRoutes = require("./routes/userRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
const pageRoutes = require("./routes/pageRoutes");
const subscriberRoutes = require("./routes/subscriberRoutes");
const settingRoutes = require("./routes/settingRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const activityRoutes = require("./routes/activityRoutes");
const epaperRoutes = require("./routes/epaperRoutes");

const app = express();
app.set("trust proxy", 1);

// Enable gzip/deflate compression across all API responses for fast load times
app.use(compression());

// Scope CORS, cookies and body parsing strictly to /api routes so Next.js static assets & CSS remain completely untouched
const apiCors = cors({
  origin: true,
  credentials: true,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { ip: false, xForwardedForHeader: false },
  keyGenerator: (req) => {
    const forwarded = req.headers ? (req.headers["x-forwarded-for"] || req.headers["x-real-ip"]) : null;
    if (forwarded) return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(",")[0].trim();
    return (req.socket && req.socket.remoteAddress) || "127.0.0.1";
  },
  message: { success: false, message: "Too many requests. Please try again later." },
});

app.use("/api", apiCors);
app.use("/api", cookieParser());
app.use("/api", express.json({ limit: "20mb" }));
app.use("/api", express.urlencoded({ extended: true, limit: "20mb" }));
app.use("/api", apiLimiter);

// Serve uploads folder statically
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

// Register all API routes
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/ticker", tickerRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/galleries", galleryRoutes);
app.use("/api/live-blogs", liveBlogRoutes);
app.use("/api/live-stream", liveStreamRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/ads", adRoutes);
app.use("/api/users", userRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/pages", pageRoutes);
app.use("/api/subscribers", subscriberRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/epaper", epaperRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "Swar Media News API",
    time: new Date().toISOString(),
  });
});

app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl || req.url}`,
  });
});

// Global API error handler (Guarantees JSON error response instead of Express HTML 500 pages)
app.use((err, req, res, next) => {
  console.error("[API Global Error]", err);
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || err.statusCode || 500;
  return res.status(status).json({
    success: false,
    message: err.message || "An unexpected internal server error occurred.",
  });
});

module.exports = app;
