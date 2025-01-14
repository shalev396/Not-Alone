import { Request, Response } from "express";
import mongoose from "mongoose";
import { DonationModel } from "../models/donationModel";
import { UserModel } from "../models/userModel";
import { CityModel } from "../models/cityModel";

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

// Get all donations (admin and municipality only)
export const getAllDonations = async (req: Request, res: Response) => {
  const userInfo = ensureUser(req, res);
  if (!userInfo) return;

  try {
    const query: any = {};

    // Municipality users can only see donations from their city
    if (userInfo.type === "Municipality") {
      const userCity = await CityModel.findOne({
        municipalityUsers: userInfo.userId,
      });
      if (!userCity) {
        return res.status(403).json({ message: "No assigned city found" });
      }
      query.city = userCity._id;
    }

    const donations = await DonationModel.find(query)
      .populate("donor", "firstName lastName email phone")
      .populate("cityDetails", "name zone")
      .populate("assignedSoldier", "firstName lastName email phone")
      .lean();

    return res.json(donations);
  } catch (error) {
    console.error("Get donations error:", error);
    return res.status(500).json({ message: "Error fetching donations" });
  }
};

// Get donation by ID
export const getDonationById = async (req: Request, res: Response) => {
  const userInfo = ensureUser(req, res);
  if (!userInfo) return;

  try {
    const { donationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(donationId)) {
      return res.status(400).json({ message: "Invalid donation ID format" });
    }

    const donation = await DonationModel.findById(donationId)
      .populate("donor", "firstName lastName email phone")
      .populate("cityDetails", "name zone")
      .populate("assignedSoldier", "firstName lastName email phone")
      .lean();

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Check permissions
    if (userInfo.type !== "Admin") {
      const isDonor = donation.donorId.toString() === userInfo.userId;
      const isAssignedSoldier =
        donation.assignedTo?.toString() === userInfo.userId;

      if (userInfo.type === "Municipality") {
        const userCity = await CityModel.findOne({
          municipalityUsers: userInfo.userId,
        });
        if (!userCity || userCity._id.toString() !== donation.city.toString()) {
          return res
            .status(403)
            .json({ message: "Not authorized to view this donation" });
        }
      } else if (!isDonor && !isAssignedSoldier) {
        return res
          .status(403)
          .json({ message: "Not authorized to view this donation" });
      }
    }

    return res.json(donation);
  } catch (error) {
    console.error("Get donation error:", error);
    return res.status(500).json({ message: "Error fetching donation" });
  }
};

// Create donation
export const createDonation = async (req: Request, res: Response) => {
  const userInfo = ensureUser(req, res);
  if (!userInfo) return;

  try {
    const donationData = {
      ...req.body,
      donorId: userInfo.userId,
      status: "pending",
    };

    // Validate city exists
    const city = await CityModel.findById(donationData.city);
    if (!city) {
      return res.status(400).json({ message: "City not found" });
    }

    const donation = await DonationModel.create(donationData);
    const populatedDonation = await DonationModel.findById(donation._id)
      .populate("donor", "firstName lastName email phone")
      .populate("cityDetails", "name zone");

    return res.status(201).json(populatedDonation);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        errors: Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }
    return res.status(500).json({ message: "Error creating donation" });
  }
};

// Update donation
export const updateDonation = async (req: Request, res: Response) => {
  const userInfo = ensureUser(req, res);
  if (!userInfo) return;

  try {
    const { donationId } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(donationId)) {
      return res.status(400).json({ message: "Invalid donation ID format" });
    }

    // Find donation and check permissions
    const existingDonation = await DonationModel.findById(donationId);
    if (!existingDonation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Only allow updates if donation is pending
    if (existingDonation.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Cannot update donation that is not pending" });
    }

    // Check permissions
    const isDonor = existingDonation.donorId.toString() === userInfo.userId;
    if (!isDonor && userInfo.type !== "Admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to update this donation" });
    }

    // Remove fields that shouldn't be updated
    delete updates.donorId;
    delete updates.status;
    delete updates.assignedTo;
    delete updates.createdAt;

    const donation = await DonationModel.findByIdAndUpdate(
      donationId,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate("donor", "firstName lastName email phone")
      .populate("cityDetails", "name zone")
      .populate("assignedSoldier", "firstName lastName email phone");

    return res.json(donation);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        errors: Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }
    return res.status(500).json({ message: "Error updating donation" });
  }
};

// Delete donation
export const deleteDonation = async (req: Request, res: Response) => {
  const userInfo = ensureUser(req, res);
  if (!userInfo) return;

  try {
    const { donationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(donationId)) {
      return res.status(400).json({ message: "Invalid donation ID format" });
    }

    const donation = await DonationModel.findById(donationId);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Only allow deletion if donation is pending
    if (donation.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Cannot delete donation that is not pending" });
    }

    // Check permissions
    const isDonor = donation.donorId.toString() === userInfo.userId;
    if (!isDonor && userInfo.type !== "Admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this donation" });
    }

    await donation.deleteOne();
    return res.json({ message: "Donation deleted successfully" });
  } catch (error) {
    console.error("Delete donation error:", error);
    return res.status(500).json({ message: "Error deleting donation" });
  }
};

