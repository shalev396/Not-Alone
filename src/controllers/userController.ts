import { Request, Response } from "express";
import { User } from "../models/User";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

interface UserFilter {
  type?: string;
  $or?: Array<{
    firstName?: RegExp;
    lastName?: RegExp;
    email?: RegExp;
  }>;
}

interface UserUpdates {
  firstName?: string;
  lastName?: string;
  phone?: string;
  nickname?: string;
  bio?: string;
  profileImage?: string;
  receiveNotifications?: boolean;
  type?: string;
  email?: string;
}

// Auth-related controller functions
export const loginUser = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        errors: [{ msg: "Missing required fields" }],
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        errors: [{ msg: "Invalid email format" }],
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(403).json({ error: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(403).json({ error: "Invalid credentials" });
    }

    const validTypes = [
      "Soldier",
      "Municipality",
      "Donor",
      "Organization",
      "Business",
      "Admin",
    ];
    if (!validTypes.includes(user.type)) {
      return res.status(403).json({ error: "Invalid user type" });
    }

    // Check approval status (allow admin regardless of status)
    if (user.type !== "Admin" && user.approvalStatus !== "approved") {
      return res.status(403).json({
        error: "Account not approved",
        status: user.approvalStatus,
        message:
          user.approvalStatus === "denied"
            ? user.denialReason
            : "Your account is pending approval",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        type: user.type,
      },
      process.env.JWT_SECRET || "test-secret-key",
      {
        expiresIn: "24h",
      }
    );

    // Convert to plain object and remove password using destructuring
    const { password: _, ...userObject } = user.toObject();

    return res.json({
      token,
      user: {
        id: userObject._id,
        email: userObject.email,
        type: userObject.type,
        firstName: userObject.firstName,
        lastName: userObject.lastName,
        phone: userObject.phone,
        nickname: userObject.nickname,
        receiveNotifications: userObject.receiveNotifications,
        approvalStatus: userObject.approvalStatus,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Error logging in" });
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.user.userId)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const user = await User.findById(req.user.userId)
      .select("-password -passport")
      .lean();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.type !== req.user.type) {
      return res
        .status(401)
        .json({ error: "User type mismatch. Please login again." });
    }

    return res.json({ user });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({ error: "Error fetching user" });
  }
};

// User management controller functions
export const createUser = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { email, phone, passport } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Invalid email format" }] });
    }

    // First check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }, { passport }],
    });

    if (existingUser) {
      return res.status(400).json({
        error: "User already exists",
      });
    }

    // Create new user if doesn't exist
    const user = await User.create(req.body);
    const userResponse = user.toObject();
    const { password: _, passport: __, ...sanitizedUser } = userResponse;

    res.status(201).json({ user: sanitizedUser });
  } catch (error) {
    console.error("Create user error:", error);
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        errors: Object.values(error.errors).map((err) => ({
          msg: err.message,
        })),
      });
    }
    if (error instanceof Error && (error as any).code === 11000) {
      return res.status(400).json({
        error: "User already exists",
      });
    }
    res.status(500).json({ error: "Error creating user" });
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: UserFilter = {};
    if (req.query.type && typeof req.query.type === "string") {
      const validTypes = [
        "Soldier",
        "Municipality",
        "Donor",
        "Organization",
        "Business",
      ];
      if (validTypes.includes(req.query.type)) {
        filter.type = req.query.type;
      }
    }

    if (req.query.search && typeof req.query.search === "string") {
      const searchRegex = new RegExp(req.query.search, "i");
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
      ];
    }

    const result = await User.aggregate([
      { $match: filter },
      {
        $facet: {
          users: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            { $project: { password: 0, passport: 0 } },
          ],
          total: [{ $count: "count" }],
        },
      },
    ]);

    const users = result[0].users;
    const total = result[0].total[0]?.count || 0;

    return res.json({
      users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({
      error: "Error fetching users",
    });
  }
};

