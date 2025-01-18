import { Document } from "mongoose";

export type UserType =
  | "Admin"
  | "Soldier"
  | "Municipality"
  | "Donor"
  | "Organization"
  | "Business";

export type ApprovalStatus = "pending" | "approved" | "denied";

export interface User extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  nickname?: string;
  bio?: string;
  profileImage?: string | null;
  type: UserType;
  approvalStatus: ApprovalStatus;
  denialReason?: string;
  receiveNotifications: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface UserFilter {
  type?: UserType;
  approvalStatus?: ApprovalStatus;
  search?: string;
}

export interface UserUpdates {
  firstName?: string;
  lastName?: string;
  phone?: string;
  nickname?: string;
  bio?: string;
  profileImage?: string | null;
  receiveNotifications?: boolean;
  approvalStatus?: ApprovalStatus;
  denialReason?: string;
}
