import mongoose, { Document, Schema } from "mongoose";

export interface IBusiness extends Document {
  name: string;
  slogan: string;
  media: string[];
  owner: Schema.Types.ObjectId;
  workers: Schema.Types.ObjectId[];
  discounts: Schema.Types.ObjectId[];
  status: "pending" | "approved" | "denied";
  pendingWorkers: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const businessSchema = new Schema<IBusiness>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [100, "Name cannot exceed 100 characters"],
      unique: true,
    },
    slogan: {
      type: String,
      required: [true, "Slogan is required"],
      trim: true,
      minlength: [5, "Slogan must be at least 5 characters long"],
      maxlength: [200, "Slogan cannot exceed 200 characters"],
    },
    media: {
      type: [String],
      default: [],
      validate: {
        validator: function (v: string[]) {
          return v.length <= 10;
        },
        message: "Cannot exceed 10 media items",
      },
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
      validate: {
        validator: async function (userId: Schema.Types.ObjectId) {
          const User = mongoose.model("User");
          const user = await User.findById(userId);
          return user?.type === "Business";
        },
        message: "Owner must be a business type user",
      },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "denied"],
      default: "pending",
      required: true,
    },
    workers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        validate: {
          validator: async function (userId: Schema.Types.ObjectId) {
            const User = mongoose.model("User");
            const user = await User.findById(userId);
            return user?.type === "Business";
          },
          message: "Worker must be a business type user",
        },
      },
    ],
    pendingWorkers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        validate: {
          validator: async function (userId: Schema.Types.ObjectId) {
            const User = mongoose.model("User");
            const user = await User.findById(userId);
            return user?.type === "Business";
          },
          message: "Pending worker must be a business type user",
        },
      },
    ],
    discounts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Discount",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
businessSchema.index({ name: 1 }, { unique: true });
businessSchema.index({ owner: 1 });
businessSchema.index({ workers: 1 });
businessSchema.index({ status: 1 });

// Virtual populate for owner details
businessSchema.virtual("ownerDetails", {
  ref: "User",
  localField: "owner",
  foreignField: "_id",
  justOne: true,
});

// Virtual populate for worker details
businessSchema.virtual("workerDetails", {
  ref: "User",
  localField: "workers",
  foreignField: "_id",
});

// Virtual populate for pending worker details
businessSchema.virtual("pendingWorkerDetails", {
  ref: "User",
  localField: "pendingWorkers",
  foreignField: "_id",
});

// Virtual populate for discount details
businessSchema.virtual("discountDetails", {
  ref: "Discount",
  localField: "discounts",
  foreignField: "_id",
});

// Virtual for active discounts only
businessSchema.virtual("activeDiscounts", {
  ref: "Discount",
  localField: "discounts",
  foreignField: "_id",
  match: { expireDate: { $gt: new Date() } },
});

// Ensure virtuals are included in JSON output
businessSchema.set("toJSON", { virtuals: true });
businessSchema.set("toObject", { virtuals: true });

export const BusinessModel = mongoose.model<IBusiness>(
  "Business",
  businessSchema
);
