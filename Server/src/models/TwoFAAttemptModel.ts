// models/TwoFAAttempt.ts
import mongoose from "mongoose";

const DeviceInfoSchema = new mongoose.Schema(
  {
    ip: { type: String },
    browser: { type: String },
    browserVersion: { type: String },
    os: { type: String },
    platform: { type: String },
    isMobile: { type: Boolean, default: false },
    isDesktop: { type: Boolean, default: true },
    isBot: { type: Boolean, default: false },
    source: { type: String }, // Store the raw user agent string
    geo: {
      country: { type: String },
      region: { type: String },
      city: { type: String },
      ll: [Number], // [latitude, longitude]
    },
  },
  { _id: false }
); // _id: false so it doesn't create sub-document IDs

const TwoFAAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
  successfulLogin: { type: Boolean, default: false },
  deviceToken: { type: String },
  appInfo: { type: String },
  ip: { type: String },
  createdAt: { type: Date, default: Date.now },
  // This is our new field
  deviceInfo: DeviceInfoSchema,
});

// Add index for expiration
TwoFAAttemptSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Add index for querying
TwoFAAttemptSchema.index({ userId: 1, code: 1, used: 1 });

export const TwoFAAttempt = mongoose.model("TwoFAAttempt", TwoFAAttemptSchema);
