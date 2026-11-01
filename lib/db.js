const mongoose = require("mongoose");

let isConnected = false;
let memServer = null;

async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/bharat_varta";

  try {
    // Attempt standard connection with 3s timeout
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
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
        await mongoose.connect(memUri);
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

module.exports = { connectDB };
