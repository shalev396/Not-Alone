import { Request, Response } from "express";
import mongoose from "mongoose";
import { CommentModel } from "../models/commentModel";

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

// Get all comments (Admin only)
export const getAllComments = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sort = (req.query.sort as string) || "-createdAt";
    const postId = req.query.postId as string;
    const authorId = req.query.authorId as string;

    const match: any = {};
    if (postId && mongoose.Types.ObjectId.isValid(postId)) {
      match.postId = new mongoose.Types.ObjectId(postId);
    }
    if (authorId && mongoose.Types.ObjectId.isValid(authorId)) {
      match.authorId = new mongoose.Types.ObjectId(authorId);
    }

    const sortObj = sort.split(",").reduce((acc: any, item) => {
      const [key, order] = item.startsWith("-")
        ? [item.slice(1), -1]
        : [item, 1];
      acc[key] = order;
      return acc;
    }, {});

    const [result] = await CommentModel.aggregate([
      {
        $facet: {
          metadata: [{ $match: match }, { $count: "total" }],
          comments: [
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
            {
              $lookup: {
                from: "posts",
                localField: "postId",
                foreignField: "_id",
                as: "post",
              },
            },
            { $unwind: "$post" },
          ],
        },
      },
      {
        $project: {
          comments: 1,
          total: { $arrayElemAt: ["$metadata.total", 0] },
        },
      },
    ]);

    const total = result.total || 0;

    return res.json({
      comments: result.comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching comments" });
  }
};

// Get comment by ID (Admin only)
export const getCommentById = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: "Invalid comment ID format" });
    }

    const [comment] = await CommentModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(commentId) } },
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
          from: "posts",
          localField: "postId",
          foreignField: "_id",
          as: "post",
        },
      },
      { $unwind: "$post" },
    ]);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    return res.json(comment);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching comment" });
  }
};

// Create comment
export const createComment = async (req: Request, res: Response) => {
  try {
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    const authorId = new mongoose.Types.ObjectId(userInfo.userId);
    const postId = new mongoose.Types.ObjectId(req.body.postId);

    const [newComment] = await CommentModel.create([
      {
        ...req.body,
        authorId,
        postId,
        likes: [],
      },
    ]);

    const [populatedComment] = await CommentModel.aggregate([
      { $match: { _id: newComment._id } },
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
          from: "posts",
          localField: "postId",
          foreignField: "_id",
          as: "post",
        },
      },
      { $unwind: "$post" },
    ]);

    return res.status(201).json(populatedComment);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        errors: Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }
    return res.status(500).json({ message: "Error creating comment" });
  }
};

// Toggle like on comment
export const toggleLike = async (req: Request, res: Response) => {
  try {
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    const { commentId } = req.params;
    const userIdObj = new mongoose.Types.ObjectId(userInfo.userId);

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: "Invalid comment ID format" });
    }

    const [comment] = await CommentModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(commentId) } },
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
      { $merge: { into: "comments", whenMatched: "replace" } },
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

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    return res.json(comment);
  } catch (error) {
    return res.status(500).json({ message: "Error toggling like" });
  }
};

// Update comment
export const updateComment = async (req: Request, res: Response) => {
  try {
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: "Invalid comment ID format" });
    }

    const [comment] = await CommentModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(commentId),
          $or: [
            { authorId: new mongoose.Types.ObjectId(userInfo.userId) },
            { $expr: { $eq: [userInfo.type, "Admin"] } },
          ],
        },
      },
      {
        $set: {
          content: req.body.content,
          updatedAt: new Date(),
        },
      },
      { $merge: { into: "comments", whenMatched: "replace" } },
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

    if (!comment) {
      return res.status(403).json({
        message: "Comment not found or not authorized to modify this comment",
      });
    }

    return res.json(comment);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        errors: Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }
    return res.status(500).json({ message: "Error updating comment" });
  }
};

// Delete comment
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: "Invalid comment ID format" });
    }

    const result = await CommentModel.deleteOne({
      _id: new mongoose.Types.ObjectId(commentId),
      $or: [
        { authorId: new mongoose.Types.ObjectId(userInfo.userId) },
        { $expr: { $eq: [userInfo.type, "Admin"] } },
      ],
    });

    if (result.deletedCount === 0) {
      return res.status(403).json({
        message: "Comment not found or not authorized to delete this comment",
      });
    }

    return res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting comment" });
  }
};
