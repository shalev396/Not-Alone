import express from "express";
import { auth } from "../middleware/auth";
import { checkUserType } from "../middleware/checkUserType";
import {
  createMessage,
  getMessagesByChannel,
  updateMessage,
  deleteMessage,
} from "../controllers/messageController";

const router = express.Router();

// Create new message
router.post(
  "/",
  auth,
  checkUserType(["Admin", "Soldier", "Municipality", "Organization", "Donor"]),
  createMessage
);

// Get messages for a channel
router.get(
  "/channel/:channelId",
  auth,
  checkUserType(["Admin", "Soldier", "Municipality", "Organization", "Donor"]),
  getMessagesByChannel
);

// Update message
router.put(
  "/:messageId",
  auth,
  checkUserType(["Admin", "Soldier", "Municipality", "Organization", "Donor"]),
  updateMessage
);

// Delete message
router.delete(
  "/:messageId",
  auth,
  checkUserType(["Admin", "Soldier", "Municipality", "Organization", "Donor"]),
  deleteMessage
);

export default router;
