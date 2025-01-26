import express from "express";
import { auth } from "../middleware/auth";
import { checkUserType } from "../middleware/checkUserType";
import {
  createDonation,
  getAllDonations,
  getDonationById,
  updateDonation,
  deleteDonation,
  getMyDonations,
  getCityDonationsAndSoldiers,
  assignDonationToSoldier,
  updateDonationStatus,
} from "../controllers/donationController";

const router = express.Router();

// Public routes (still need authentication)
router.get(
  "/my",
  auth,
  checkUserType(["Admin", "Donor", "Soldier"]),
  getMyDonations
);

// Create donation (only donors and admin)
router.post("/", auth, checkUserType(["Admin", "Donor"]), createDonation);

// Get all donations (admin and municipality only)
router.get(
  "/",
  auth,
  checkUserType(["Admin", "Municipality"]),
  getAllDonations
);

// Get city donations and available soldiers (municipality only)
router.get(
  "/city-matching",
  auth,
  checkUserType(["Admin", "Municipality"]),
  getCityDonationsAndSoldiers
);

// Get single donation
router.get(
  "/:donationId",
  auth,
  checkUserType(["Admin", "Municipality", "Donor", "Soldier"]),
  getDonationById
);

// Update donation
router.put(
  "/:donationId",
  auth,
  checkUserType(["Admin", "Donor"]),
  updateDonation
);

// Delete donation
router.delete(
  "/:donationId",
  auth,
  checkUserType(["Admin", "Donor"]),
  deleteDonation
);

// Assign donation to soldier
router.post(
  "/:donationId/assign/:soldierId",
  auth,
  checkUserType(["Admin", "Municipality"]),
  assignDonationToSoldier
);

// Update donation status
router.put(
  "/:donationId/status",
  auth,
  checkUserType(["Admin", "Municipality", "Donor", "Soldier"]),
  updateDonationStatus
);

export default router;
