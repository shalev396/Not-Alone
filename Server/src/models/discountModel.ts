import mongoose, { Document, Schema } from "mongoose";

export interface IDiscount extends Document {
  title: string;
  category: "Health & Wellness" | "Clothes" | "Gear & Equipment" | "Electronics" | "Entertainment" | "Home";
  description?: string;
  media: string[];
  owner: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const discountSchema = new Schema<IDiscount>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Health & Wellness",
        "Clothes",
        "Gear & Equipment",
        "Electronics",
        "Entertainment",
        "Home",
      ],
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
        validator: (v: string[]) => v.length <= 10,
        message: "Cannot exceed 10 media items",
      },
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

discountSchema.index({ owner: 1 });
discountSchema.set("toJSON", { virtuals: true });
discountSchema.set("toObject", { virtuals: true });

export const DiscountModel = mongoose.model<IDiscount>("Discount", discountSchema);
