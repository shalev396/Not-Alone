import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { AuditLogModel } from "../models/AuditLog";

// Rate limiters
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "test" ? 100 : 5, // Higher limit for tests
  message: { error: "Too many login attempts, please try again later" },
});

export const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === "test" ? 100 : 3, // Higher limit for tests
  message: { error: "Too many registration attempts, please try again later" },
});

export const pendingCheckLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: process.env.NODE_ENV === "test" ? 100 : 10, // Higher limit for tests
  message: { error: "Too many status check attempts, please try again later" },
});

export const twoFARequestLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: process.env.NODE_ENV === "test" ? 100 : 3, // 3 attempts per 5 minutes
  message: { error: "Too many 2FA code requests, please try again later" },
});

export const twoFAVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "test" ? 100 : 5, // 5 attempts per 15 minutes
  message: { error: "Too many verification attempts, please try again later" },
});

// Request validation
export const validateLogin = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
  validateRequest,
];

export const validateRegistration = [
  body("email").isEmail().normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)
    .withMessage("Password must contain at least one letter and one number"),
  body("firstName").trim().notEmpty(),
  body("lastName").trim().notEmpty(),
  body("phone")
    .matches(/^\+?[\d\s-]{10,}$/)
    .withMessage("Invalid phone format"),
  body("passport").trim().notEmpty(),
  body("type").isIn([
    "Soldier",
    "Municipality",
    "Donor",
    "Organization",
    "Business",
  ]),
  validateRequest,
];

export const validateUserUpdate = [
  body("email").optional().isEmail().normalizeEmail(),
  body("phone")
    .optional()
    .matches(/^\+?[\d\s-]{10,}$/),
  body("firstName").optional().trim().notEmpty(),
  body("lastName").optional().trim().notEmpty(),
  validateRequest,
];

// Validation for 2FA verification
export const validate2FAVerification = [
  body("userId").isMongoId(),
  body("code").isLength({ min: 6, max: 6 }).isNumeric(),
  body("deviceToken").notEmpty(),
  validateRequest,
];

// Validation result checker
function validateRequest(
  req: Request,
  res: Response,
  next: NextFunction
): Response | void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return next();
}

// Audit logging middleware
export const auditLog = (action: string) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const originalSend = res.json;
    res.json = function (body: any): Response {
      res.json = originalSend;
      // Only log if the request was successful
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const logData: any = {
            action,
            targetId: req.params.id,
            changes: req.body,
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
          };

          // Only add userId if it's a valid user (not anonymous)
          if (req.user?.userId && req.user.userId !== "anonymous") {
            logData.userId = req.user.userId;
          }

          AuditLogModel.create(logData).catch((error) => {
            console.error("Audit log error:", error);
          });
        } catch (error) {
          console.error("Audit log error:", error);
        }
      }
      return originalSend.call(this, body);
    };
    next();
  };
};
