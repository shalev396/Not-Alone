// routes/verify2FA.ts
import express from "express";
import {
  twoFARequestLimiter,
  twoFAVerifyLimiter,
  validate2FAVerification,
} from "../middleware/security";
import { verify2FA, generate2FA } from "../controllers/verify2FAController";
import { body } from "express-validator";

const router = express.Router();

// Validation for generate 2FA request
const validateGenerate2FA = [
  body("userId").isMongoId().withMessage("Invalid user ID"),
  body("userEmail").isEmail().withMessage("Invalid email"),
  body("userName").trim().notEmpty().withMessage("Username is required"),
];

// Route for requesting a new 2FA code
router.post("/generate", twoFARequestLimiter, validateGenerate2FA, generate2FA);

// Route for verifying 2FA codes
router.post("/verify", twoFAVerifyLimiter, validate2FAVerification, verify2FA);

export default router;
