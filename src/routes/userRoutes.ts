import express from "express";
import {
  loginUser,
  getCurrentUser,
  getAllUsers,
  editUser,
} from "../controllers/authController";
import { createUser, deleteUser } from "../controllers/userController";
import {
  verifyToken,
  isAdmin,
  accessRoles,
  canHandleRequestForm,
} from "../middleware/authMiddleware";

const router = express.Router();

// Public routes
router.post("/login", loginUser);
router.post("/register", createUser);

// Protected routes
router.use(verifyToken);

// User profile routes
router.get("/me", getCurrentUser);
router.get("/", isAdmin, getAllUsers);
router.get(
  "/:id",
  accessRoles(["Admin", "Municipality", "Organization"]),
  getCurrentUser
);

// User management routes (restricted by role)
router.put("/:id", accessRoles(["Admin", "Municipality"]), editUser);
router.delete("/:id", isAdmin, deleteUser);

// Example of using combined role middleware
router.get("/requests/form", canHandleRequestForm, (req, res) => {
  res.json({ message: "Access to request form granted" });
});

export default router;
