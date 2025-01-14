import { UserModel } from "../src/models/userModel";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const createTestUser = async (override = {}) => {
  const user = await UserModel.create({
    email: "test@example.com",
    password: "Password123",
    firstName: "Test",
    lastName: "User",
    phone: "+1234567890",
    passport: "AB123456",
    type: "Soldier",
    approvalStatus: "approved",
    ...override,
  });
  return user;
};

export const generateTestToken = (userId: string, type = "Soldier") => {
  return jwt.sign(
    { userId, type },
    process.env.JWT_SECRET || "test-secret-key",
    { expiresIn: "1h" }
  );
};
//TODO: fix so this wont be posable type: "Admin",
export const createAdminUser = async () => {
  const admin = await UserModel.create({
    email: "admin@example.com",
    password: "AdminPass123",
    firstName: "Admin",
    lastName: "User",
    phone: "+1987654321",
    passport: "XY987654",
    type: "Admin",
    approvalStatus: "approved",
  });
  return admin;
};

export const validUser = {
  email: "test@example.com",
  password: "Password123",
  firstName: "Test",
  lastName: "User",
  phone: "+1234567890",
  passport: "AB123456",
  type: "Soldier",
};

export const setupTestDB = () => {
  beforeAll(async () => {
    const MONGODB_URI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/not-alone-test";
    await mongoose.connect(MONGODB_URI);
  });

  beforeEach(async () => {
    await Promise.all(
      Object.values(mongoose.connection.collections).map(async (collection) =>
        collection.deleteMany({})
      )
    );
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });
};
