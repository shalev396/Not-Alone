import mongoose, { Schema, Document } from "mongoose";

export interface IChannel extends Document {
  name: string;
  type: "direct" | "group" | "eatup";
  members: mongoose.Types.ObjectId[];
  eatupId?: mongoose.Types.ObjectId;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const channelSchema = new Schema<IChannel>(
  {
    name: {
      type: String,
      required: [true, "Channel name is required"],
      trim: true,
      minlength: [2, "Channel name must be at least 2 characters long"],
      maxlength: [50, "Channel name cannot exceed 50 characters"],
    },
    type: {
      type: String,
      required: [true, "Channel type is required"],
      enum: {
        values: ["direct", "group", "eatup"],
        message: "Invalid channel type. Must be one of: direct, group, eatup",
      },
    },
    members: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      required: [true, "Channel must have members"],
      validate: {
        validator: function (members: mongoose.Types.ObjectId[]) {
          // Direct channels must have exactly 2 members
          if (this.type === "direct" && members.length !== 2) {
            return false;
          }
          // Group channels must have at least 2 members
          if (this.type === "group" && members.length < 2) {
            return false;
          }
          // Eatup channels must have at least 1 member
          if (this.type === "eatup" && members.length < 1) {
            return false;
          }
          return true;
        },
        message: "Invalid number of members for channel type",
      },
    },
    eatupId: {
      type: Schema.Types.ObjectId,
      ref: "Eatup",
      required: [
        function (this: IChannel) {
          return this.type === "eatup";
        },
        "Eatup ID is required for eatup channels",
      ],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
channelSchema.index({ members: 1 });
channelSchema.index({ eatupId: 1 }, { sparse: true });
channelSchema.index({ type: 1 });

// Virtual populate for members
channelSchema.virtual("memberDetails", {
  ref: "User",
  localField: "members",
  foreignField: "_id",
});

// Virtual populate for eatup
channelSchema.virtual("eatupDetails", {
  ref: "Eatup",
  localField: "eatupId",
  foreignField: "_id",
  justOne: true,
});

// Ensure virtuals are included in JSON output
channelSchema.set("toJSON", { virtuals: true });
channelSchema.set("toObject", { virtuals: true });

export const ChannelModel = mongoose.model<IChannel>("Channel", channelSchema);