export const editUser = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const isAdmin = req.user.type === "Admin";
    const isSelfUpdate = req.user.userId === id;
    if (!isAdmin && !isSelfUpdate) {
      return res
        .status(403)
        .json({ error: "Not authorized to edit this user" });
    }

    const allowedUpdates = [
      "firstName",
      "lastName",
      "phone",
      "nickname",
      "bio",
      "profileImage",
      "receiveNotifications",
    ];
    if (isAdmin) {
      allowedUpdates.push("type", "email");
    }

    const sanitizedUpdates: UserUpdates = {};
    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        sanitizedUpdates[key as keyof UserUpdates] = updates[key];
      }
    });

    if (sanitizedUpdates.phone) {
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(sanitizedUpdates.phone)) {
        return res.status(400).json({ error: "Invalid phone format" });
      }
    }

    const user = await User.findOneAndUpdate(
      {
        _id: id,
        $or: [{ phone: { $ne: sanitizedUpdates.phone } }, { _id: id }],
      },
      { $set: sanitizedUpdates },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password -passport");

    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found or phone number already in use" });
    }

    return res.json({ user });
  } catch (error) {
    console.error("Edit user error:", error);
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        errors: Object.values(error.errors).map((err) => ({
          msg: err.message,
        })),
      });
    }
    return res.status(500).json({ error: "Error updating user" });
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Error deleting user" });
  }
};

// Approval-related controller functions
export const getPendingUsers = async (
  _req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const users = await User.find({ approvalStatus: "pending" })
      .select("-password -passport")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ users });
  } catch (error) {
    console.error("Get pending users error:", error);
    return res.status(500).json({ error: "Error fetching pending users" });
  }
};

export const getPendingUser = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const user = await User.findOne({
      _id: id,
      approvalStatus: "pending",
    })
      .select("-password -passport")
      .lean();

    if (!user) {
      return res.status(404).json({ error: "Pending user not found" });
    }

    return res.json({ user });
  } catch (error) {
    console.error("Get pending user error:", error);
    return res.status(500).json({ error: "Error fetching pending user" });
  }
};

export const approveUser = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const user = await User.findOneAndUpdate(
      { _id: id, approvalStatus: "pending" },
      {
        $set: {
          approvalStatus: "approved",
          approvalDate: new Date(),
          denialReason: undefined,
        },
      },
      { new: true }
    ).select("-password -passport");

    if (!user) {
      return res.status(404).json({ error: "Pending user not found" });
    }

    return res.json({ user });
  } catch (error) {
    console.error("Approve user error:", error);
    return res.status(500).json({ error: "Error approving user" });
  }
};

export const denyUser = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    if (!reason) {
      return res.status(400).json({ error: "Denial reason is required" });
    }

    const user = await User.findOneAndUpdate(
      { _id: id, approvalStatus: "pending" },
      {
        $set: {
          approvalStatus: "denied",
          approvalDate: new Date(),
          denialReason: reason,
        },
      },
      { new: true }
    ).select("-password -passport");

    if (!user) {
      return res.status(404).json({ error: "Pending user not found" });
    }

    return res.json({ user });
  } catch (error) {
    console.error("Deny user error:", error);
    return res.status(500).json({ error: "Error denying user" });
  }
};

// Current user management
export const updateCurrentUser = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const updates = req.body;
    const userId = req.user.userId;

    const allowedUpdates = [
      "firstName",
      "lastName",
      "phone",
      "nickname",
      "bio",
      "profileImage",
      "receiveNotifications",
    ];

    const sanitizedUpdates: UserUpdates = {};
    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        sanitizedUpdates[key as keyof UserUpdates] = updates[key];
      }
    });

    if (sanitizedUpdates.phone) {
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(sanitizedUpdates.phone)) {
        return res.status(400).json({ error: "Invalid phone format" });
      }
    }

    const user = await User.findOneAndUpdate(
      {
        _id: userId,
        $or: [{ phone: { $ne: sanitizedUpdates.phone } }, { _id: userId }],
      },
      { $set: sanitizedUpdates },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password -passport");

    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found or phone number already in use" });
    }

    return res.json({ user });
  } catch (error) {
    console.error("Update current user error:", error);
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        errors: Object.values(error.errors).map((err) => ({
          msg: err.message,
        })),
      });
    }
    return res.status(500).json({ error: "Error updating user" });
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const user = await User.findById(id).select("-password -passport").lean();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ user });
  } catch (error) {
    console.error("Get user by id error:", error);
    return res.status(500).json({ error: "Error fetching user" });
  }
};
