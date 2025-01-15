import express from "express";
import { auth } from "../middleware/auth";
import { checkUserType } from "../middleware/checkUserType";
import {
  getMyProfile,
  getProfileByUserId,
  updateMyProfile,
  updateUserProfile,
  updateLastActive,
} from "../controllers/profileController";

const router = express.Router();

// Get and update own profile
router.get("/me", auth, getMyProfile);
router.put("/me", auth, updateMyProfile);

// Get profile by user ID (with visibility checks)
router.get("/:userId", auth, getProfileByUserId);

// Admin only - update any user's profile
router.put("/:userId", auth, checkUserType(["Admin"]), updateUserProfile);

// Update last active timestamp
router.post("/last-active", auth, updateLastActive);

export default router;
