import { Request, Response } from "express";
import mongoose from "mongoose";
import { DiscountModel } from "../models/discountModel";
import { BusinessModel } from "../models/businessModel";

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

// Get all discounts for a business
export const getBusinessDiscounts = async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(businessId)) {
      return res.status(400).json({ message: "Invalid business ID format" });
    }

    const business = await BusinessModel.findById(businessId)
      .populate("discounts")
      .lean();

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    return res.json(business.discounts);
  } catch (error) {
    console.error("Get discounts error:", error);
    return res.status(500).json({ message: "Error fetching discounts" });
  }
};

// Get single discount
export const getDiscountById = async (req: Request, res: Response) => {
  try {
    const { discountId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(discountId)) {
      return res.status(400).json({ message: "Invalid discount ID format" });
    }

    const discount = await DiscountModel.findById(discountId).lean();

    if (!discount) {
      return res.status(404).json({ message: "Discount not found" });
    }

    return res.json(discount);
  } catch (error) {
    console.error("Get discount error:", error);
    return res.status(500).json({ message: "Error fetching discount" });
  }
};

// Create discount for a business
export const createDiscount = async (req: Request, res: Response) => {
  const userInfo = ensureUser(req, res);
  if (!userInfo) return;

  try {
    const { businessId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(businessId)) {
      return res.status(400).json({ message: "Invalid business ID format" });
    }

    // Check business ownership
    const business = await BusinessModel.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    if (
      business.owner.toString() !== userInfo.userId &&
      userInfo.type !== "Admin"
    ) {
      return res.status(403).json({
        message: "Not authorized to create discounts for this business",
      });
    }

    // Create discount
    const discount = await DiscountModel.create(req.body);

    // Add discount to business
    await BusinessModel.findByIdAndUpdate(businessId, {
      $push: { discounts: discount._id },
    });

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
    return res.status(500).json({ message: "Error creating discount" });
  }
};

// Update discount
export const updateDiscount = async (req: Request, res: Response) => {
  const userInfo = ensureUser(req, res);
  if (!userInfo) return;

  try {
    const { businessId, discountId } = req.params;
    const updates = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(businessId) ||
      !mongoose.Types.ObjectId.isValid(discountId)
    ) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // Check business ownership
    const business = await BusinessModel.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    if (
      business.owner.toString() !== userInfo.userId &&
      userInfo.type !== "Admin"
    ) {
      return res.status(403).json({
        message: "Not authorized to update discounts for this business",
      });
    }

    // Verify discount belongs to business
    if (!business.discounts.map((id) => id.toString()).includes(discountId)) {
      return res
        .status(404)
        .json({ message: "Discount not found in this business" });
    }

    const discount = await DiscountModel.findByIdAndUpdate(
      discountId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return res.json(discount);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        errors: Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }
    return res.status(500).json({ message: "Error updating discount" });
  }
};

// Delete discount
export const deleteDiscount = async (req: Request, res: Response) => {
  const userInfo = ensureUser(req, res);
  if (!userInfo) return;

  try {
    const { businessId, discountId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(businessId) ||
      !mongoose.Types.ObjectId.isValid(discountId)
    ) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // Check business ownership
    const business = await BusinessModel.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    if (
      business.owner.toString() !== userInfo.userId &&
      userInfo.type !== "Admin"
    ) {
      return res.status(403).json({
        message: "Not authorized to delete discounts for this business",
      });
    }

    // Remove discount from business
    await BusinessModel.findByIdAndUpdate(businessId, {
      $pull: { discounts: discountId },
    });

    // Delete the discount
    await DiscountModel.findByIdAndDelete(discountId);

    return res.json({ message: "Discount deleted successfully" });
  } catch (error) {
    console.error("Delete discount error:", error);
    return res.status(500).json({ message: "Error deleting discount" });
  }
};
