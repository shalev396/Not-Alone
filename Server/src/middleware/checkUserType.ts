import { Request, Response, NextFunction } from "express";
import { UserType } from "../types/user";

export const checkUserType = (allowedTypes: UserType[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userType = req.user?.type;

    // Admin can access everything
    if (userType === "Admin") {
      return next();
    }

    if (!userType || !allowedTypes.includes(userType)) {
      return res.status(403).json({
        error: `Access denied. Only ${allowedTypes.join(
          ", "
        )} users can access this route.`,
      });
    }

    next();
  };
};
