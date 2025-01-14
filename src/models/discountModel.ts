import mongoose, { Document, Schema } from "mongoose";

export interface IDiscount extends Document {
  name: string;
  discount: string;
  expireDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const discountSchema = new Schema<IDiscount>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    discount: {
      type: String,
      required: [true, "Discount is required"],
      trim: true,
      minlength: [1, "Discount must be at least 1 character long"],
      maxlength: [50, "Discount cannot exceed 50 characters"],
    },
    expireDate: {
      type: Date,
      required: [true, "Expiration date is required"],
      validate: {
        validator: function (v: Date) {
          return v > new Date(); // Expiration date must be in the future
        },
        message: "Expiration date must be in the future",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying active discounts
discountSchema.index({ expireDate: 1 });

// Virtual for checking if discount is expired
discountSchema.virtual("isExpired").get(function () {
  return this.expireDate < new Date();
});

// Ensure virtuals are included in JSON output
discountSchema.set("toJSON", { virtuals: true });
discountSchema.set("toObject", { virtuals: true });

export const DiscountModel = mongoose.model<IDiscount>(
  "Discount",
  discountSchema
);
