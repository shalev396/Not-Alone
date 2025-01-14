import mongoose from "mongoose";

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
    enum: [
      "USER_CREATE",
      "USER_LOGIN",
      "USER_LOGIN_FAILED",
      "USER_UPDATE",
      "USER_DELETE",
      "USER_APPROVE",
      "USER_DENY",
      "USER_ACCESS",
      "ADMIN_ACTION",
      "CITY_CREATE",
      "CITY_UPDATE",
      "CITY_DELETE",
      "CITY_APPROVE",
      "CITY_DENY",
      "CITY_JOIN",
    ],
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

export const AuditLogModel = mongoose.model<AuditLog>(
  "AuditLog",
  auditLogSchema
);
