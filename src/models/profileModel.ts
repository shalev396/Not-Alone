import mongoose, { Document, Schema } from "mongoose";
import { UserType } from "../types/user";

export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId;
  nickname: string;
  bio: string;
  profileImage: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
  preferences: {
    language: string;
    notifications: boolean;
    emailUpdates: boolean;
    visibility: "public" | "private" | "friends";
  };
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

const profileSchema = new Schema<IProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    nickname: {
      type: String,
      trim: true,
      maxlength: [30, "Nickname cannot exceed 30 characters"],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    profileImage: {
      type: String,
      default: "",
    },
    socialLinks: {
      facebook: String,
      instagram: String,
      linkedin: String,
      twitter: String,
    },
    preferences: {
      language: {
        type: String,
        default: "en",
        enum: ["en", "he"],
      },
      notifications: {
        type: Boolean,
        default: true,
      },
      emailUpdates: {
        type: Boolean,
        default: true,
      },
      visibility: {
        type: String,
        enum: ["public", "private", "friends"],
        default: "public",
      },
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
profileSchema.index({ userId: 1 }, { unique: true });
profileSchema.index({ nickname: 1 });

// Virtual populate for user details
profileSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

// Ensure virtuals are included in JSON output
profileSchema.set("toJSON", { virtuals: true });
profileSchema.set("toObject", { virtuals: true });

export const ProfileModel = mongoose.model<IProfile>("Profile", profileSchema);
