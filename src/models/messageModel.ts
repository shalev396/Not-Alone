import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  channelId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  isEdited: boolean;
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    channelId: {
      type: Schema.Types.ObjectId,
      ref: "Channel",
      required: [true, "Channel ID is required"],
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender ID is required"],
      index: true,
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      minlength: [1, "Message content cannot be empty"],
      maxlength: [5000, "Message content cannot exceed 5000 characters"],
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    readBy: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
      validate: {
        validator: function (readBy: mongoose.Types.ObjectId[]) {
          // Ensure unique user IDs in readBy array
          const uniqueIds = new Set(readBy.map((id) => id.toString()));
          return uniqueIds.size === readBy.length;
        },
        message: "Duplicate user IDs in readBy array",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
messageSchema.index({ channelId: 1, createdAt: -1 }); // For fetching channel messages
messageSchema.index({ sender: 1, createdAt: -1 }); // For fetching user messages
messageSchema.index({ readBy: 1 }); // For querying unread messages

// Virtual populate for sender details
messageSchema.virtual("senderDetails", {
  ref: "User",
  localField: "sender",
  foreignField: "_id",
  justOne: true,
});

// Virtual populate for channel details
messageSchema.virtual("channelDetails", {
  ref: "Channel",
  localField: "channelId",
  foreignField: "_id",
  justOne: true,
});

// Virtual populate for readBy details
messageSchema.virtual("readByDetails", {
  ref: "User",
  localField: "readBy",
  foreignField: "_id",
});

// Ensure virtuals are included in JSON output
messageSchema.set("toJSON", { virtuals: true });
messageSchema.set("toObject", { virtuals: true });

export const MessageModel = mongoose.model<IMessage>("Message", messageSchema);
