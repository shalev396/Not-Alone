import express from "express";
import { loginUser } from "../controllers/authController";
import { registerUser } from "../controllers/userController";
import {
  generatePasswordReset,
  verifyPasswordReset,
  updatePassword,
} from "../controllers/verify2FAController";
import { authLimiter } from "../middleware/security";

const router = express.Router();

router.use(authLimiter);

router.post("/login", loginUser);
router.post("/register", registerUser);

// Password Reset Routes
router.post("/verify-2fa/reset-password/generate", generatePasswordReset);
router.post("/verify-2fa/reset-password/verify", verifyPasswordReset);
router.post("/verify-2fa/reset-password/update", updatePassword);

export default router;
