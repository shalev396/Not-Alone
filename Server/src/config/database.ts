import mongoose from "mongoose";
import { getMongoUri } from "./environment";

/**
 * Mongo connect tuned for Lambda (Atlas pool) — same idea as Elytra `connectMongo`.
 * Uses a small pool suited to Lambda; the long-running server shares the same settings.
 */
export async function initDB(): Promise<void> {
  const state = mongoose.connection.readyState;
  if (
    state === mongoose.ConnectionStates.connected ||
    state === mongoose.ConnectionStates.connecting
  ) {
    return;
  }
  const uri = getMongoUri();
  try {
    await mongoose.connect(uri, {
      maxPoolSize: 2,
      minPoolSize: 0,
      maxIdleTimeMS: 60_000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45_000,
    });
    console.log(`Connected to MongoDB (${process.env.NODE_ENV} environment)`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

/** Alias for code that still expects `connectDB`. */
export const connectDB = initDB;
