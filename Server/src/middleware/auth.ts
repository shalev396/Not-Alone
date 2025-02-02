import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/userModel";
import { UserType } from "../types/user";

declare global {
  namespace Express {
    interface Request {
      user: {
        userId: string;
        type: UserType;
      };
    }
  }
}

export const auth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      console.log("No token");
      return res.status(401).json({ error: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    // console.log("Decoded Token:", decoded); // Adicione este log

    const user = await UserModel.findById(decoded.userId).select("type").lean();

    if (!user) {
      console.log("User not found");
      return res.status(401).json({ error: "User not found" });
    }

    req.user = {
      userId: decoded.userId,
      type: user.type as UserType,
    };

    next();
  } catch (error) {
    console.log("Auth middleware error:", error);
    console.error("Auth middleware error:", error);
    return res.status(401).json({ error: "Invalid authentication token" });
  }
};
