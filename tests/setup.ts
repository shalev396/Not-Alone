import dotenv from "dotenv";

// Load environment variables from .env.test if it exists, otherwise from .env
dotenv.config({ path: ".env.test" });

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.MONGODB_URI_TEST =
  process.env.MONGODB_URI_TEST || "mongodb://localhost:27017/not-alone-test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-key";
process.env.PASSWORD_KEY = process.env.PASSWORD_KEY || "test-password-key";
