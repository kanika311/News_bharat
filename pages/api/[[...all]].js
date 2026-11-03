const { connectDB } = require("../../lib/db");
const app = require("../../server/app");

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

let seedPromise = null;

async function ensureSeeded() {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    const User = require("../../server/models/User");
    const count = await User.countDocuments();
    if (count === 0) {
      const { seed } = require("../../server/scripts/seed");
      await seed(false);
    }
  })().catch((err) => {
    seedPromise = null;
    console.error("Auto-seed failed:", err);
  });
  return seedPromise;
}

function ensureApiUrl(req) {
  if (!req.url) {
    req.url = "/api";
    return;
  }
  const [pathname, query] = req.url.split("?");
  if (pathname === "/api" || pathname.startsWith("/api/")) return;
  const nextPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  req.url = `/api${nextPath}${query ? `?${query}` : ""}`;
}

export default async function handler(req, res) {
  try {
    await connectDB();
    if (process.env.VERCEL) {
      await ensureSeeded();
    }
    ensureApiUrl(req);
    return app(req, res);
  } catch (error) {
    console.error("API handler error:", error);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Database connection failed",
        error: error.message,
      });
    }
  }
}
