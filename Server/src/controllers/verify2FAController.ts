import { Request, Response } from "express";
import { TwoFAAttempt } from "../models/TwoFAAttemptModel";
import { decryptPayload } from "../utils/encryption";
import useragent from "express-useragent";
import geoip from "geoip-lite";
import { AuditLogModel, AuditLogAction } from "../models/AuditLog";
import { create2FA } from "../services/create2FA";

// Helper function to log failed attempts
async function logFailedAttempt(userId: string, reason: string) {
  try {
    await AuditLogModel.create({
      userId,
      action: AuditLogAction.TWO_FA_VERIFICATION_FAILED,
      details: { reason },
    });
  } catch (error) {
    console.error("Failed to log 2FA attempt:", error);
  }
}

export const generate2FA = async (req: Request, res: Response) => {
  try {
    const { userId, userEmail, userName } = req.body;

    // Generate and send 2FA code
    const deviceToken = await create2FA({
      userId,
      userEmail,
      userName,
      request: req,
      appInfo: "WebApp",
    });

    // Log the generation attempt
    await AuditLogModel.create({
      userId,
      action: AuditLogAction.TWO_FA_GENERATION,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      details: { email: userEmail },
    });

    return res.status(200).json({
      message: "2FA code sent successfully",
      deviceToken,
    });
  } catch (error: any) {
    console.error("2FA Generation Error:", error);
    return res.status(500).json({
      message: "Failed to generate and send 2FA code",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const verify2FA = async (req: Request, res: Response) => {
  try {
    const { userId, code, deviceToken } = req.body;

    // 1) Decrypt deviceToken
    const decrypted = decryptPayload(deviceToken);
    if (!decrypted) {
      await logFailedAttempt(userId, "Invalid device token");
      return res.status(400).json({ message: "Invalid device token." });
    }

    // 2) Compare IP / user-agent for security
    const requestIp = req.ip;
    const source = req.headers["user-agent"] || "";
    const ua = useragent.parse(source);
    const geo = geoip.lookup(requestIp || "");

    // 3) Fetch 2FA record from DB with additional security checks
    const twoFAAttempt = await TwoFAAttempt.findOne({
      userId,
      code,
      used: false,
    }).sort({ createdAt: -1 }); // Get the most recent attempt

    if (!twoFAAttempt) {
      await logFailedAttempt(userId, "Invalid or used code");
      return res
        .status(400)
        .json({ message: "Invalid or already used 2FA code." });
    }

    // 4) Check expiration
    if (twoFAAttempt.expiresAt.getTime() < Date.now()) {
      await logFailedAttempt(userId, "Expired code");
      return res.status(400).json({ message: "2FA code expired." });
    }

    // 5) Strict device info matching
    const deviceMismatch =
      requestIp !== twoFAAttempt.deviceInfo?.ip ||
      source !== decrypted.userAgent ||
      requestIp !== decrypted.ip;

    if (deviceMismatch) {
      await logFailedAttempt(userId, "Device mismatch");
      return res.status(403).json({
        message: "Device information mismatch. Please request a new code.",
      });
    }

    // 6) If everything is good, mark the attempt as successful
    twoFAAttempt.used = true;
    twoFAAttempt.successfulLogin = true;
    await twoFAAttempt.save();

    // 7) Log successful verification
    await AuditLogModel.create({
      userId,
      action: AuditLogAction.TWO_FA_VERIFICATION_SUCCESS,
      ipAddress: requestIp,
      userAgent: source,
      details: {
        deviceInfo: twoFAAttempt.deviceInfo,
        geo,
      },
    });

    return res.status(200).json({
      message: "2FA verified successfully.",
      verified: true,
    });
  } catch (error: any) {
    console.error("2FA Verification Error:", error);
    return res.status(500).json({
      message: "An error occurred during verification.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
