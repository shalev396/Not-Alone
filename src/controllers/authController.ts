import { Request, Response } from "express";
import { User } from "../models/User";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const loginUser = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Missing required fields",
        details: {
          email: !email ? "Email is required" : null,
          password: !password ? "Password is required" : null,
        },
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    // Find user by email - single MongoDB operation
    const user = await User.findOne({ email });

    if (!user) {
      // Use same message as invalid password for security
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if user type is valid
    const validTypes = [
      "Soldier",
      "Municipality",
      "Donor",
      "Organization",
      "Business",
      "Admin",
    ];
    if (!validTypes.includes(user.type)) {
      return res.status(403).json({ message: "Invalid user type" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        type: user.type,
        email: user.email, // Include email for additional verification
      },
      JWT_SECRET,
      {
        expiresIn: "24h",
        algorithm: "HS256",
      }
    );

    // Don't send sensitive information
    return res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        type: user.type,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        nickname: user.nickname,
        receiveNotifications: user.receiveNotifications,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Error logging in",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(req.user.userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Single MongoDB operation
    const user = await User.findById(req.user.userId)
      .select("-password -passport") // Exclude sensitive fields
      .lean(); // Convert to plain object for better performance

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if token user type matches DB user type
    if (user.type !== req.user.type) {
      return res
        .status(401)
        .json({ message: "User type mismatch. Please login again." });
    }

    return res.json(user);
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({
      message: "Error fetching user",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    // Add pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Add filtering
    const filter: any = {};
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

    // Add search
    if (req.query.search && typeof req.query.search === "string") {
      const searchRegex = new RegExp(req.query.search, "i");
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
      ];
    }

    // Single MongoDB operation with aggregation
    const users = await User.find(filter)
      .select("-password -passport")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await User.countDocuments(filter);

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
      message: "Error fetching users",
      error: process.env.NODE_ENV === "development" ? error : undefined,
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

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Check if user exists first
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Security checks
    const isAdmin = req.user.type === "Admin";
    const isSelfUpdate = req.user.userId === id;
    if (!isAdmin && !isSelfUpdate) {
      return res
        .status(403)
        .json({ message: "Not authorized to edit this user" });
    }

    // Validate and sanitize updates
    const allowedUpdates = [
      "firstName",
      "lastName",
      "phone",
      "nickname",
      "bio",
      "profileImage",
      "receiveNotifications",
    ];
    // Allow admin to update more fields
    if (isAdmin) {
      allowedUpdates.push("type", "email");
    }

    const sanitizedUpdates: any = {};
    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        sanitizedUpdates[key] = updates[key];
      }
    });

    // Validate email if being updated
    if (sanitizedUpdates.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitizedUpdates.email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      // Check if email is already taken
      const emailExists = await User.findOne({
        email: sanitizedUpdates.email,
        _id: { $ne: id },
      });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    // Validate phone if being updated
    if (sanitizedUpdates.phone) {
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(sanitizedUpdates.phone)) {
        return res.status(400).json({ message: "Invalid phone format" });
      }
      // Check if phone is already taken
      const phoneExists = await User.findOne({
        phone: sanitizedUpdates.phone,
        _id: { $ne: id },
      });
      if (phoneExists) {
        return res.status(400).json({ message: "Phone number already in use" });
      }
    }

    // Single MongoDB operation for update
    const user = await User.findByIdAndUpdate(
      id,
      { $set: sanitizedUpdates },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password -passport");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    console.error("Edit user error:", error);
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }
    return res.status(500).json({
      message: "Error updating user",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};
