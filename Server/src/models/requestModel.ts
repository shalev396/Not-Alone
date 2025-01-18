import mongoose, { Document, Schema } from "mongoose";

export interface IRequest extends Document {
  authorId: mongoose.Types.ObjectId;
  service: "Regular" | "Reserves";
  item: string;
  itemDescription: string;
  quantity: number;
  zone: "north" | "center" | "south";
  city: mongoose.Types.ObjectId;
  agreeToShareDetails: boolean;
  status: "approved" | "deny" | "in process";
  paid: boolean;
  paidBy?: mongoose.Types.ObjectId;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const requestSchema = new Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author ID is required"],
      index: true,
    },
    service: {
      type: String,
      enum: {
        values: ["Regular", "Reserves"],
        message: "Service must be either 'Regular' or 'Reserves'",
      },
      required: [true, "Service type is required"],
    },
    item: {
      type: String,
      required: [true, "Item title is required"],
      trim: true,
      minlength: [2, "Item title must be at least 2 characters long"],
      maxlength: [100, "Item title cannot exceed 100 characters"],
    },
    itemDescription: {
      type: String,
      required: [true, "Item description is required"],
      trim: true,
      minlength: [10, "Item description must be at least 10 characters long"],
      maxlength: [1000, "Item description cannot exceed 1000 characters"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number",
      },
    },
    zone: {
      type: String,
      enum: {
        values: ["north", "center", "south"],
        message: "Zone must be either 'north', 'center', or 'south'",
      },
      required: [true, "Zone is required"],
      index: true,
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
      required: [true, "City is required"],
      index: true,
      validate: {
        validator: async function (cityId: mongoose.Types.ObjectId) {
          const cityExists = await mongoose.model("City").findById(cityId);
          return cityExists !== null;
        },
        message: "Selected city does not exist",
      },
    },
    agreeToShareDetails: {
      type: Boolean,
      required: [true, "Agreement to share details is required"],
      validate: {
        validator: function (value: boolean) {
          return value === true;
        },
        message: "You must agree to share details",
      },
    },
    status: {
      type: String,
      enum: {
        values: ["approved", "deny", "in process"],
        message: "Status must be either 'approved', 'deny', or 'in process'",
      },
      default: "in process",
      required: true,
      index: true,
    },
    paid: {
      type: Boolean,
      default: false,
      index: true,
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for common queries
requestSchema.index({ authorId: 1, status: 1 });
requestSchema.index({ zone: 1, status: 1 });
requestSchema.index({ city: 1, status: 1 });
requestSchema.index({ createdAt: -1 });

// Pre-save middleware to ensure city and zone match
requestSchema.pre("save", async function (next) {
  try {
    const city = await mongoose.model("City").findById(this.city);
    if (city && city.zone !== this.zone) {
      throw new Error("City zone does not match request zone");
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Virtual populate for author details
requestSchema.virtual("author", {
  ref: "User",
  localField: "authorId",
  foreignField: "_id",
  justOne: true,
});

// Virtual populate for city details
requestSchema.virtual("cityDetails", {
  ref: "City",
  localField: "city",
  foreignField: "_id",
  justOne: true,
});

export const RequestModel = mongoose.model<IRequest>("Request", requestSchema);
