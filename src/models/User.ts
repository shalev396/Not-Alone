import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config()
export interface User extends Document {
  firstName: string;
  lastName: string;
  passport: string;
  email: string;
  password: string;
  phone: string;
  type: string;
  nickname: string;
  bio: string;
  profileImage: string;
  receiveNotifications: boolean;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  passport: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/.+\@.+\..+/, "Please enter a valid email address"],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: [
      "Soldier",
      "Municipality",
      "Donor",
      "Organization",
      "Business",
      "Admin",
    ],
    required: true,
  },
  // Additional fields for Profile
  nickname: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "",
  },
  profileImage: {
    type: String,
    default: "",
  },
  receiveNotifications: {
    type: Boolean,
    default: false,
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(
      this.password + process.env.PASSWORD_KEY,
      salt
    );
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(
    candidatePassword + process.env.PASSWORD_KEY,
    this.password
  );
};

export const User = mongoose.model<User>("User", userSchema);
