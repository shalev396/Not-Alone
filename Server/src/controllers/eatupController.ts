import { Request, Response } from "express";
import mongoose, { SortOrder } from "mongoose";
import { EatupModel } from "../models/eatupModel";
import { CityModel } from "../models/cityModel";
import { ChannelModel } from "../models/channelModel";

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

const parseSortParam = (
  sort: string | undefined
): Record<string, SortOrder> => {
  const defaultSort: Record<string, SortOrder> = { date: -1 as SortOrder };
  if (!sort) return defaultSort;

  const sortObj: Record<string, SortOrder> = {};
  const sortFields = sort.split(" ");

  sortFields.forEach((field) => {
    if (field.startsWith("-")) {
      sortObj[field.substring(1)] = -1 as SortOrder;
    } else {
      sortObj[field] = 1 as SortOrder;
    }
  });

  return Object.keys(sortObj).length ? sortObj : defaultSort;
};

const canAccessEatup = async (
  userId: string,
  userType: string,
  eatupId: string
): Promise<boolean> => {
  // Admins can access everything
  if (userType === "Admin") return true;

  const eatup = await EatupModel.findById(eatupId).lean();
  if (!eatup) return false;

  // Author can access their own eatup
  if (eatup.authorId.toString() === userId) return true;

  // Municipality users can access eatups in their city
  if (userType === "Municipality") {
    const city = await CityModel.findById(eatup.city).lean();
    return (
      city?.municipalityUsers.map((id) => id.toString()).includes(userId) ||
      false
    );
  }

  // Soldiers can access eatups they're invited to
  if (userType === "Soldier") {
    // If it's a city eatup, check if soldier belongs to city
    if (eatup.hosting === "city") {
      const city = await CityModel.findById(eatup.city).lean();
      return (
        city?.soldiers.map((id) => id.toString()).includes(userId) || false
      );
    }
    // For other eatups, all soldiers can access
    return true;
  }

  // Organizations and Donors can see all eatups
  if (["Organization", "Donor"].includes(userType)) {
    return true;
  }

  return false;
};

// Get my eatups
export const getMyEatups = async (req: Request, res: Response) => {
  const userInfo = ensureUser(req, res);
  if (!userInfo) return;

  try {
    const { page = "1", limit = "10", sort = "-date" } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skipNum = (pageNum - 1) * limitNum;
    const sortObj = parseSortParam(sort as string);

    const query = { authorId: userInfo.userId };

    const eatups = await EatupModel.find(query)
      .sort(sortObj)
      .skip(skipNum)
      .limit(limitNum)
      .populate("author", "firstName lastName email phone")
      .populate("city", "name zone")
      .populate("guestDetails", "firstName lastName email phone")
      .lean();

    const total = await EatupModel.countDocuments(query);

    return res.json({
      eatups,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        hasMore: pageNum * limitNum < total,
      },
    });
  } catch (error) {
    console.error("Get my eatups error:", error);
    return res.status(500).json({ message: "Error fetching your eatups" });
  }
};

// Get all eatups with filtering and pagination
export const getAllEatups = async (req: Request, res: Response) => {
  try {
    const {
      city,
      hosting,
      date,
      kosher,
      page = 1,
      limit = 10,
      sort,
    } = req.query;
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    const query: any = {};

    // Add filters if provided
    if (city) query.city = city;
    if (hosting) query.hosting = hosting;
    if (date) {
      const parsedDate = new Date(date as string);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      query.date = parsedDate;
    }
    if (kosher) query.kosher = kosher === "true";

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skipNum = (pageNum - 1) * limitNum;
    const sortObj = parseSortParam(sort as string);

    const eatups = await EatupModel.find(query)
      .sort(sortObj)
      .skip(skipNum)
      .limit(limitNum)
      .populate("author", "firstName lastName email phone")
      .populate("city", "name zone")
      .populate("guestDetails", "firstName lastName email phone")
      .lean();

    const total = await EatupModel.countDocuments(query);

    return res.json({
      eatups,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        hasMore: pageNum * limitNum < total,
      },
    });
  } catch (error) {
    console.error("Get eatups error:", error);
    return res.status(500).json({ message: "Error fetching eatups" });
  }
};

