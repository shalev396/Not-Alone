import { Request, Response } from "express";
import mongoose from "mongoose";
import { CityModel } from "../models/cityModel";
import { AuditLogModel } from "../models/AuditLog";
import { City } from "../types/city";
import { UserType } from "../types/user";
import { Schema } from "mongoose";

interface UserInfo {
  userId: string;
  type: UserType;
}

const ensureUser = (req: Request, res: Response): UserInfo | undefined => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return undefined;
  }
  return { userId: req.user.userId, type: req.user.type };
};

export const getAllCities = async (_req: Request, res: Response) => {
  try {
    const cities = await CityModel.find({ approvalStatus: "approved" })
      .select("_id name zone bio media approvalStatus")
      .lean();
    return res.status(200).json(cities);
  } catch (error) {
    console.error("Get cities error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createCity = async (req: Request, res: Response) => {
  const userInfo = ensureUser(req, res);
  if (userInfo === undefined) return;

  try {
    const { name, zone, bio } = req.body;

    // Check if city already exists
    const existingCity = await CityModel.findOne({ name }).lean();
    if (existingCity) {
      return res
        .status(400)
        .json({ message: "City with this name already exists" });
    }

    const city = await CityModel.create({
      name,
      zone,
      bio,
      approvalStatus: "pending",
      soldiers: [],
      municipalityUsers: [],
      media: [],
    });

    await AuditLogModel.create({
      action: "CITY_CREATE",
      userId: userInfo.userId,
      targetId: city._id,
      changes: { name, zone, bio },
      ipAddress: req.ip,
      userAgent: req.get("user-agent") || "",
    });

    return res.status(201).json(city);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        errors: Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Add new interface for pending joins
interface IPendingJoin {
  userId: mongoose.Types.ObjectId;
  type: "Municipality" | "Soldier";
  requestDate: Date;
}

// Add pendingJoins field to City model
const citySchema = new Schema(
  {
    // ... existing fields ...
    pendingJoins: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        type: {
          type: String,
          enum: ["Municipality", "Soldier"],
          required: true,
        },
        requestDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Update joinCityAsMunicipality to handle pending approval
export const joinCityAsMunicipality = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const userInfo = ensureUser(req, res);
  if (userInfo === undefined)
    return res.status(401).json({ message: "Authentication required" });

  try {
    const { cityId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(cityId)) {
      return res.status(400).json({ error: "Invalid city ID format" });
    }

    // Check if user is already in another city
    const existingCity = await CityModel.findOne({
      $or: [
        { municipalityUsers: userInfo.userId },
        { "pendingJoins.userId": userInfo.userId },
      ],
    })
      .select("name")
      .lean();

    if (existingCity) {
      return res.status(400).json({
        error: "Already assigned to city or have a pending request",
        cityName: existingCity.name,
      });
    }

    // Add user to pending joins
    const city = await CityModel.findOneAndUpdate(
      {
        _id: cityId,
        approvalStatus: "approved",
        "pendingJoins.userId": { $ne: userInfo.userId },
      },
      {
        $addToSet: {
          pendingJoins: {
            userId: userInfo.userId,
            type: "Municipality",
            requestDate: new Date(),
          },
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!city) {
      return res.status(404).json({ error: "City not found or not approved" });
    }

    // Create audit log
    await AuditLogModel.create({
      action: "CITY_JOIN_REQUEST",
      userId: userInfo.userId,
      targetId: cityId,
    });

    return res.json({ city });
  } catch (error) {
    console.error("Join city error:", error);
    return res.status(500).json({ error: "Error joining city" });
  }
};

// Update joinCityAsSoldier to handle pending approval
export const joinCityAsSoldier = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const userInfo = ensureUser(req, res);
  if (userInfo === undefined)
    return res.status(401).json({ message: "Authentication required" });

  try {
    const { cityId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(cityId)) {
      return res.status(400).json({ error: "Invalid city ID format" });
    }

    // Check if user is already in another city
    const existingCity = await CityModel.findOne({
      $or: [
        { soldiers: userInfo.userId },
        { "pendingJoins.userId": userInfo.userId },
      ],
    })
      .select("name")
      .lean();

    if (existingCity) {
      return res.status(400).json({
        error: "Already assigned to city or have a pending request",
        cityName: existingCity.name,
      });
    }

    // Add user to pending joins
    const city = await CityModel.findOneAndUpdate(
      {
        _id: cityId,
        approvalStatus: "approved",
        "pendingJoins.userId": { $ne: userInfo.userId },
      },
      {
        $addToSet: {
          pendingJoins: {
            userId: userInfo.userId,
            type: "Soldier",
            requestDate: new Date(),
          },
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!city) {
      return res.status(404).json({ error: "City not found or not approved" });
    }

    // Create audit log
    await AuditLogModel.create({
      action: "CITY_JOIN_REQUEST",
      userId: userInfo.userId,
      targetId: cityId,
    });

    return res.json({ city });
  } catch (error) {
    console.error("Join city error:", error);
    return res.status(500).json({ error: "Error joining city" });
  }
};

// Add new method to handle join approvals
export const handleJoinRequest = async (req: Request, res: Response) => {
  const userInfo = ensureUser(req, res);
  if (!userInfo) return;

  try {
    const { cityId, userId } = req.params;
    const { action } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(cityId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const city = await CityModel.findById(cityId);
    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }

    // Check if user is municipality member or admin
    const isMunicipality = city.municipalityUsers
      .map((id) => id.toString())
      .includes(userInfo.userId);
    if (!isMunicipality && userInfo.type !== "Admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to handle join requests" });
    }

    // Find the pending join request
    const pendingJoin = city.pendingJoins.find(
      (join) => join.userId.toString() === userId
    );

    if (!pendingJoin) {
      return res.status(404).json({ message: "Join request not found" });
    }

    if (action === "approve") {
      // Add user to appropriate array based on their type
      if (pendingJoin.type === "Soldier") {
        await CityModel.findByIdAndUpdate(cityId, {
          $push: { soldiers: userId },
          $pull: { pendingJoins: { userId: userId } },
        });
      } else {
        await CityModel.findByIdAndUpdate(cityId, {
          $push: { municipalityUsers: userId },
          $pull: { pendingJoins: { userId: userId } },
        });
      }
    } else {
      // Just remove the pending request if denying
      await CityModel.findByIdAndUpdate(cityId, {
        $pull: { pendingJoins: { userId: userId } },
      });
    }

    // Get updated city
    const updatedCity = await CityModel.findById(cityId).lean();

    // Create audit log
    await AuditLogModel.create({
      action: `CITY_JOIN_${action.toUpperCase()}`,
      userId: userInfo.userId,
      targetId: cityId,
      changes: { userId, action },
    });

    return res.json({
      message: `Join request ${action}ed successfully`,
      city: updatedCity,
    });
  } catch (error) {
    console.error("Handle join request error:", error);
    return res.status(500).json({ message: "Error handling join request" });
  }
};

// Add new method to get pending join requests
export const getPendingJoinRequests = async (req: Request, res: Response) => {
  const userInfo = ensureUser(req, res);
  if (!userInfo) return;

  try {
    const { cityId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(cityId)) {
      return res.status(400).json({ message: "Invalid city ID format" });
    }

    const city = await CityModel.findById(cityId)
      .populate("pendingJoins.userId", "-password")
      .lean();

    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }

    // Check if user is municipality member or admin
    const isMunicipality = city.municipalityUsers.includes(
      new mongoose.Types.ObjectId(userInfo.userId)
    );
    if (!isMunicipality && userInfo.type !== "Admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to view join requests" });
    }

    return res.json(city.pendingJoins);
  } catch (error) {
    console.error("Get pending joins error:", error);
    return res
      .status(500)
      .json({ message: "Error fetching pending join requests" });
  }
};

export const updateCity = async (req: Request, res: Response) => {
  const userInfo = ensureUser(req, res);
  if (userInfo === undefined) return;

  try {
    const { cityId } = req.params;
    const { name, zone, bio, media } = req.body;

    if (!mongoose.Types.ObjectId.isValid(cityId)) {
      return res.status(400).json({ message: "Invalid city ID format" });
    }

    // Find the city and check permissions
    const city = await CityModel.findById(cityId);
    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }

    // Check if user has permission to update
    const isAdmin = userInfo.type === "Admin";
    const isMunicipalityUser = city.municipalityUsers.includes(
      new mongoose.Types.ObjectId(userInfo.userId)
    );
    if (!isAdmin && !isMunicipalityUser) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this city" });
    }

    // Update the city
    const updates: Partial<City> = {};
    if (name) updates.name = name;
    if (zone) updates.zone = zone;
    if (bio) updates.bio = bio;
    if (media) updates.media = media;

    const updatedCity = await CityModel.findByIdAndUpdate(
      cityId,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedCity) {
      return res.status(404).json({ message: "City not found" });
    }

    await AuditLogModel.create({
      action: "CITY_UPDATE",
      userId: userInfo.userId,
      targetId: cityId,
      changes: updates,
      ipAddress: req.ip,
      userAgent: req.get("user-agent") || "",
    });

    return res.status(200).json(updatedCity);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        errors: Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const approveCity = async (req: Request, res: Response) => {
  const userInfo = ensureUser(req, res);
  if (userInfo === undefined) return;

  try {
    const { cityId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(cityId)) {
      return res.status(400).json({ message: "Invalid city ID format" });
    }

    const city = await CityModel.findByIdAndUpdate(
      cityId,
      {
        $set: {
          approvalStatus: "approved",
          approvalDate: new Date(),
        },
      },
      { new: true, runValidators: true }
    ).lean();

    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }

    await AuditLogModel.create({
      action: "CITY_APPROVE",
      userId: userInfo.userId,
      targetId: cityId,
      changes: { approvalStatus: "approved", approvalDate: new Date() },
      ipAddress: req.ip,
      userAgent: req.get("user-agent") || "",
    });

    return res.status(200).json(city);
  } catch (error) {
    console.error("Approve city error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const denyCity = async (req: Request, res: Response) => {
  const userInfo = ensureUser(req, res);
  if (userInfo === undefined) return;

  try {
    const { cityId } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(cityId)) {
      return res.status(400).json({ message: "Invalid city ID format" });
    }

    if (!reason) {
      return res.status(400).json({ message: "Denial reason is required" });
    }

    const city = await CityModel.findByIdAndUpdate(
      cityId,
      {
        $set: {
          approvalStatus: "denied",
          denialReason: reason,
        },
      },
      { new: true, runValidators: true }
    ).lean();

    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }

    await AuditLogModel.create({
      action: "CITY_DENY",
      userId: userInfo.userId,
      targetId: cityId,
      changes: { approvalStatus: "denied", denialReason: reason },
      ipAddress: req.ip,
      userAgent: req.get("user-agent") || "",
    });

    return res.status(200).json(city);
  } catch (error) {
    console.error("Deny city error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteCity = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const userInfo = ensureUser(req, res);
  if (userInfo === undefined)
    return res.status(401).json({ message: "Authentication required" });

  try {
    const { cityId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(cityId)) {
      return res.status(400).json({ error: "Invalid city ID format" });
    }

    const city = await CityModel.findByIdAndDelete(cityId).lean();

    if (!city) {
      return res.status(404).json({ error: "City not found" });
    }

    // Create audit log
    await AuditLogModel.create({
      action: "CITY_DELETE",
      userId: req.user!.userId,
      targetId: cityId,
    });

    return res.json({ message: "City deleted successfully" });
  } catch (error) {
    console.error("Delete city error:", error);
    return res.status(500).json({ error: "Error deleting city" });
  }
};
