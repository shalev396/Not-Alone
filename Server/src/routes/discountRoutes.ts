// routes/discountRoutes.ts
import express from "express";
import { auth } from "../middleware/auth";
import { checkUserType } from "../middleware/checkUserType";
import {
  createDiscount,
  getAllDeals,
  getDiscountById,
  deleteDiscount,
  getMyDiscounts,
} from "../controllers/discountController";

const router = express.Router();

// Public route - soldiers can view all active deals
router.get("/", auth, getAllDeals);

// Get all discounts for current logged-in business
router.get("/my", auth, checkUserType(["Business", "Admin"]), getMyDiscounts);

// Create new discount (deal)
router.post("/", auth, checkUserType(["Business", "Admin"]), createDiscount);

// Get specific discount
router.get("/:discountId", auth, getDiscountById);

// Delete a discount
router.delete(
  "/:discountId",
  auth,
  checkUserType(["Business", "Admin"]),
  deleteDiscount
);

export default router;
