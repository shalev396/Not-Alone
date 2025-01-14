import { Document, Types } from "mongoose";

export type Zone = "north" | "center" | "south";
export type CityApprovalStatus = "pending" | "approved" | "denied";

export interface City extends Document {
  name: string;
  zone: Zone;
  soldiers: Types.ObjectId[];
  municipalityUsers: Types.ObjectId[];
  media: string[];
  bio: string;
  approvalStatus: CityApprovalStatus;
  approvalDate?: Date;
  denialReason?: string;
  createdAt: Date;
  updatedAt: Date;
}
