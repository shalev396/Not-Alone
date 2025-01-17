import mongoose, { Document, Schema } from "mongoose";

export interface IPost extends Document {
  authorId: mongoose.Types.ObjectId;
  content: string;
  media: string[];
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author ID is required"],
      index: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
      minlength: [1, "Content must be at least 1 character long"],
      maxlength: [2000, "Content cannot exceed 2000 characters"],
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
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
postSchema.index({ authorId: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

// Virtual populate for author details
postSchema.virtual("author", {
  ref: "User",
  localField: "authorId",
  foreignField: "_id",
  justOne: true,
});

// Virtual populate for comments
postSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "postId",
});

// Virtual for likes count
postSchema.virtual("likesCount").get(function () {
  return this.likes.length;
});

// Virtual for comments count (requires population)
postSchema.virtual("commentsCount", {
  ref: "Comment",
  localField: "_id",
  foreignField: "postId",
  count: true,
});

// Ensure virtuals are included in JSON output
postSchema.set("toJSON", { virtuals: true });
postSchema.set("toObject", { virtuals: true });

export const PostModel = mongoose.model<IPost>("Post", postSchema);
