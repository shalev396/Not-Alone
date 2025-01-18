import { Request, Response } from "express";
import mongoose from "mongoose";
import { MessageModel } from "../models/messageModel";
import { ChannelModel } from "../models/channelModel";
import { AuditLogModel } from "../models/auditLogModel";

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

// Create a new message
export const createMessage = async (req: Request, res: Response) => {
  try {
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    const { channelId, content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      return res.status(400).json({ message: "Invalid channel ID format" });
    }

    // Check channel membership and create message in a single aggregation
    const [result] = await ChannelModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(channelId),
          members: new mongoose.Types.ObjectId(userInfo.userId),
        },
      },
      {
        $lookup: {
          from: "messages",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$channelId", "$$channelId"] },
                    {
                      $eq: [
                        "$sender",
                        new mongoose.Types.ObjectId(userInfo.userId),
                      ],
                    },
                  ],
                },
              },
            },
          ],
          as: "message",
        },
      },
    ]);

    if (!result) {
      return res.status(403).json({ message: "Not a member of this channel" });
    }

    const message = await MessageModel.create({
      channelId,
      content,
      sender: userInfo.userId,
      readBy: [userInfo.userId],
    });

    // Populate sender details in a single query
    const populatedMessage = await MessageModel.findById(message._id)
      .populate("sender", "firstName lastName email profileImage")
      .populate("readBy", "firstName lastName");

    await AuditLogModel.create({
      action: "MESSAGE_CREATE",
      userId: userInfo.userId,
      targetId: message._id,
      details: { channelId },
    });

    return res.status(201).json(populatedMessage);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        errors: Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }
    return res.status(500).json({ message: "Error creating message" });
  }
};

// Get messages for a channel
export const getMessagesByChannel = async (req: Request, res: Response) => {
  try {
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    const { channelId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      return res.status(400).json({ message: "Invalid channel ID format" });
    }

    // Get messages and channel access check in a single aggregation
    const [result] = await ChannelModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(channelId),
          members: new mongoose.Types.ObjectId(userInfo.userId),
        },
      },
      {
        $lookup: {
          from: "messages",
          let: { channelId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$channelId", "$$channelId"] } } },
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $lookup: {
                from: "users",
                localField: "sender",
                foreignField: "_id",
                pipeline: [
                  {
                    $project: {
                      firstName: 1,
                      lastName: 1,
                      email: 1,
                      profileImage: 1,
                    },
                  },
                ],
                as: "sender",
              },
            },
            { $unwind: "$sender" },
            {
              $lookup: {
                from: "users",
                localField: "readBy",
                foreignField: "_id",
                pipeline: [
                  {
                    $project: {
                      firstName: 1,
                      lastName: 1,
                    },
                  },
                ],
                as: "readByDetails",
              },
            },
          ],
          as: "messages",
        },
      },
    ]);

    if (!result) {
      return res.status(403).json({ message: "Not a member of this channel" });
    }

    // Mark messages as read
    await MessageModel.updateMany(
      {
        channelId,
        readBy: { $ne: userInfo.userId },
      },
      {
        $addToSet: { readBy: userInfo.userId },
      }
    );

    return res.json({
      messages: result.messages,
      pagination: {
        page,
        limit,
        hasMore: result.messages.length === limit,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching messages" });
  }
};

// Update message
export const updateMessage = async (req: Request, res: Response) => {
  try {
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    const { messageId } = req.params;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ message: "Invalid message ID format" });
    }

    // Update message and check permissions in a single query
    const message = await MessageModel.findOneAndUpdate(
      {
        _id: messageId,
        $or: [
          { sender: userInfo.userId },
          { $expr: { $eq: [userInfo.type, "Admin"] } },
        ],
      },
      {
        $set: {
          content,
          isEdited: true,
        },
      },
      { new: true }
    )
      .populate("sender", "firstName lastName email profileImage")
      .populate("readBy", "firstName lastName");

    if (!message) {
      return res.status(403).json({
        message: "Message not found or not authorized to update",
      });
    }

    await AuditLogModel.create({
      action: "MESSAGE_UPDATE",
      userId: userInfo.userId,
      targetId: messageId,
    });

    return res.json(message);
  } catch (error) {
    return res.status(500).json({ message: "Error updating message" });
  }
};

// Delete message
export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    const { messageId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ message: "Invalid message ID format" });
    }

    // Delete message and check permissions in a single query
    const message = await MessageModel.findOneAndDelete({
      _id: messageId,
      $or: [
        { sender: userInfo.userId },
        { $expr: { $eq: [userInfo.type, "Admin"] } },
      ],
    });

    if (!message) {
      return res.status(403).json({
        message: "Message not found or not authorized to delete",
      });
    }

    await AuditLogModel.create({
      action: "MESSAGE_DELETE",
      userId: userInfo.userId,
      targetId: messageId,
    });

    return res.json({ message: "Message deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting message" });
  }
};
