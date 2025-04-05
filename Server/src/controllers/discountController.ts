import { Request, Response } from "express";
import mongoose from "mongoose";
import { DiscountModel } from "../models/discountModel";

interface UserInfo {
  userId: string;
  type: string;
}

const ensureUser = (req: Request, res: Response): UserInfo | undefined => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return undefined;
  }
  return { userId: req.user.userId, type: req.user.type };
};

// Get all discounts for current user
export const getMyDiscounts = async (req: Request, res: Response) => {
  const userInfo = ensureUser(req, res);
  if (!userInfo) return;

  try {
    const discounts = await DiscountModel.find({ owner: userInfo.userId })
      .populate("owner", "firstName lastName profileImage")
      .sort({ createdAt: -1 })
      .lean();
    return res.json(discounts);
  } catch (error) {
    console.error("Error fetching user discounts:", error);
    return res.status(500).json({ message: "Failed to fetch your deals" });
  }
};

// Get single discount
export const getDiscountById = async (req: Request, res: Response) => {
  try {
    const { discountId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(discountId)) {
      return res.status(400).json({ message: "Invalid discount ID format" });
    }

    const discount = await DiscountModel.findById(discountId)
      .populate("owner", "firstName lastName profileImage")
      .lean();
    if (!discount) {
      return res.status(404).json({ message: "Discount not found" });
    }

    return res.json(discount);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching discount" });
  }
};

// Create new discount (deal)
export const createDiscount = async (req: Request, res: Response) => {
  const userInfo = ensureUser(req, res);
  if (!userInfo) return;

  try {
    const payload = {
      ...req.body,
      owner: userInfo.userId,
    };

    const discount = await DiscountModel.create(payload);
    return res.status(201).json(discount);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        errors: Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }
    return res.status(500).json({ message: "Error creating deal" });
  }
};

// Delete discount (only owner or admin)
export const deleteDiscount = async (req: Request, res: Response) => {
  const userInfo = ensureUser(req, res);
  if (!userInfo) return;

  try {
    const { discountId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(discountId)) {
      return res.status(400).json({ message: "Invalid discount ID format" });
    }

    const discount = await DiscountModel.findById(discountId);
    if (!discount) {
      return res.status(404).json({ message: "Discount not found" });
    }

    if (
      discount.owner.toString() !== userInfo.userId &&
      userInfo.type !== "Admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this deal" });
    }

    await DiscountModel.findByIdAndDelete(discountId);
    return res.json({ message: "Deal deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting deal" });
  }
};

// Get all deals for soldiers (with populated owner incl. profileImage)
export const getAllDeals = async (_req: Request, res: Response) => {
  try {
    const deals = await DiscountModel.find()
      .populate("owner", "firstName lastName profileImage") 
      .sort({ createdAt: -1 });

    return res.json(deals);
  } catch (error) {
    console.error("Error fetching all deals:", error);
    return res.status(500).json({ message: "Failed to fetch deals" });
  }
};

