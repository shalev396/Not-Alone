import mongoose from "mongoose";

// Define valid action types
export enum AuditLogAction {
  USER_CREATE = "USER_CREATE",
  USER_LOGIN = "USER_LOGIN",
  USER_LOGIN_FAILED = "USER_LOGIN_FAILED",
  USER_UPDATE = "USER_UPDATE",
  USER_DELETE = "USER_DELETE",
  USER_APPROVE = "USER_APPROVE",
  USER_DENY = "USER_DENY",
  USER_ACCESS = "USER_ACCESS",
  ADMIN_ACTION = "ADMIN_ACTION",
  CITY_CREATE = "CITY_CREATE",
  CITY_UPDATE = "CITY_UPDATE",
  CITY_DELETE = "CITY_DELETE",
  CITY_APPROVE = "CITY_APPROVE",
  CITY_DENY = "CITY_DENY",
  CITY_JOIN = "CITY_JOIN",
  REQUEST_CREATE = "REQUEST_CREATE",
  REQUEST_UPDATE = "REQUEST_UPDATE",
  REQUEST_DELETE = "REQUEST_DELETE",
  REQUEST_APPROVE = "REQUEST_APPROVE",
  REQUEST_DENY = "REQUEST_DENY",
  REQUEST_PAY = "REQUEST_PAY",

  USER_LOGOUT = "USER_LOGOUT",
  USER_REGISTER = "USER_REGISTER",

  TWO_FA_VERIFICATION_SUCCESS = "TWO_FA_VERIFICATION_SUCCESS",
  TWO_FA_VERIFICATION_FAILED = "TWO_FA_VERIFICATION_FAILED",
  TWO_FA_GENERATION = "TWO_FA_GENERATION",
}

export interface AuditLog extends mongoose.Document {
  action: string;
  userId: mongoose.Types.ObjectId;
  targetId?: mongoose.Types.ObjectId;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

const auditLogSchema = new mongoose.Schema<AuditLog>({
  action: {
    type: String,
    required: true,
    enum: Object.values(AuditLogAction),
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  changes: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Add index for querying
auditLogSchema.index({ userId: 1, action: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL

export const AuditLogModel = mongoose.model<AuditLog>(
  "AuditLog",
  auditLogSchema
);
