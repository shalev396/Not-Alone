import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import mongoose from "mongoose";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user: {
        userId: string;
        type: string;
        _doc?: mongoose.Document;
      };
    }
  }
}

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "test-secret-key"
    ) as {
      userId: string;
      type: string;
    };

    // Verify user exists in database
    if (!mongoose.Types.ObjectId.isValid(decoded.userId)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Verify user type matches token
    if (user.type !== decoded.type) {
      return res.status(401).json({ error: "Invalid token" });
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

    req.user = {
      userId: decoded.userId,
      type: decoded.type,
      _doc: user.toObject(),
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Role-based middleware factory
export const accessRoles = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Admin can access everything
    if (req.user.type === "Admin") {
      return next();
    }

    // Check if user's role is in the allowed roles array
    if (!allowedRoles.includes(req.user.type)) {
      return res.status(403).json({
        error: "Access denied",
        message: `This route requires one of these roles: ${allowedRoles.join(
          ", "
        )}`,
      });
    }

    next();
  };
};

// Predefined role-based middleware
export const isAdmin = accessRoles(["Admin"]);
export const isSoldier = accessRoles(["Soldier"]);
export const isMunicipality = accessRoles(["Municipality"]);
export const isDonor = accessRoles(["Donor"]);
export const isOrganization = accessRoles(["Organization"]);
export const isBusiness = accessRoles(["Business"]);

// Combined role middleware for shared features
export const canCreateEatups = accessRoles([
  "Municipality",
  "Donor",
  "Organization",
]);
export const canAccessSocial = accessRoles([
  "Soldier",
  "Municipality",
  "Organization",
]);
export const canHandleRequestForm = accessRoles([
  "Soldier",
  "Municipality",
  "Donor",
]);

// Helper function to create JWT token
export const createToken = (user: { _id: string; type: string }): string => {
  return jwt.sign(
    {
      userId: user._id,
      type: user.type,
    },
    process.env.JWT_SECRET || "test-secret-key",
    { expiresIn: "24h" }
  );
};
