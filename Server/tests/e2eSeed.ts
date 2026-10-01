import mongoose from "mongoose";
import { UserModel } from "../src/models/userModel";

// Seeds the database the frontend E2E suite (client/test) runs against:
// the admin that test_login_success signs in with, and no leftover user
// from a previous test_successful_signup run.
const E2E_ADMIN = {
  firstName: "E2E",
  lastName: "Admin",
  email: "shalev396@admin.com",
  password: "12345678a",
  passport: "E2E000001",
  phone: "+972500000001",
  type: "Admin",
  approvalStatus: "approved",
  is2FAEnabled: true,
};

const E2E_SIGNUP = {
  email: "john.doe@example.com",
  passport: "AB123456",
  phone: "+1234567890",
};

const seed = async () => {
  // Always the test database (never DATABASE_URL, which is prod in a local .env)
  const uri = process.env.DATABASE_URL_TEST;
  if (!uri) throw new Error("DATABASE_URL_TEST is required");
  await mongoose.connect(uri);
  try {
    await UserModel.deleteMany({
      $or: [
        { email: E2E_ADMIN.email },
        { passport: E2E_ADMIN.passport },
        { phone: E2E_ADMIN.phone },
        { email: E2E_SIGNUP.email },
        { passport: E2E_SIGNUP.passport },
        { phone: E2E_SIGNUP.phone },
      ],
    });
    await UserModel.create(E2E_ADMIN);
    console.log("E2E seed done: admin created, signup user cleared");
  } finally {
    await mongoose.connection.close();
  }
};

seed().catch((error) => {
  console.error("E2E seed failed:", error);
  process.exit(1);
});
