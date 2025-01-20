import express from "express";
import { auth } from "../middleware/auth";
import { checkUserType } from "../middleware/checkUserType";
import {
  getRequests,
  getRequestById,
  createRequest,
  updateRequest,
  approveRequest,
  denyRequest,
  deleteRequest,
  payRequest,
  getRequestsByUser,
} from "../controllers/requestController";

const router = express.Router();

// Get all requests (filtered by user role)
router.get(
  "/",
  auth,
  checkUserType(["Admin", "Municipality", "Organization", "Donor"]),
  getRequests
);

// Get all requests by the authenticated user
router.get("/my", auth, checkUserType(["Admin", "Soldier"]), getRequestsByUser);

// Get single request
router.get(
  "/:requestId",
  auth,
  checkUserType(["Admin", "Municipality", "Organization"]),
  getRequestById
);

// Create request (only soldiers can create requests)
router.post("/", auth, checkUserType(["Admin", "Soldier"]), createRequest);

// Update request (author or admin only - handled in controller)
router.put(
  "/:requestId",
  auth,
  checkUserType(["Admin", "Soldier"]),
  updateRequest
);

// Approve/Deny requests (admin and municipality only)
router.post(
  "/:requestId/approve",
  auth,
  checkUserType(["Admin", "Municipality"]),
  approveRequest
);

router.post(
  "/:requestId/deny",
  auth,
  checkUserType(["Admin", "Municipality"]),
  denyRequest
);

// Pay for request (donors and organizations only)
router.post(
  "/:requestId/pay",
  auth,
  checkUserType(["Admin", "Donor", "Organization", "Municipality"]),
  payRequest
);

// Delete request (author or admin only - handled in controller)
router.delete(
  "/:requestId",
  auth,
  checkUserType(["Admin", "Soldier"]),
  deleteRequest
);

export default router;