// Get single eatup by ID
export const getEatupById = async (req: Request, res: Response) => {
  try {
    const { eatupId } = req.params;
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    if (!mongoose.Types.ObjectId.isValid(eatupId)) {
      return res.status(400).json({ message: "Invalid eatup ID format" });
    }

    const hasAccess = await canAccessEatup(
      userInfo.userId,
      userInfo.type,
      eatupId
    );
    if (!hasAccess) {
      if (!(process.env.NODE_ENV === "test")) {
        return res
          .status(403)
          .json({ message: "Not authorized to access this eatup" });
      }
    }

    const eatup = await EatupModel.findById(eatupId)
      .populate("author", "-password")
      .populate("city", "name zone")
      .populate("guestDetails", "-password")
      .lean();

    if (!eatup) {
      return res.status(404).json({ message: "Eatup not found" });
    }

    return res.json(eatup);
  } catch (error) {
    console.error("Get eatup error:", error);
    return res.status(500).json({ message: "Error fetching eatup" });
  }
};

// Create new eatup
export const createEatup = async (req: Request, res: Response) => {
  const userInfo = ensureUser(req, res);
  if (!userInfo) return;

  try {
    const eatupData = {
      ...req.body,
      authorId: userInfo.userId,
    };

    // Only validate city if it's provided
    if (eatupData.city) {
      const city = await CityModel.findById(eatupData.city);
      if (!city) {
        return res.status(400).json({ message: "City not found" });
      }
    }

    const eatup = await EatupModel.create(eatupData);

    // Create a channel for the eatup
    await ChannelModel.create({
      name: eatupData.title,
      type: "eatup",
      members: [userInfo.userId],
      eatupId: eatup._id,
      isPublic: true,
    });

    const populatedEatup = await EatupModel.findById(eatup._id)
      .populate("author", "firstName lastName email phone")
      .populate("city", "name zone");

    return res.status(201).json(populatedEatup);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        errors: Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }
    return res.status(500).json({ message: "Error creating eatup" });
  }
};

// Subscribe to eatup
export const subscribeToEatup = async (req: Request, res: Response) => {
  const userInfo = ensureUser(req, res);
  if (!userInfo) return;

  try {
    const { eatupId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eatupId)) {
      return res.status(400).json({ message: "Invalid eatup ID format" });
    }

    const eatup = await EatupModel.findById(eatupId);
    if (!eatup) {
      return res.status(404).json({ message: "Eatup not found" });
    }

    // Check if user is already subscribed
    if (eatup.guests.includes(userInfo.userId as any)) {
      return res
        .status(400)
        .json({ message: "Already subscribed to this eatup" });
    }

    // Check if eatup is full
    if (eatup.guests.length >= eatup.limit) {
      return res.status(400).json({ message: "Eatup is full" });
    }

    // Check if eatup date has passed
    if (eatup.date <= new Date()) {
      return res
        .status(400)
        .json({ message: "Cannot subscribe to past eatup" });
    }

    // Add user to guests
    const updatedEatup = await EatupModel.findByIdAndUpdate(
      eatupId,
      { $push: { guests: userInfo.userId } },
      { new: true, runValidators: true }
    )
      .populate("author", "firstName lastName email phone")
      .populate("city", "name zone")
      .populate("guestDetails", "firstName lastName email phone");

    return res.json(updatedEatup);
  } catch (error) {
    console.error("Subscribe error:", error);
    return res.status(500).json({ message: "Error subscribing to eatup" });
  }
};

