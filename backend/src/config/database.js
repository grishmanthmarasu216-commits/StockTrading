import mongoose from "mongoose";
import { ENV } from "./env.js";

let isConnected = false;

export async function connectDatabase(uri = ENV.MONGODB_URI) {
  if (isConnected) {
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });

    isConnected = true;
    console.log(`[Database] MongoDB connected successfully to: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on("error", (err) => {
      console.error("[Database] Mongoose connection error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("[Database] Mongoose disconnected from MongoDB");
      isConnected = false;
    });

    return conn.connection;
  } catch (error) {
    console.error("[Database] Initial MongoDB connection failed:", error.message);
    throw error;
  }
}

export async function disconnectDatabase() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log("[Database] Disconnected from MongoDB");
  }
}
