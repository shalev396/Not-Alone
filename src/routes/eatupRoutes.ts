import express from "express";
import { auth } from "../middleware/auth";
import { checkUserType } from "../middleware/checkUserType";
import {
  getAllEatups,
  getEatupById,
  createEatup,
  subscribeToEatup,
  unsubscribeFromEatup,
  updateEatup,
  deleteEatup,
  getMyEatups,
} from "../controllers/eatupController";

const router = express.Router();

// Get all eatups (public but authenticated)
router.get(
  "/",
  auth,
  checkUserType(["Admin", "Municipality", "Organization", "Soldier"]),
  getAllEatups
);

// Get my eatups (created by the authenticated user)
router.get(
  "/my",
  auth,
  checkUserType(["Admin", "Municipality", "Organization", "Donor"]),
  getMyEatups
);

// Get single eatup
router.get(
  "/:eatupId",
  auth,
  checkUserType(["Admin", "Municipality", "Organization", "Donor", "Soldier"]),
  getEatupById
);

// Create eatup (only organizations, municipalities, and donors can create)
router.post(
  "/",
  auth,
  checkUserType(["Admin", "Municipality", "Organization", "Donor"]),
  createEatup
);

// Subscribe to eatup (only soldiers can subscribe)
router.post(
  "/:eatupId/subscribe",
  auth,
  checkUserType(["Admin", "Soldier"]),
  subscribeToEatup
);

// Unsubscribe from eatup
router.post(
  "/:eatupId/unsubscribe",
  auth,
  checkUserType(["Admin", "Soldier"]),
  unsubscribeFromEatup
);

// Update eatup (only author or admin)
router.put(
  "/:eatupId",
  auth,
  checkUserType(["Admin", "Municipality", "Organization", "Donor"]),
  updateEatup
);

// Delete eatup (only author or admin)
router.delete(
  "/:eatupId",
  auth,
  checkUserType(["Admin", "Municipality", "Organization", "Donor"]),
  deleteEatup
);

export default router;
