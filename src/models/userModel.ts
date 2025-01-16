import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { UserType, ApprovalStatus } from "../types/user";
dotenv.config();

export interface User extends Document {
  firstName: string;
  lastName: string;
  passport: string;
  email: string;
  password: string;
  phone: string;
  type: UserType;
  nickname: string;
  bio: string;
  profileImage: string;
  receiveNotifications: boolean;
  approvalStatus: ApprovalStatus;
  approvalDate?: Date;
  denialReason?: string;
  preferences: {
    language: "en" | "he";
    notifications: boolean;
  };
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    passport: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/.+\@.+\..+/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: [
        "Soldier",
        "Municipality",
        "Donor",
        "Organization",
        "Business",
        "Admin",
      ] as UserType[],
      required: true,
    },
    // Approval fields
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "denied"] as ApprovalStatus[],
      default: "pending",
    },
    approvalDate: {
      type: Date,
    },
    denialReason: {
      type: String,
    },
    preferences: {
      language: {
        type: String,
        default: "en",
        enum: ["en", "he"],
      },
      notifications: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(
      this.password + process.env.PASSWORD_KEY,
      salt
    );
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(
    candidatePassword + process.env.PASSWORD_KEY,
    this.password
  );
};

export const UserModel = mongoose.model<User>("User", userSchema);
