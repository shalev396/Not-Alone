import express from "express";
import { auth } from "../middleware/auth";
import { createComment } from "../controllers/commentController";
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
  "/:postId",
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

router.post(
  "/:postId/comment",
  auth,
  checkUserType(["Admin", "Soldier", "Municipality", "Organization"]),
  (req, res, next) => {
    req.body.postId = req.params.postId; // Passa o postId para o corpo da requisição
    next();
  },
  createComment
);

export default router;
