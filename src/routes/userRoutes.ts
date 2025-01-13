import express from "express";
import {
  loginUser,
  getCurrentUser,
  getAllUsers,
  editUser,
  createUser,
  deleteUser,
  getPendingUser,
  approveUser,
  denyUser,
  updateCurrentUser,
  getPendingUsers,
  getUserById,
} from "../controllers/userController";
import { verifyToken, isAdmin, accessRoles } from "../middleware/auth";
import {
  loginLimiter,
  registrationLimiter,
  pendingCheckLimiter,
  validateLogin,
  validateRegistration,
  validateUserUpdate,
  auditLog,
} from "../middleware/security";

const router = express.Router();

// Public routes
router.post(
  "/login",
  loginLimiter,
  validateLogin,
  auditLog("USER_LOGIN"),
  loginUser
);
router.post(
  "/register",
  registrationLimiter,
  validateRegistration,
  auditLog("USER_CREATE"),
  createUser
);
router.get("/pending/:id", pendingCheckLimiter, getPendingUser);

// Protected routes
router.use(verifyToken);

// User profile routes
router.get("/me", auditLog("USER_ACCESS"), getCurrentUser);
router.put(
  "/me",
  validateUserUpdate,
  auditLog("USER_UPDATE"),
  updateCurrentUser
);

// Admin routes
router.get("/pending", isAdmin, auditLog("ADMIN_ACTION"), getPendingUsers);
router.post("/approve/:id", isAdmin, auditLog("USER_APPROVE"), approveUser);
router.post("/deny/:id", isAdmin, auditLog("USER_DENY"), denyUser);
router.get("/all", isAdmin, auditLog("ADMIN_ACTION"), getAllUsers);

// User management routes (restricted by role)
router.get(
  "/:id",
  accessRoles(["Admin", "Municipality", "Organization"]),
  auditLog("USER_ACCESS"),
  getUserById
);
router.put(
  "/:id",
  accessRoles(["Admin", "Municipality"]),
  validateUserUpdate,
  auditLog("USER_UPDATE"),
  editUser
);
router.delete("/:id", isAdmin, auditLog("USER_DELETE"), deleteUser);

export default router;
