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
} from "../controllers/cityController";

const router = express.Router();

// Public routes
router.get("/", getAllCities);

// Protected routes
router.post("/", auth, checkUserType(["Admin", "Municipality"]), createCity);

router.post(
  "/:cityId/join/municipality",
  auth,
  checkUserType(["Municipality"]),
  joinCityAsMunicipality
);

router.post(
  "/:cityId/join/soldier",
  auth,
  checkUserType(["Soldier"]),
  joinCityAsSoldier
);

router.patch(
  "/:cityId",
  auth,
  checkUserType(["Admin", "Municipality"]),
  updateCity
);

router.post("/:cityId/approve", auth, checkUserType(["Admin"]), approveCity);

router.post("/:cityId/deny", auth, checkUserType(["Admin"]), denyCity);

router.delete("/:cityId", auth, checkUserType(["Admin"]), deleteCity);

export default router;
