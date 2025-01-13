import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { app, server } from "../src/index";

let mongoServer: MongoMemoryServer;

export const setupTestDB = () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoServer.stop();

    // Ensure server is properly closed
    if (server?.listening) {
      await new Promise<void>((resolve) => {
        server?.close(() => resolve());
      });
    }
  });

  beforeEach(async () => {
    if (mongoose.connection.db) {
      const collections = await mongoose.connection.db.collections();
      for (const collection of collections) {
        await collection.deleteMany({});
      }
    }
  });
};