// Get my donations
export const getMyDonations = async (req: Request, res: Response) => {
  const userInfo = ensureUser(req, res);
  if (!userInfo) return;

  try {
    const donations = await DonationModel.find({ donorId: userInfo.userId })
      .populate("donor", "firstName lastName email phone")
      .populate("cityDetails", "name zone")
      .populate("assignedSoldier", "firstName lastName email phone")
      .lean();

    return res.json(donations);
  } catch (error) {
    console.error("Get my donations error:", error);
    return res.status(500).json({ message: "Error fetching your donations" });
  }
};

// Get city donations and available soldiers
export const getCityDonationsAndSoldiers = async (
  req: Request,
  res: Response
) => {
  const userInfo = ensureUser(req, res);
  if (!userInfo) return;

  try {
    // Get user's city
    const userCity = await CityModel.findOne({
      municipalityUsers: userInfo.userId,
    });

    if (!userCity) {
      return res.status(403).json({ message: "No assigned city found" });
    }

    // Get all pending donations in the city
    const donations = await DonationModel.find({
      city: userCity._id,
      status: "pending",
    })
      .populate("donor", "firstName lastName email phone")
      .populate("cityDetails", "name zone")
      .lean();

    // Get all available soldiers in the city
    const soldiers = await UserModel.find({
      type: "Soldier",
      city: userCity._id,
    })
      .select("firstName lastName email phone")
      .lean();

    return res.json({
      donations,
      soldiers,
      city: {
        id: userCity._id,
        name: userCity.name,
        zone: userCity.zone,
      },
    });
  } catch (error) {
    console.error("Get city matching error:", error);
    return res.status(500).json({ message: "Error fetching city data" });
  }
};

// Assign donation to soldier
export const assignDonationToSoldier = async (req: Request, res: Response) => {
  const userInfo = ensureUser(req, res);
  if (!userInfo) return;

  try {
    const { donationId, soldierId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(donationId) ||
      !mongoose.Types.ObjectId.isValid(soldierId)
    ) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // Verify donation exists and is pending
    const donation = await DonationModel.findOne({
      _id: donationId,
      status: "pending",
    });

    if (!donation) {
      return res.status(404).json({ message: "Pending donation not found" });
    }

    // Verify soldier exists and is in the same city
    const soldier = await UserModel.findOne({
      _id: soldierId,
      type: "Soldier",
      city: donation.city,
    });

    if (!soldier) {
      return res.status(404).json({ message: "Eligible soldier not found" });
    }

    // Verify municipality user is from the same city
    if (userInfo.type === "Municipality") {
      const userCity = await CityModel.findOne({
        municipalityUsers: userInfo.userId,
      });
      if (!userCity || userCity._id.toString() !== donation.city.toString()) {
        return res
          .status(403)
          .json({ message: "Not authorized to assign this donation" });
      }
    }

    // Update donation
    const updatedDonation = await DonationModel.findByIdAndUpdate(
      donationId,
      {
        $set: {
          status: "assigned",
          assignedTo: soldierId,
        },
      },
      { new: true, runValidators: true }
    )
      .populate("donor", "firstName lastName email phone")
      .populate("cityDetails", "name zone")
      .populate("assignedSoldier", "firstName lastName email phone");

    return res.json(updatedDonation);
  } catch (error) {
    console.error("Assign donation error:", error);
    return res.status(500).json({ message: "Error assigning donation" });
  }
};

// Update donation status
export const updateDonationStatus = async (req: Request, res: Response) => {
  const userInfo = ensureUser(req, res);
  if (!userInfo) return;

  try {
    const { donationId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(donationId)) {
      return res.status(400).json({ message: "Invalid donation ID format" });
    }

    const donation = await DonationModel.findById(donationId);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Validate status transition
    const validTransitions: { [key: string]: string[] } = {
      pending: ["assigned"],
      assigned: ["delivery"],
      delivery: ["arrived"],
      arrived: [],
    };

    if (!validTransitions[donation.status].includes(status)) {
      return res.status(400).json({
        message: `Cannot transition from ${donation.status} to ${status}`,
      });
    }

    // Check permissions for status update
    const isDonor = donation.donorId.toString() === userInfo.userId;
    const isAssignedSoldier =
      donation.assignedTo?.toString() === userInfo.userId;
    let canUpdate = userInfo.type === "Admin";

    if (status === "delivery") {
      canUpdate = canUpdate || isDonor || userInfo.type === "Municipality";
    } else if (status === "arrived") {
      canUpdate = canUpdate || isAssignedSoldier;
    } else if (status === "assigned") {
      canUpdate = canUpdate || userInfo.type === "Municipality";
    }

    if (!canUpdate) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this status" });
    }

    // Update donation status
    const updatedDonation = await DonationModel.findByIdAndUpdate(
      donationId,
      { $set: { status } },
      { new: true, runValidators: true }
    )
      .populate("donor", "firstName lastName email phone")
      .populate("cityDetails", "name zone")
      .populate("assignedSoldier", "firstName lastName email phone");

    return res.json(updatedDonation);
  } catch (error) {
    console.error("Update status error:", error);
    return res.status(500).json({ message: "Error updating donation status" });
  }
};
