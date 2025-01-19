import mongoose, { Document, Schema } from "mongoose";

export interface IEatup extends Document {
  city: Schema.Types.ObjectId;
  title: string;
  authorId: Schema.Types.ObjectId;
  media: string[];
  date: Date;
  kosher: boolean;
  description: string;
  languages: string[];
  hosting: "organization" | "donators" | "city";
  limit: number;
  guests: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const eatupSchema = new Schema<IEatup>(
  {
    city: {
      type: Schema.Types.ObjectId,
      ref: "City",
      required: false,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author ID is required"],
      index: true,
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
    date: {
      type: Date,
      required: [true, "Date is required"],
      validate: {
        validator: function (v: Date) {
          return v > new Date(); // Date must be in the future
        },
        message: "Date must be in the future",
      },
      index: true,
    },
    kosher: {
      type: Boolean,
      required: [true, "Kosher status is required"],
      default: false,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters long"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    languages: {
      type: [String],
      required: [true, "At least one language is required"],
      validate: {
        validator: function (v: string[]) {
          return v.length > 0 && v.length <= 5; // 1-5 languages
        },
        message: "Must specify between 1 and 5 languages",
      },
    },
    hosting: {
      type: String,
      required: [true, "Hosting type is required"],
      enum: {
        values: ["organization", "donators", "city"],
        message: "{VALUE} is not a valid hosting type",
      },
      index: true,
    },
    limit: {
      type: Number,
      required: [true, "Guest limit is required"],
      min: [2, "Minimum 2 guests required"],
      max: [100, "Cannot exceed 100 guests"],
    },
    guests: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
      validate: {
        validator: function (v: Schema.Types.ObjectId[]) {
          return v.length <= this.limit; // Cannot exceed guest limit
        },
        message: "Cannot exceed guest limit",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
eatupSchema.index({ city: 1, date: 1 });
eatupSchema.index({ authorId: 1, date: 1 });
eatupSchema.index({ hosting: 1, city: 1 });

// Virtual populate for author details
eatupSchema.virtual("author", {
  ref: "User",
  localField: "authorId",
  foreignField: "_id",
  justOne: true,
});

// Virtual populate for city details
eatupSchema.virtual("cityDetails", {
  ref: "City",
  localField: "city",
  foreignField: "_id",
  justOne: true,
});

// Virtual populate for guest details
eatupSchema.virtual("guestDetails", {
  ref: "User",
  localField: "guests",
  foreignField: "_id",
});

// Virtual for available spots
eatupSchema.virtual("availableSpots").get(function () {
  return this.limit - this.guests.length;
});

// Virtual for isFull
eatupSchema.virtual("isFull").get(function () {
  return this.guests.length >= this.limit;
});

// Ensure virtuals are included in JSON output
eatupSchema.set("toJSON", { virtuals: true });
eatupSchema.set("toObject", { virtuals: true });

export const EatupModel = mongoose.model<IEatup>("Eatup", eatupSchema);
