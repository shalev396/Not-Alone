import { Request, Response } from "express";
import mongoose from "mongoose";
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

// Create a new channel
export const createChannel = async (req: Request, res: Response) => {
  try {
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    const { name, type, members, eatupId, isPublic } = req.body;

    // Ensure creator is included in members
    const uniqueMembers = Array.from(
      new Set([...members, userInfo.userId].map((id) => id.toString()))
    );

    const channel = await ChannelModel.create({
      name,
      type,
      members: uniqueMembers,
      eatupId,
      isPublic,
    });

    // Populate member details in a single query
    const populatedChannel = await ChannelModel.findById(channel._id)
      .populate("memberDetails", "firstName lastName email profileImage")
      .populate("eatupDetails");

    await AuditLogModel.create({
      action: "CHANNEL_CREATE",
      userId: userInfo.userId,
      targetId: channel._id,
      details: { channelType: type },
    });

    return res.status(201).json(populatedChannel);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        errors: Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }
    return res.status(500).json({ message: "Error creating channel" });
  }
};

// Get all channels for user
export const getChannelsForUser = async (req: Request, res: Response) => {
  try {
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    // Get all channels where user is a member, with populated data
    const channels = await ChannelModel.find({
      members: userInfo.userId,
      $or: [
        { isPublic: true },
        { members: userInfo.userId },
        { type: "eatup" }, // Eatup channels are always visible to members
      ],
    })
      .populate("memberDetails", "firstName lastName email profileImage")
      .populate("eatupDetails")
      .sort({ updatedAt: -1 });

    return res.json(channels);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching channels" });
  }
};

// Add members to channel
export const addMembers = async (req: Request, res: Response) => {
  try {
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    const { channelId } = req.params;
    const { members } = req.body;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      return res.status(400).json({ message: "Invalid channel ID format" });
    }

    // Add members and get updated channel in single query
    const channel = await ChannelModel.findOneAndUpdate(
      {
        _id: channelId,
        $or: [
          { members: userInfo.userId },
          { isPublic: true },
          { type: "eatup" },
        ],
      },
      {
        $addToSet: { members: { $each: members } },
      },
      { new: true }
    )
      .populate("memberDetails", "firstName lastName email profileImage")
      .populate("eatupDetails");

    if (!channel) {
      return res
        .status(404)
        .json({ message: "Channel not found or access denied" });
    }

    await AuditLogModel.create({
      action: "CHANNEL_ADD_MEMBERS",
      userId: userInfo.userId,
      targetId: channelId,
      details: { addedMembers: members },
    });

    return res.json(channel);
  } catch (error) {
    return res.status(500).json({ message: "Error adding members" });
  }
};

// Remove member from channel
export const removeMember = async (req: Request, res: Response) => {
  try {
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    const { channelId, userId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(channelId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // Remove member and get updated channel in single query
    const channel = await ChannelModel.findOneAndUpdate(
      {
        _id: channelId,
        $or: [
          { members: userInfo.userId },
          { $and: [{ type: "eatup" }, { isPublic: true }] },
        ],
      },
      {
        $pull: { members: userId },
      },
      { new: true }
    )
      .populate("memberDetails", "firstName lastName email profileImage")
      .populate("eatupDetails");

    if (!channel) {
      return res
        .status(404)
        .json({ message: "Channel not found or access denied" });
    }

    await AuditLogModel.create({
      action: "CHANNEL_REMOVE_MEMBER",
      userId: userInfo.userId,
      targetId: channelId,
      details: { removedMember: userId },
    });

    return res.json(channel);
  } catch (error) {
    return res.status(500).json({ message: "Error removing member" });
  }
};

// Delete channel
export const deleteChannel = async (req: Request, res: Response) => {
  try {
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    const { channelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      return res.status(400).json({ message: "Invalid channel ID format" });
    }

    const channel = await ChannelModel.findOneAndDelete({
      _id: channelId,
      $or: [
        { members: userInfo.userId },
        { $and: [{ type: "eatup" }, { isPublic: true }] },
      ],
    });

    if (!channel) {
      return res
        .status(404)
        .json({ message: "Channel not found or access denied" });
    }

    await AuditLogModel.create({
      action: "CHANNEL_DELETE",
      userId: userInfo.userId,
      targetId: channelId,
    });

    return res.json({ message: "Channel deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting channel" });
  }
};
