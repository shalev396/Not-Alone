import express from "express";
import {
  createDiscount,
  getMyDiscounts,
  getDiscountById,
  deleteDiscount,
  getAllDeals,
} from "../controllers/discountController";
import { auth } from "../middleware/auth";

const router = express.Router();

router.get("/", auth, getAllDeals); // GET /api/deals
router.post("/", auth, createDiscount); // POST /api/deals
router.get("/my", auth, getMyDiscounts);
router.get("/:discountId", auth, getDiscountById);
router.delete("/:discountId", auth, deleteDiscount);

export default router;
