const express = require("express");
const next = require("next");
const dotenv = require("dotenv");
const http = require("http");
const dns = require("dns");

// Force IPv4 DNS resolution across Node to prevent IPv6 NAT64 connection drops
try {
  if (typeof dns.setDefaultResultOrder === "function") {
    dns.setDefaultResultOrder("ipv4first");
  }
} catch (e) {}

// Load environment variables
dotenv.config();

const { connectDB } = require("./lib/db");
const serverApp = require("./server/app");
const { initCronJobs } = require("./server/cron");
const User = require("./server/models/User");
const { seed } = require("./server/scripts/seed");

let port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

async function startServer() {
  try {
    // 1. Connect to Database (with automatic fallback to embedded in-memory MongoDB)
    await connectDB();

    // Check if initial seed is needed
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("[Auto-Seed] Empty database detected. Populating sample news portal data...");
      await seed(false);
    }

    // 2. Prepare Next.js
    console.log("[Next.js] Preparing Next.js application...");
    await nextApp.prepare();
    console.log("[Next.js] Next.js ready.");

    // 3. Initialize background schedulers (cron for auto-publishing scheduled articles)
    initCronJobs();

    // 4. Create root master server
    const masterApp = express();

    // Mount Express REST APIs and uploads
    masterApp.use(serverApp);

    // Pass all non-API routes to Next.js App Router
    masterApp.all("*", (req, res) => {
      const { parse } = require("url");
      const parsedUrl = parse(req.url, true);
      return handle(req, res, parsedUrl);
    });

    const server = http.createServer(masterApp);

    const listenOnPort = (p) => {
      server.listen(p, () => {
        console.log(`> Swar Media News Server ready on http://localhost:${p}`);
        console.log(`> Editorial CMS available at: http://localhost:${p}/swar-media-admin`);
        console.log(`> REST APIs mounted at: http://localhost:${p}/api/*`);
      });
    };

    server.on("error", (e) => {
      if (e.code === "EADDRINUSE") {
        console.warn(`[Port Conflict] Port ${port} is occupied. Attempting port ${port + 1}...`);
        port += 1;
        listenOnPort(port);
      } else {
        console.error("Fatal server error:", e);
        process.exit(1);
      }
    });

    listenOnPort(port);
  } catch (err) {
    console.error("Fatal error starting server:", err);
    process.exit(1);
  }
}

startServer();
