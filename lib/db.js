const mongoose = require("mongoose");
const dns = require("dns");

// Force IPv4 DNS resolution across Node to prevent IPv6 NAT64 connection resets on Indian ISPs
try {
  if (typeof dns.setDefaultResultOrder === "function") {
    dns.setDefaultResultOrder("ipv4first");
  }
} catch (e) {}

// Cache connection across serverless / Vercel lambda warm invocations
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

let memServer = null;

async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/bharat_varta";

  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 12000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 12000,
      family: 4, // Crucial: Force IPv4
      maxPoolSize: 10,
      minPoolSize: 1,
      retryWrites: true,
      retryReads: true,
    };

    cached.promise = mongoose.connect(mongoUri, opts).then((m) => {
      console.log(`[MongoDB] Connected to database: ${m.connection.host}`);
      return m.connection;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    cached.conn = null;
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
        cached.conn = mongoose.connection;
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
  if (cached) {
    cached.conn = null;
    cached.promise = null;
  }
});

mongoose.connection.on("reconnected", () => {
  console.log("[MongoDB] Reconnected to database.");
  if (cached) {
    cached.conn = mongoose.connection;
  }
});

module.exports = { connectDB };
