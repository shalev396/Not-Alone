import express from "express";
import { auth } from "../middleware/auth";
import { checkUserType } from "../middleware/checkUserType";
import {
  createPost,
  getAllPosts,
  getPostById,
  getPostsByUserId,
  toggleLike,
  updatePost,
  deletePost,
} from "../controllers/postController";

const router = express.Router();

// All routes require authentication
router.post(
  "/",
  auth,
  checkUserType(["Admin", "Soldier", "Municipality", "Organization"]),
  createPost
);

router.get(
  "/",
  auth,
  checkUserType(["Admin", "Soldier", "Municipality", "Organization"]),
  getAllPosts
);

router.get(
  "/:postId",
  auth,
  checkUserType(["Admin", "Soldier", "Municipality", "Organization"]),
  getPostById
);

router.get(
  "/user/:userId",
  auth,
  checkUserType(["Admin", "Soldier", "Municipality", "Organization"]),
  getPostsByUserId
);

router.post(
  "/:postId/like",
  auth,
  checkUserType(["Admin", "Soldier", "Municipality", "Organization"]),
  toggleLike
);

router.put(
  "/me",
  auth,
  checkUserType(["Admin", "Soldier", "Municipality", "Organization"]),
  updatePost
);

router.delete(
  "/:postId",
  auth,
  checkUserType(["Admin", "Soldier", "Municipality", "Organization"]),
  deletePost
);

export default router;
