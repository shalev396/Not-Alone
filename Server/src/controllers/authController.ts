import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/userModel";
import { AuditLogModel } from "../models/AuditLog";

export const loginUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(403).json({
        errors: [{ msg: "Email and password are required!!!" }],
      });
    }

    // Email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(403).json({
        errors: [{ msg: "Invalid email format!" }],
      });
    }

    // Find user
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(403).json({ error: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(403).json({ error: "Invalid credentials" });
    }

    // Check approval status
    if (user.approvalStatus === "pending") {
      return res.json({
        user: {
          ...user.toObject(),
          password: undefined,
        },
        status: "pending",
      });
    }

    if (user.approvalStatus === "denied") {
      return res.status(403).json({
        error: "Account access denied",
        status: "denied",
        reason: user.denialReason,
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, type: user.type },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1d" }
    );

    // Create audit log
    await AuditLogModel.create({
      action: "USER_LOGIN",
      userId: user._id,
      targetId: user._id,
    });

    return res.json({
      token,
      user: {
        ...user.toObject(),
        password: undefined,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Error during login" });
  }
};