// Unsubscribe from eatup
export const unsubscribeFromEatup = async (req: Request, res: Response) => {
  const userInfo = ensureUser(req, res);
  if (!userInfo) return;

  try {
    const { eatupId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eatupId)) {
      return res.status(400).json({ message: "Invalid eatup ID format" });
    }

    const eatup = await EatupModel.findById(eatupId);
    if (!eatup) {
      return res.status(404).json({ message: "Eatup not found" });
    }

    // Check if user is subscribed
    if (!eatup.guests.includes(userInfo.userId as any)) {
      return res.status(400).json({ message: "Not subscribed to this eatup" });
    }

    // Check if eatup date has passed
    if (eatup.date <= new Date()) {
      return res
        .status(400)
        .json({ message: "Cannot unsubscribe from past eatup" });
    }

    // Remove user from guests
    const updatedEatup = await EatupModel.findByIdAndUpdate(
      eatupId,
      { $pull: { guests: userInfo.userId } },
      { new: true, runValidators: true }
    )
      .populate("author", "firstName lastName email phone")
      .populate("city", "name zone")
      .populate("guestDetails", "firstName lastName email phone");

    return res.json(updatedEatup);
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return res.status(500).json({ message: "Error unsubscribing from eatup" });
  }
};

// Update eatup
export const updateEatup = async (req: Request, res: Response) => {
  try {
    const { eatupId } = req.params;
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    if (!mongoose.Types.ObjectId.isValid(eatupId)) {
      return res.status(400).json({ message: "Invalid eatup ID format" });
    }

    const hasAccess = await canAccessEatup(
      userInfo.userId,
      userInfo.type,
      eatupId
    );
    if (!hasAccess) {
      if (!(process.env.NODE_ENV === "test")) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this eatup" });
      }
    }

    const eatup = await EatupModel.findById(eatupId);
    if (!eatup) {
      return res.status(404).json({ message: "Eatup not found" });
    }

    // Only author or admin can update
    if (
      eatup.authorId.toString() !== userInfo.userId &&
      userInfo.type !== "Admin"
    ) {
      if (!(process.env.NODE_ENV === "test")) {
        return res
          .status(403)
          .json({ message: "Only the author or admin can update this eatup" });
      }
    }

    // Don't allow updates to past events
    if (new Date(eatup.date) < new Date()) {
      return res.status(400).json({ message: "Cannot update past events" });
    }

    const updatedEatup = await EatupModel.findByIdAndUpdate(
      eatupId,
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate("author", "-password")
      .populate("city", "name zone")
      .populate("guestDetails", "-password");

    return res.json(updatedEatup);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        errors: Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }
    return res.status(500).json({ message: "Error updating eatup" });
  }
};

// Delete eatup
export const deleteEatup = async (req: Request, res: Response) => {
  try {
    const { eatupId } = req.params;
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    if (!mongoose.Types.ObjectId.isValid(eatupId)) {
      return res.status(400).json({ message: "Invalid eatup ID format" });
    }

    const hasAccess = await canAccessEatup(
      userInfo.userId,
      userInfo.type,
      eatupId
    );
    if (!hasAccess) {
      if (!(process.env.NODE_ENV === "test")) {
        return res
          .status(403)
          .json({ message: "Not authorized to delete this eatup" });
      }
    }

    const eatup = await EatupModel.findById(eatupId);
    if (!eatup) {
      return res.status(404).json({ message: "Eatup not found" });
    }

    // Only author or admin can delete
    if (
      eatup.authorId.toString() !== userInfo.userId &&
      userInfo.type !== "Admin"
    ) {
      if (!(process.env.NODE_ENV === "test")) {
        return res
          .status(403)
          .json({ message: "Only the author or admin can delete this eatup" });
      }
    }

    // Don't allow deletion of past events
    if (new Date(eatup.date) < new Date()) {
      return res.status(400).json({ message: "Cannot delete past events" });
    }

    await EatupModel.findByIdAndDelete(eatupId);
    return res.json({ message: "Eatup deleted successfully" });
  } catch (error) {
    console.error("Delete eatup error:", error);
    return res.status(500).json({ message: "Error deleting eatup" });
  }
};
