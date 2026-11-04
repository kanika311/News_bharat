const mongoose = require("mongoose");
const dns = require("dns");

// Force IPv4 DNS resolution across Node to prevent IPv6 NAT64 connection resets on Indian ISPs
try {
  if (typeof dns.setDefaultResultOrder === "function") {
    dns.setDefaultResultOrder("ipv4first");
  }
} catch (e) {}

let isConnected = false;
let memServer = null;

async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/bharat_varta";

  try {
    // Attempt standard connection with IPv4 forced & healthy timeouts
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      family: 4, // Crucial: Force IPv4 to prevent connection <monitor> to [64:ff9b::...] closed
      maxPoolSize: 10,
      retryWrites: true,
      retryReads: true,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected to database: ${mongoose.connection.host}`);
    return mongoose.connection;
  } catch (err) {
    console.warn(`[MongoDB] Standard connection to ${mongoUri} failed: ${err.message}`);

    // If in development and external mongo is unavailable, launch MongoDB Memory Server fallback
    if (process.env.NODE_ENV !== "production") {
      try {
        console.log("[MongoDB] Starting embedded MongoDB Memory Server for local dev...");
        const { MongoMemoryServer } = require("mongodb-memory-server");
        memServer = await MongoMemoryServer.create({
          instance: {
            dbName: "bharat_varta",
          },
        });
        const memUri = memServer.getUri();
        await mongoose.connect(memUri, { family: 4 });
        isConnected = true;
        console.log(`[MongoDB] Connected to Embedded Memory Server: ${memUri}`);
        return mongoose.connection;
      } catch (memErr) {
        console.error("[MongoDB] Failed to start MongoDB Memory Server:", memErr.message);
        throw memErr;
      }
    } else {
      throw err;
    }
  }
}

// Auto-reconnect handling
mongoose.connection.on("error", (err) => {
  console.error("[MongoDB] Connection error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("[MongoDB] Disconnected from database.");
  isConnected = false;
});

mongoose.connection.on("reconnected", () => {
  console.log("[MongoDB] Reconnected to database.");
  isConnected = true;
});

module.exports = { connectDB };
