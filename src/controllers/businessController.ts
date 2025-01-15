import { Request, Response } from "express";
import mongoose from "mongoose";
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

const canAccessBusiness = async (
  userId: string,
  userType: string,
  businessId: string
): Promise<boolean> => {
  // Admins can access everything
  if (userType === "Admin") return true;

  const business = await BusinessModel.findById(businessId).lean();
  if (!business) return false;

  // Owner can access their own business
  if (business.owner.toString() === userId) return true;

  // Workers can access their business
  if (business.workers.map((id) => id.toString()).includes(userId)) return true;

  // For approved businesses, anyone can view basic details
  if (business.status === "approved") return true;

  return false;
};

// Get all approved businesses
export const getAllBusinesses = async (req: Request, res: Response) => {
  try {
    const businesses = await BusinessModel.find({ status: "approved" })
      .populate("ownerDetails", "-password")
      .populate("workerDetails", "-password")
      .lean();
    res.json(businesses);
  } catch (error) {
    console.error("Get businesses error:", error);
    res.status(500).json({ message: "Error fetching businesses" });
  }
};

// Get all businesses (admin only)
export const getAllBusinessesAdmin = async (req: Request, res: Response) => {
  try {
    const businesses = await BusinessModel.find()
      .populate("ownerDetails", "-password")
      .populate("workerDetails", "-password")
      .lean();
    res.json(businesses);
  } catch (error) {
    console.error("Get businesses error:", error);
    res.status(500).json({ message: "Error fetching businesses" });
  }
};

// Get single business
export const getBusinessById = async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    if (!mongoose.Types.ObjectId.isValid(businessId)) {
      return res.status(400).json({ message: "Invalid business ID format" });
    }

    const hasAccess = await canAccessBusiness(
      userInfo.userId,
      userInfo.type,
      businessId
    );
    if (!hasAccess) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this business" });
    }

    const business = await BusinessModel.findById(businessId)
      .populate("ownerDetails", "-password")
      .populate("workerDetails", "-password")
      .lean();

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    return res.json(business);
  } catch (error) {
    console.error("Get business error:", error);
    return res.status(500).json({ message: "Error fetching business" });
  }
};

// Create business
export const createBusiness = async (req: Request, res: Response) => {
  const userInfo = ensureUser(req, res);
  if (!userInfo) return;

  try {
    const business = await BusinessModel.create({
      ...req.body,
      owner: userInfo.userId,
      workers: [userInfo.userId], // Owner is automatically a worker
      status: "pending",
    });

    res.status(201).json(business);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        errors: Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }
    console.error("Create business error:", error);
    res.status(500).json({ message: "Error creating business" });
  }
};

// Update business
export const updateBusiness = async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    if (!mongoose.Types.ObjectId.isValid(businessId)) {
      return res.status(400).json({ message: "Invalid business ID format" });
    }

    const hasAccess = await canAccessBusiness(
      userInfo.userId,
      userInfo.type,
      businessId
    );
    if (!hasAccess) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this business" });
    }

    const business = await BusinessModel.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // Only owner or admin can update
    if (
      business.owner.toString() !== userInfo.userId &&
      userInfo.type !== "Admin"
    ) {
      return res
        .status(403)
        .json({ message: "Only the owner or admin can update this business" });
    }

    // Don't allow updates to certain fields
    delete req.body.status;
    delete req.body.owner;
    delete req.body.workers;
    delete req.body.pendingWorkers;

    const updatedBusiness = await BusinessModel.findByIdAndUpdate(
      businessId,
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate("ownerDetails", "-password")
      .populate("workerDetails", "-password");

    return res.json(updatedBusiness);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        errors: Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }
    return res.status(500).json({ message: "Error updating business" });
  }
};

// Delete business
export const deleteBusiness = async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    if (!mongoose.Types.ObjectId.isValid(businessId)) {
      return res.status(400).json({ message: "Invalid business ID format" });
    }

    const hasAccess = await canAccessBusiness(
      userInfo.userId,
      userInfo.type,
      businessId
    );
    if (!hasAccess) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this business" });
    }

    const business = await BusinessModel.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // Only owner or admin can delete
    if (
      business.owner.toString() !== userInfo.userId &&
      userInfo.type !== "Admin"
    ) {
      return res
        .status(403)
        .json({ message: "Only the owner or admin can delete this business" });
    }

    await BusinessModel.findByIdAndDelete(businessId);
    return res.json({ message: "Business deleted successfully" });
  } catch (error) {
    console.error("Delete business error:", error);
    return res.status(500).json({ message: "Error deleting business" });
  }
};

// Admin approve/deny business
export const updateBusinessStatus = async (req: Request, res: Response) => {
  const userInfo = ensureUser(req, res);
  if (!userInfo) return;

  try {
    const { businessId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(businessId)) {
      return res.status(400).json({ message: "Invalid business ID format" });
    }

    if (!["approved", "denied"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const business = await BusinessModel.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    if (business.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Business is not pending approval" });
    }

    const updatedBusiness = await BusinessModel.findByIdAndUpdate(
      businessId,
      { $set: { status } },
      { new: true }
    );

    res.json(updatedBusiness);
  } catch (error) {
    console.error("Update business status error:", error);
    res.status(500).json({ message: "Error updating business status" });
  }
};

// Apply to join business as worker
export const applyToJoinBusiness = async (req: Request, res: Response) => {
  const userInfo = ensureUser(req, res);
  if (!userInfo) return;

  try {
    const { businessId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(businessId)) {
      return res.status(400).json({ message: "Invalid business ID format" });
    }

    const business = await BusinessModel.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    if (business.status !== "approved") {
      return res.status(400).json({ message: "Business is not approved" });
    }

    // Check if user is already a worker or pending
    if (
      business.workers.map((id) => id.toString()).includes(userInfo.userId) ||
      business.pendingWorkers
        .map((id) => id.toString())
        .includes(userInfo.userId)
    ) {
      return res.status(400).json({ message: "Already applied or working" });
    }

    const updatedBusiness = await BusinessModel.findByIdAndUpdate(
      businessId,
      { $addToSet: { pendingWorkers: userInfo.userId } },
      { new: true }
    );

    res.json(updatedBusiness);
  } catch (error) {
    console.error("Apply to join business error:", error);
    res.status(500).json({ message: "Error applying to join business" });
  }
};

// Owner approve/deny worker
export const handleWorkerApplication = async (req: Request, res: Response) => {
  const userInfo = ensureUser(req, res);
  if (!userInfo) return;

  try {
    const { businessId, workerId } = req.params;
    const { action } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(businessId) ||
      !mongoose.Types.ObjectId.isValid(workerId)
    ) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    if (!["approve", "deny"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const business = await BusinessModel.findById(businessId);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // Only owner can handle applications
    if (business.owner.toString() !== userInfo.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if worker is actually pending
    if (
      !business.pendingWorkers.map((id) => id.toString()).includes(workerId)
    ) {
      return res.status(400).json({ message: "Worker is not pending" });
    }

    let update;
    if (action === "approve") {
      update = {
        $pull: { pendingWorkers: workerId },
        $addToSet: { workers: workerId },
      };
    } else {
      update = {
        $pull: { pendingWorkers: workerId },
      };
    }

    const updatedBusiness = await BusinessModel.findByIdAndUpdate(
      businessId,
      update,
      { new: true }
    );

    res.json(updatedBusiness);
  } catch (error) {
    console.error("Handle worker application error:", error);
    res.status(500).json({ message: "Error handling worker application" });
  }
};
