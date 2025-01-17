import { Request, Response } from "express";
import mongoose from "mongoose";
import { PostModel } from "../models/postModel";

interface UserInfo {
  userId: string;
  type: string;
}

const ensureUser = (req: Request, res: Response): UserInfo | undefined => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return undefined;
  }
  return { userId: req.user.userId, type: req.user.type };
};

// Create post
export const createPost = async (req: Request, res: Response) => {
  try {
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    const authorId = new mongoose.Types.ObjectId(userInfo.userId);

    // Use aggregation pipeline for atomic creation and population
    const [newPost] = await PostModel.create([
      {
        ...req.body,
        authorId,
        likes: [],
      },
    ]);

    const [populatedPost] = await PostModel.aggregate([
      { $match: { _id: newPost._id } },
      {
        $lookup: {
          from: "users",
          localField: "authorId",
          foreignField: "_id",
          pipeline: [{ $project: { password: 0 } }],
          as: "author",
        },
      },
      { $unwind: "$author" },
    ]);

    return res.status(201).json(populatedPost);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        errors: Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }
    return res.status(500).json({ message: "Error creating post" });
  }
};

// Get all posts with filtering and pagination
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sort = (req.query.sort as string) || "-createdAt";
    const authorId = req.query.authorId as string;

    const match: mongoose.FilterQuery<typeof PostModel> = {};
    if (authorId) {
      match.authorId = new mongoose.Types.ObjectId(authorId);
    }

    const sortObj = sort.split(",").reduce((acc: any, item) => {
      const [key, order] = item.startsWith("-")
        ? [item.slice(1), -1]
        : [item, 1];
      acc[key] = order;
      return acc;
    }, {});

    // Use a single aggregation pipeline
    const [result] = await PostModel.aggregate([
      {
        $facet: {
          metadata: [{ $match: match }, { $count: "total" }],
          posts: [
            { $match: match },
            { $sort: sortObj },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $lookup: {
                from: "users",
                localField: "authorId",
                foreignField: "_id",
                pipeline: [{ $project: { password: 0 } }],
                as: "author",
              },
            },
            { $unwind: "$author" },
          ],
        },
      },
      {
        $project: {
          posts: 1,
          total: { $arrayElemAt: ["$metadata.total", 0] },
        },
      },
    ]);

    const total = result.total || 0;

    return res.json({
      posts: result.posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching posts" });
  }
};

// Get post by ID
export const getPostById = async (req: Request, res: Response) => {
  try {
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID format" });
    }

    // Use aggregation pipeline for efficient population
    const [post] = await PostModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(postId) } },
      {
        $lookup: {
          from: "users",
          localField: "authorId",
          foreignField: "_id",
          pipeline: [{ $project: { password: 0 } }],
          as: "author",
        },
      },
      { $unwind: "$author" },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "postId",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "authorId",
                foreignField: "_id",
                pipeline: [{ $project: { password: 0 } }],
                as: "author",
              },
            },
            { $unwind: "$author" },
          ],
          as: "comments",
        },
      },
    ]);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.json(post);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching post" });
  }
};

// Get posts by user ID
export const getPostsByUserId = async (req: Request, res: Response) => {
  try {
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sort = (req.query.sort as string) || "-createdAt";

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const sortObj = sort.split(",").reduce((acc: any, item) => {
      const [key, order] = item.startsWith("-")
        ? [item.slice(1), -1]
        : [item, 1];
      acc[key] = order;
      return acc;
    }, {});

    // Use a single aggregation pipeline
    const [result] = await PostModel.aggregate([
      {
        $facet: {
          metadata: [
            { $match: { authorId: new mongoose.Types.ObjectId(userId) } },
            { $count: "total" },
          ],
          posts: [
            { $match: { authorId: new mongoose.Types.ObjectId(userId) } },
            { $sort: sortObj },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $lookup: {
                from: "users",
                localField: "authorId",
                foreignField: "_id",
                pipeline: [{ $project: { password: 0 } }],
                as: "author",
              },
            },
            { $unwind: "$author" },
          ],
        },
      },
      {
        $project: {
          posts: 1,
          total: { $arrayElemAt: ["$metadata.total", 0] },
        },
      },
    ]);

    const total = result.total || 0;

    return res.json({
      posts: result.posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching user posts" });
  }
};

// Toggle like on post
export const toggleLike = async (req: Request, res: Response) => {
  try {
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID format" });
    }

    const userIdObj = new mongoose.Types.ObjectId(userInfo.userId);

    // Use a single atomic update operation
    const post = await PostModel.findOneAndUpdate(
      { _id: postId },
      [
        {
          $set: {
            likes: {
              $cond: {
                if: { $in: [userIdObj, "$likes"] },
                then: {
                  $filter: {
                    input: "$likes",
                    cond: { $ne: ["$$this", userIdObj] },
                  },
                },
                else: { $concatArrays: ["$likes", [userIdObj]] },
              },
            },
          },
        },
      ],
      { new: true }
    ).populate("author", "-password");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.json(post);
  } catch (error) {
    return res.status(500).json({ message: "Error toggling like" });
  }
};

// Update post
export const updatePost = async (req: Request, res: Response) => {
  try {
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID format" });
    }

    // Combine authorization check and update into a single query
    const post = await PostModel.findOneAndUpdate(
      {
        _id: postId,
        $or: [
          { authorId: userInfo.userId },
          { $expr: { $eq: [userInfo.type, "Admin"] } },
        ],
      },
      {
        $set: {
          ...req.body,
          authorId: undefined, // Prevent authorId modification
          likes: undefined, // Prevent likes modification
        },
      },
      { new: true, runValidators: true }
    ).populate("author", "-password");

    if (!post) {
      return res.status(403).json({
        message: "Post not found or not authorized to modify this post",
      });
    }

    return res.json(post);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        errors: Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }
    return res.status(500).json({ message: "Error updating post" });
  }
};

// Delete post
export const deletePost = async (req: Request, res: Response) => {
  try {
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID format" });
    }

    // Combine authorization check and delete into a single query
    const post = await PostModel.findOneAndDelete({
      _id: postId,
      $or: [
        { authorId: userInfo.userId },
        { $expr: { $eq: [userInfo.type, "Admin"] } },
      ],
    });

    if (!post) {
      return res.status(403).json({
        message: "Post not found or not authorized to delete this post",
      });
    }

    return res.json({ message: "Post deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting post" });
  }
};
