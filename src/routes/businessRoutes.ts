import express from "express";
import { auth } from "../middleware/auth";
import { checkUserType } from "../middleware/checkUserType";
import {
  getAllBusinesses,
  getAllBusinessesAdmin,
  getBusinessById,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  updateBusinessStatus,
  applyToJoinBusiness,
  handleWorkerApplication,
} from "../controllers/businessController";

const router = express.Router();

// Public routes (still need authentication)
router.get("/", auth, getAllBusinesses);
router.get(
  "/:businessId",
  auth,
  checkUserType(["Admin", "Business"]),
  getBusinessById
);

// Admin only routes
router.get("/admin/all", auth, checkUserType(["Admin"]), getAllBusinessesAdmin);
router.post(
  "/:businessId/status",
  auth,
  checkUserType(["Admin"]),
  updateBusinessStatus
);

// Business owner and admin routes
router.post("/", auth, checkUserType(["Admin", "Business"]), createBusiness);
router.put(
  "/:businessId",
  auth,
  checkUserType(["Admin", "Business"]),
  updateBusiness
);
router.delete(
  "/:businessId",
  auth,
  checkUserType(["Admin", "Business"]),
  deleteBusiness
);

// Worker application routes
router.post(
  "/:businessId/apply",
  auth,
  checkUserType(["Admin", "Business"]),
  applyToJoinBusiness
);
router.post(
  "/:businessId/workers/:workerId/handle",
  auth,
  checkUserType(["Admin", "Business"]),
  handleWorkerApplication
);

export default router;
