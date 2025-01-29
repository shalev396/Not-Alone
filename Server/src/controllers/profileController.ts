import { Request, Response } from "express";
import mongoose from "mongoose";
import { ProfileModel } from "../models/profileModel";
import { UserModel } from "../models/userModel";

interface UserInfo {
  userId: string;
  type: string;
}

const ensureUser = (req: Request, res: Response): UserInfo | undefined => {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required" });
    return undefined;
  }
  return { userId: req.user.userId, type: req.user.type };
};

const canAccessProfile = async (
  userId: string,
  userType: string,
  profileUserId: string
): Promise<boolean> => {
  // Admins can access everything
  if (userType === "Admin") return true;

  // Users can access their own profile
  if (userId === profileUserId) return true;

  const profile = await ProfileModel.findOne({ userId: profileUserId }).lean();
  if (!profile) return false;

  // Check visibility settings
  if (profile.visibility === "public") return true;
  return userId === profileUserId; // Private profiles only visible to owner
};

// Get my profile
export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    const profile = await ProfileModel.findOne({ userId: userInfo.userId })
      .populate("user", "-password")
      .lean();

    if (!profile) {
      const newProfile = await ProfileModel.create({
        userId: userInfo.userId,
        visibility: "public",
      });

      console.log("[Created New Profile]:", newProfile);

      return res.json(
        await ProfileModel.findById(newProfile._id)
          .populate("user", "-password")
          .lean()
      );
    }

    console.log("[Returning Profile]:", profile);
    return res.json(profile);
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ message: "Error fetching profile" });
  }
};



// Get profile by user ID
export const getProfileByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const hasAccess = await canAccessProfile(
      userInfo.userId,
      userInfo.type,
      userId
    );
    if (!hasAccess) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this profile" });
    }

    const profile = await ProfileModel.findOne({ userId })
      .populate("user", "-password")
      .lean();
      console.log("[getMyProfile] Found Profile:", profile);

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.json(profile);
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ message: "Error fetching profile" });
  }
};

export const updateMyProfile = async (req: Request, res: Response) => {
  try {
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    let profile = await ProfileModel.findOne({ userId: userInfo.userId });

    if (!profile) {
      const newProfile = ProfileModel.create({
        userId: userInfo.userId,
        nickname: req.body.nickname || "", 
        bio: req.body.bio || "", 
        profileImage: req.body.profileImage || "", 
        visibility: "public", 
        receiveNotifications: req.body.receiveNotifications || false,
      });
      return res.json(newProfile);
    } else{

      
      if (req.body.nickname) profile.nickname = req.body.nickname;
      if (req.body.bio) profile.bio = req.body.bio;
      if (req.body.profileImage) profile.profileImage = req.body.profileImage;
      if (req.body.receiveNotifications !== undefined) {
        profile.receiveNotifications = req.body.receiveNotifications;
      }
      
      await profile.save();
      
      const updatedProfile = await ProfileModel.findById(profile._id)
      .populate("user", "-password")
      .lean();
      
      return res.json(updatedProfile);
    }
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return res.status(400).json({
          errors: Object.values(error.errors).map((err) => ({
            field: err.path,
          message: err.message,
        })),
      });
    }
    return res.status(500).json({ message: "Error updating profile" });
  }
};






// Update user's profile (admin only)
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const userInfo = ensureUser(req, res);
    if (!userInfo) return;

    if (userInfo.type !== "Admin") {
      return res
        .status(403)
        .json({ message: "Only admins can update other profiles" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const profile = await ProfileModel.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Don't allow updates to userId
    delete req.body.userId;

    const updatedProfile = await ProfileModel.findByIdAndUpdate(
      profile._id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate("user", "-password");

    return res.json(updatedProfile);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({
        errors: Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }
    return res.status(500).json({ message: "Error updating profile" });
  }
};
