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
router.post("/", auth, createComment);
router.post("/:commentId/like", auth, toggleLike);
router.put("/:commentId", auth, updateComment);
router.delete("/:commentId", auth, deleteComment);

export default router;
