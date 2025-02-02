// services/create2FA.ts
import crypto from "crypto";
import { Request } from "express";
import { TwoFAAttempt } from "../models/TwoFAAttemptModel";
import { encryptPayload } from "../utils/encryption";
import { sendEmail } from "../../apis/email/emailHelper";
import { get2FAEmailHTML } from "../../apis/email/emailTemplates";
import useragent from "express-useragent";
import geoip from "geoip-lite";

interface Create2FAParams {
  userId: string;
  userEmail: string;
  userName: string;
  request: Request;
  appInfo?: string;
}

export async function create2FA({
  userId,
  userEmail,
  userName,
  request,
  appInfo = "WebApp",
}: Create2FAParams) {
  // 1) Generate 6-digit code
  const code = crypto.randomInt(100000, 999999).toString();

  // 2) Set expiration (e.g., 5 minutes)
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // 3) Gather extended device/browser info
  const ip = request.ip;
  const source = request.headers["user-agent"] || "";
  const ua = useragent.parse(source);
  const geo = geoip.lookup(ip || "") || undefined;

  // Construct the device info object with proper boolean values
  const deviceInfo = {
    ip,
    browser: ua.browser,
    browserVersion: ua.version,
    os: ua.os,
    platform: ua.platform,
    isMobile: Boolean(ua.isMobile),
    isDesktop: Boolean(ua.isDesktop),
    isBot: Boolean(ua.isBot),
    source, // Store the raw user agent string
    geo: geo
      ? {
          country: geo.country,
          region: geo.region,
          city: geo.city,
          ll: geo.ll,
        }
      : undefined,
  };

  // 4) Create an encrypted token with device info
  const devicePayload = {
    ip,
    userAgent: source,
    userId,
    appInfo,
    generatedAt: Date.now(),
  };
  const deviceToken = encryptPayload(devicePayload);

  // 5) Save record in DB
  const twoFARecord = await TwoFAAttempt.create({
    userId,
    code,
    expiresAt,
    used: false,
    successfulLogin: false,
    deviceToken,
    appInfo,
    ip,
    deviceInfo,
  });

  // 6) Send the HTML email
  const htmlContent = get2FAEmailHTML(code, userName);
  await sendEmail(
    userEmail,
    "Your 2FA Code",
    `Hello ${userName}, your 2FA code is ${code}. It expires in 5 minutes.`,
    htmlContent
  );

  // 7) Return deviceToken
  return deviceToken;
}
