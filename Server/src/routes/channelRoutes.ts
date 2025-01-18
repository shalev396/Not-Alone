import express from "express";
import { auth } from "../middleware/auth";
import { checkUserType } from "../middleware/checkUserType";
import {
  createChannel,
  getChannelsForUser,
  addMembers,
  removeMember,
  deleteChannel,
} from "../controllers/channelController";

const router = express.Router();

// Get all channels for user
router.get(
  "/",
  auth,
  checkUserType(["Admin", "Soldier", "Municipality", "Organization", "Donor"]),
  getChannelsForUser
);

// Create new channel
router.post(
  "/",
  auth,
  checkUserType(["Admin", "Soldier", "Municipality", "Organization"]),
  createChannel
);

// Add members to channel
router.put(
  "/:channelId/members",
  auth,
  checkUserType(["Admin", "Soldier", "Municipality", "Organization"]),
  addMembers
);

// Remove member from channel
router.delete(
  "/:channelId/members/:userId",
  auth,
  checkUserType(["Admin", "Soldier", "Municipality", "Organization"]),
  removeMember
);

// Delete channel
router.delete(
  "/:channelId",
  auth,
  checkUserType(["Admin", "Soldier", "Municipality", "Organization"]),
  deleteChannel
);

export default router;
