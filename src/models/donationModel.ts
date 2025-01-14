import mongoose, { Document, Schema } from "mongoose";

export interface IDonation extends Document {
  city: Schema.Types.ObjectId;
  address: string;
  category: "Furniture" | "Clothes" | "Electricity" | "Army Equipments";
  donorId: Schema.Types.ObjectId;
  title: string;
  description?: string;
  media: string[];
  status: "pending" | "assigned" | "delivery" | "arrived";
  assignedTo?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const donationSchema = new Schema<IDonation>(
  {
    city: {
      type: Schema.Types.ObjectId,
      ref: "City",
      required: [true, "City is required"],
      index: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      minlength: [5, "Address must be at least 5 characters long"],
      maxlength: [200, "Address cannot exceed 200 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["Furniture", "Clothes", "Electricity", "Army Equipments"],
        message: "{VALUE} is not a valid category",
      },
      index: true,
    },
    donorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Donor ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    media: {
      type: [String],
      default: [],
      validate: {
        validator: function (v: string[]) {
          return v.length <= 10; // Maximum 10 media items
        },
        message: "Cannot exceed 10 media items",
      },
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["pending", "assigned", "delivery", "arrived"],
        message: "{VALUE} is not a valid status",
      },
      default: "pending",
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
donationSchema.index({ category: 1, city: 1 });
donationSchema.index({ donorId: 1, createdAt: -1 });
donationSchema.index({ status: 1, city: 1 });

// Virtual populate for donor details
donationSchema.virtual("donor", {
  ref: "User",
  localField: "donorId",
  foreignField: "_id",
  justOne: true,
});

// Virtual populate for city details
donationSchema.virtual("cityDetails", {
  ref: "City",
  localField: "city",
  foreignField: "_id",
  justOne: true,
});

// Virtual populate for assigned soldier details
donationSchema.virtual("assignedSoldier", {
  ref: "User",
  localField: "assignedTo",
  foreignField: "_id",
  justOne: true,
});

// Ensure virtuals are included in JSON output
donationSchema.set("toJSON", { virtuals: true });
donationSchema.set("toObject", { virtuals: true });

export const DonationModel = mongoose.model<IDonation>(
  "Donation",
  donationSchema
);
