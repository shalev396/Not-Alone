import mongoose, { Document, Schema } from "mongoose";

export interface ICity extends Document {
  name: string;
  zone: string;
  soldiers: mongoose.Types.ObjectId[];
  municipalityUsers: mongoose.Types.ObjectId[];
  media: string[];
  bio: string;
  approvalStatus: "pending" | "approved" | "denied";
  approvalDate?: Date;
  denialReason?: string;
  pendingJoins: {
    userId: mongoose.Types.ObjectId;
    type: "Soldier" | "Municipality";
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const citySchema = new Schema<ICity>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    zone: {
      type: String,
      required: true,
      enum: ["north", "south", "center"],
    },
    soldiers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true,
      },
    ],
    municipalityUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true,
      },
    ],
    media: [String],
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, "Bio cannot exceed 1000 characters"],
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "denied"],
      default: "pending",
      index: true,
    },
    approvalDate: Date,
    denialReason: String,
    pendingJoins: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
          index: true,
        },
        type: {
          type: String,
          enum: ["Soldier", "Municipality"],
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const CityModel = mongoose.model<ICity>("City", citySchema);
