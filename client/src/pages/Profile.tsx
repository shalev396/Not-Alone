import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/Redux/store";
import { updateUser } from "@/Redux/userSlice";
import ProfileImageDialog from "@/components/profile/ProfileImageDialog";
import Checkbox from "@/components/custom-ui/Checkbox";
import { Navbar } from "@/components/shared/Navbar";
import { Filter } from "bad-words";
import { api, fetchUserPosts } from "@/api/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { PostCard } from "@/components/social/PostCard";
import { PostSkeleton } from "@/components/shared/feeds/PostFeed";
import { useEffect } from "react";

type DonationRequest = {
  _id: string;
  soldierId: string;
  content: string;
  amountNeeded: number;
  amountRaised: number;
  createdAt: Date;
  updatedAt: Date;
};

type Post = {
  _id: string;
  authorId: string;
  content: string;
  media: string;
  likes: string[];
  createdAt: Date;
  updatedAt: Date;
  author: {
    firstName: string;
    lastName: string;
    profileImage?: string;
    nickname?: string;
  };
  comments: Array<{
    author: string;
    nickname: string;
    profileImage?: string;
    text: string;
    createdAt: Date | string;
  }>;
};

const Profile: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const NICKNAME_OPTIONS = [
    "May", "Lily", "Blue", "Bird", "Dudu", "Sofy", "Pedro", "Ana", "Lia", "Leo",
    "Nina", "Rafa", "Lolo", "Zoe", "Ben", "Téo", "Noah", "Ivy", "Mia", "Theo",
    "Gabi", "Dani", "João", "Cris", "Tina", "Bia", "Luca", "Max", "Yuri", "Luz",
    "Kai", "Fifi", "Titi", "Jade", "Bela", "Vivi", "Lu", "Nico", "Pip", "Sol"
  ];
  
  const DEFAULT_PROFILE_IMAGE =
    "https://api.dicebear.com/7.x/avataaars/svg?seed=default";
  const profileImages = [
    "boy_1.svg",
    "boy_2.svg",
    "boy_3.svg",
    "boy_4.svg",
    "boy_5.svg",
    "boy_6.svg",
    "boy_7.svg",
    "girl_1.svg",
    "girl_2.svg",
    "girl_4.svg",
    "girl_5.svg",
    "girl_6.svg",
  ];
  const getRandomNickname = () => {
    return NICKNAME_OPTIONS[Math.floor(Math.random() * NICKNAME_OPTIONS.length)];
  };
  const [showAlternateTab] = useState(false);

  const [nickname, setNickname] = useState(getRandomNickname()); 
  const [profileImage, setProfileImage] = useState(DEFAULT_PROFILE_IMAGE);
  const [email] = useState(user.email || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [bio, setBio] = useState(user.bio || "");
  
  const [receiveNotifications, setReceiveNotifications] = useState(false);
  
  console.log("[Profile Component Render]:", {
    nickname,
    bio,
    profileImage,
    phone,
    receiveNotifications,
  });
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState("");
  const filter = new Filter();

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const [profileResponse, userResponse] = await Promise.all([
        api.get("/profiles/me"),
        api.get("/users/me"),
      ]);
  
      const profileData = profileResponse.data;
      const userData = userResponse.data.user;

      return {...profileData, phone: userData.phone || ""}
    },
  });
  

  useEffect(() => {
    if (profile) {
      console.log("[useEffect - Profile Received]:", profile);
      setNickname(profile.nickname || getRandomNickname());
      setBio(profile.bio || "");
      setProfileImage(profile.profileImage || DEFAULT_PROFILE_IMAGE);
      setPhone(user.phone || "");
      setReceiveNotifications(profile.receiveNotifications || false);
  
      dispatch(updateUser(profile));
    }
  }, [profile, dispatch]);
  
  useEffect(() => {
    console.log("[State Changed]:", { nickname, bio, profileImage, phone, receiveNotifications });
  }, [nickname, bio, profileImage, phone, receiveNotifications]);
  
  

  const { data: userPosts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ["userPosts", user._id],
    queryFn: () => fetchUserPosts(user._id),
    enabled: !!user._id,
  });

  const { data: donationRequests, isLoading: isLoadingDonations } = useQuery({
    queryKey: ["donationRequests", user._id],
    queryFn: async () => {
      const response = await api.get(`/requests/my`);
      return response.data.requests as DonationRequest[];
    },
    enabled: user.type === "Soldier",
  });

  const handleNicknameChange = (value: string) => {
    if (value === "") {
      setError("Nickname cannot be empty.");
      return;
    }

    const regex = /^[a-zA-Z0-9]{1,20}$/;

    if (filter.isProfane(value)) {
      setError("Inappropriate nickname! Please choose a different one.");
    } else if (!regex.test(value)) {
      setError("Nickname must be alphanumeric and 1-20 characters long.");
    } else {
      setError("");
      setNickname(value);
    }
  };

  const handleRandomNickname = () => {
    const randomNickname =
      NICKNAME_OPTIONS[Math.floor(Math.random() * NICKNAME_OPTIONS.length)];
    setNickname(randomNickname);
    setError(""); 
  };

  const handleSubmit = async () => {
    if (!nickname) {
      setError("Nickname cannot be empty.");
      return;
    }
  
    if (error) {
      alert("Please fix the errors before saving!");
      return;
    }
  
    try {
      const updatedUser = {
        nickname,
        bio,
        profileImage,
        receiveNotifications,
      };
  
      console.log("[handleSubmit - Sending Profile Data]:", updatedUser);
      const profileResponse = await api.put("/profiles/me", updatedUser);
  
      const updatedPhone = { phone };
      console.log("[handleSubmit - Sending Phone Data]:", updatedPhone);
      const phoneResponse = await api.put("/users/me", updatedPhone);
  
      console.log("[handleSubmit - API Responses]:", {
        profile: profileResponse.data,
        phone: phoneResponse.data,
      });
  
      dispatch(
        updateUser({ ...profileResponse.data, phone: phoneResponse.data.phone })
      );
  
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };
  
  

  return (
    <div className="flex bg-background text-foreground min-h-screen">
      <Navbar modes="home" isVertical={true} isAccordion={true} />
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold mb-6 text-center">Profile Page</h1>
          <div className="bg-card p-6 rounded-lg shadow-md">
            {isLoadingProfile ? (
              <PostSkeleton />
            ) : (
              <div>
                <div className="flex items-start space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">
                      Nickname
                    </label>
                    <Input
                      value={nickname}
                      onChange={(e) => handleNicknameChange(e.target.value)}
                      placeholder="Enter a unique nickname"
                    />
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    <p
                      onClick={handleRandomNickname}
                      className="text-xs text-blue-500 mt-1 hover:underline cursor-pointer"
                    >
                      Give me a nickname
                    </p>
                    <label className="block text-sm font-medium mt-4 mb-1">
                      Email
                    </label>
                    <Input value={email} disabled />
                  </div>
                  <div className="flex-shrink-0">
                    <img
                      src={profileImage || DEFAULT_PROFILE_IMAGE}
                      alt="Profile"
                      onClick={() => setIsDialogOpen(true)}
                      className="rounded-full cursor-pointer w-40 h-40 border border-gray-300 hover:border-green-500"
                    />
                    {isDialogOpen && (
                      <ProfileImageDialog
                        profileImages={profileImages}
                        onSelectImage={(img) => setProfileImage(img)}
                        onClose={() => setIsDialogOpen(false)}
                      />
                    )}
                  </div>
                </div>
                <label className="block text-sm font-medium mt-4 mb-1">
                  Phone
                </label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                />
                <label className="block text-sm font-medium mt-4 mb-1">
                  Biography
                </label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Write a short bio"
                  rows={4}
                />
                <div className="flex items-center space-x-2 mt-4">
                  <Checkbox
                    checked={receiveNotifications}
                    onCheckedChange={(checked: boolean) =>
                      setReceiveNotifications(checked)
                    }
                  />
                  <label className="text-sm font-medium">
                    Receive Notifications
                  </label>
                </div>
                <button
                  onClick={handleSubmit}
                  className="mt-4 w-full bg-gradient-to-r from-[#F596D3] to-[#D247BF] text-white py-2 rounded"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
          <div className="mt-14">
            {showAlternateTab ? (
              user.type === "Soldier" ? (
                <div>
                  <h2 className="text-2xl font-bold mb-6">
                    Donation Requests
                  </h2>
                  {isLoadingDonations ? (
                    <PostSkeleton />
                  ) : donationRequests && donationRequests.length > 0 ? (
                    donationRequests.map((request) => (
                      <div
                        key={request._id}
                        className="bg-card p-4 rounded-lg mb-4"
                      >
                        <h3 className="font-bold">{request.content}</h3>
                        <p>Amount Needed: ${request.amountNeeded}</p>
                        <p>Amount Raised: ${request.amountRaised}</p>
                      </div>
                    ))
                  ) : (
                    <p>No donation requests found.</p>
                  )}
                </div>
              ) : (
                <p>You are not authorized to view donation requests.</p>
              )
            ) : (
              <div>
                <h2 className="text-2xl font-bold mb-6">Your Posts</h2>
                {isLoadingPosts ? (
                  <PostSkeleton />
                ) : userPosts && userPosts.posts.length > 0 ? (
                  userPosts.posts.map((post: Post) => (
                    <PostCard key={post._id} post={post} />
                  ))
                ) : (
                  <p>You haven’t posted anything yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
