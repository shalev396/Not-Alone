import mongoose, { Document, Schema } from "mongoose";

export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId;
  nickname: string;
  bio: string;
  profileImage: string;
  visibility: "public" | "private";
  createdAt: Date;
  updatedAt: Date;
}

const profileSchema = new Schema<IProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    nickname: {
      type: String,
      trim: true,
      maxlength: [30, "Nickname cannot exceed 30 characters"],
      index: true,
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
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
  },
  {
    timestamps: true,
  }
);

// Virtual populate for user details
profileSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

export const ProfileModel = mongoose.model<IProfile>("Profile", profileSchema);
