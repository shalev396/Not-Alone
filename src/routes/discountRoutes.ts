import express from "express";
import { auth } from "../middleware/auth";
import { checkUserType } from "../middleware/checkUserType";
import {
  getBusinessDiscounts,
  getDiscountById,
  createDiscount,
  updateDiscount,
  deleteDiscount,
} from "../controllers/discountController";

const router = express.Router();

// Public routes (still need authentication)
router.get("/business/:businessId", auth, getBusinessDiscounts);
router.get("/:discountId", auth, getDiscountById);

// Business owner and admin routes
router.post(
  "/business/:businessId",
  auth,
  checkUserType(["Business", "Admin"]),
  createDiscount
);
router.put(
  "/business/:businessId/:discountId",
  auth,
  checkUserType(["Business", "Admin"]),
  updateDiscount
);
router.delete(
  "/business/:businessId/:discountId",
  auth,
  checkUserType(["Business", "Admin"]),
  deleteDiscount
);

export default router;
