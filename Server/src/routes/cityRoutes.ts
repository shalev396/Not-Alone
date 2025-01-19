import express from "express";
import { auth } from "../middleware/auth";
import { checkUserType } from "../middleware/checkUserType";
import {
  getAllCities,
  createCity,
  joinCityAsMunicipality,
  joinCityAsSoldier,
  updateCity,
  approveCity,
  denyCity,
  deleteCity,
  handleJoinRequest,
  getPendingJoinRequests,
  getPendingCities,
  getMyCity
} from "../controllers/cityController";

const router = express.Router();

// Public routes
router.get("/", getAllCities);

// Admin routes
router.get("/pending", auth, checkUserType(["Admin"]), getPendingCities);

// Protected routes
router.post("/", auth, checkUserType(["Admin", "Municipality"]), createCity);

router.get("/me", auth, checkUserType(["Admin", "Municipality"]), getMyCity);
// Join requests
router.post(
  "/:cityId/join/municipality",
  auth,
  checkUserType(["Admin", "Municipality"]),
  joinCityAsMunicipality
);

router.post(
  "/:cityId/join/soldier",

  auth,

  checkUserType(["Admin", "Soldier"]),
  joinCityAsSoldier
);

// Handle join requests (Municipality and Admin only)
router.get(
  "/:cityId/join-requests",
  auth,
  checkUserType(["Municipality", "Admin"]),
  getPendingJoinRequests
);

router.post(
  "/:cityId/join-requests/:userId",
  auth,
  checkUserType(["Municipality", "Admin"]),
  handleJoinRequest
);

// City management
router.put(
  "/:cityId",
  auth,
  checkUserType(["Admin", "Municipality"]),
  updateCity
);

router.post("/:cityId/approve", auth, checkUserType(["Admin"]), approveCity);

router.post("/:cityId/deny", auth, checkUserType(["Admin"]), denyCity);

router.delete("/:cityId", auth, checkUserType(["Admin"]), deleteCity);

export default router;
