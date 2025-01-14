import mongoose from "mongoose";

const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    zone: {
      type: String,
      required: true,
      enum: ["north", "center", "south"],
    },
    soldiers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    municipalityUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    media: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      required: true,
      trim: true,
    },
    approvalStatus: {
      type: String,
      required: true,
      enum: ["pending", "approved", "denied"],
      default: "pending",
    },
    approvalDate: {
      type: Date,
    },
    denialReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Define indexes separately
citySchema.index({ name: 1 }, { unique: true });
citySchema.index({ zone: 1 });
citySchema.index({ soldiers: 1 });
citySchema.index({ municipalityUsers: 1 });
citySchema.index({ approvalStatus: 1 });

export const CityModel = mongoose.model("City", citySchema);
