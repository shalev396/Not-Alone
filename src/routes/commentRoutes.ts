import express from "express";
import { auth } from "../middleware/auth";
import { checkUserType } from "../middleware/checkUserType";
import {
  getAllComments,
  getCommentById,
  createComment,
  toggleLike,
  updateComment,
  deleteComment,
} from "../controllers/commentController";

const router = express.Router();

// Admin only routes
router.get("/", auth, checkUserType(["Admin"]), getAllComments);
router.get("/:commentId", auth, checkUserType(["Admin"]), getCommentById);

// Routes for authenticated users
router.post("/", auth, checkUserType(["Admin", "Soldier", "Municipality", "Organization"]), createComment);
router.post("/:commentId/like", auth, checkUserType(["Admin", "Soldier", "Municipality", "Organization"]), toggleLike);
router.put("/:commentId", auth, checkUserType(["Admin", "Soldier", "Municipality", "Organization"]), updateComment);
router.delete("/:commentId", auth, checkUserType(["Admin", "Soldier", "Municipality", "Organization"]), deleteComment);

export default router;
