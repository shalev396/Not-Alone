import express from "express";
import { auth } from "../middleware/auth";
import { checkUserType } from "../middleware/checkUserType";
import {
  getUsers,
  getProfile,
  updateProfile,
  updateUser,
  approveUser,
  denyUser,
  deleteUser,
  getPendingUser,
} from "../controllers/userController";

const router = express.Router();

// Public routes
router.get("/pending/:userId", getPendingUser);

// Protected routes
router.get("/me", auth, getProfile);
router.put("/me", auth, updateProfile);

// Admin routes
router.get("/all", auth, checkUserType(["Admin"]), getUsers);
router.get("/pending", auth, checkUserType(["Admin"]), getUsers);

// Profile access routes
router.get(
  "/:userId",
  auth,
  checkUserType(["Admin", "Municipality", "Organization"]),
  getProfile
);

// User management routes
router.put("/:userId", auth, checkUserType(["Admin"]), updateUser);
router.post("/approve/:userId", auth, checkUserType(["Admin"]), approveUser);
router.post("/deny/:userId", auth, checkUserType(["Admin"]), denyUser);
router.delete("/:userId", auth, checkUserType(["Admin"]), deleteUser);

export default router;
