import mongoose, { Document, Schema } from "mongoose";

export interface IComment extends Document {
  authorId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  content?: string;
  image?: string;
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Author ID is required"],
      index: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Post ID is required"],
      index: true,
      validate: {
        validator: async function (postId: mongoose.Types.ObjectId) {
          const postExists = await mongoose.model("Post").findById(postId);
          return postExists !== null;
        },
        message: "Post does not exist",
      },
    },
    image: {
      type: String, 
      trim: true,
      required: false,
    },
    content: {
      type: String,
      trim: true,
      minlength: [1, "Content must be at least 1 character long"],
      maxlength: [1000, "Content cannot exceed 1000 characters"],
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
commentSchema.index({ postId: 1, createdAt: -1 });
commentSchema.index({ authorId: 1, createdAt: -1 });

// Virtual populate for author details
commentSchema.virtual("author", {
  ref: "User",
  localField: "authorId",
  foreignField: "_id",
  justOne: true,
});

// Virtual populate for post details
commentSchema.virtual("post", {
  ref: "Post",
  localField: "postId",
  foreignField: "_id",
  justOne: true,
});

// Ensure virtuals are included in JSON output
commentSchema.set("toJSON", { virtuals: true });
commentSchema.set("toObject", { virtuals: true });
// Virtual for likes count
commentSchema.virtual("likesCount").get(function () {
  return this.likes.length;
});
// Pre-save middleware to ensure post exists
commentSchema.pre("save", async function (next) {
  try {
    const post = await mongoose.model("Post").findById(this.postId);
    if (!post) {
      throw new Error("Post does not exist");
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

export const CommentModel = mongoose.model<IComment>("Comment", commentSchema);
