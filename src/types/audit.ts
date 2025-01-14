import { Document } from "mongoose";

export type AuditAction =
  | "USER_CREATE"
  | "USER_LOGIN"
  | "USER_LOGIN_FAILED"
  | "USER_UPDATE"
  | "USER_DELETE"
  | "USER_APPROVE"
  | "USER_DENY"
  | "USER_ACCESS"
  | "ADMIN_ACTION"
  | "CITY_CREATE"
  | "CITY_JOIN"
  | "CITY_UPDATE";

export interface AuditLog extends Document {
  action: AuditAction;
  userId: string;
  targetId?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}
