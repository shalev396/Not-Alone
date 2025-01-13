import { User } from "../src/models/User";
import jwt from "jsonwebtoken";

export const createTestUser = async (override = {}) => {
  const user = await User.create({
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
  const admin = await User.create({
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
