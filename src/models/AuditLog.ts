import mongoose, { Document, Schema } from "mongoose";

export interface AuditLog extends Document {
  action: string;
  userId: string;
  targetId?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

const auditLogSchema = new Schema({
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
    ],
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: "User",
  },
  targetId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  changes: {
    type: Schema.Types.Mixed,
  },
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Index for better query performance
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });

export const AuditLog = mongoose.model<AuditLog>("AuditLog", auditLogSchema);
