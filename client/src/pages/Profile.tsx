import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/Redux/store";
import { updateUser } from "@/Redux/userSlice";
import ProfileImageDialog from "@/components/profile/ProfileImageDialog";
import Checkbox from "@/components/custom-ui/Checkbox";
import { Navbar } from "@/components/shared/Navbar";
import { Filter } from "bad-words";
import { api, fetchUserPosts } from "@/api/api";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { PostCard } from "@/components/social/PostCard";
import { PostSkeleton } from "@/components/shared/feeds/PostFeed";

interface Request {
  _id: string;
  service: "Regular" | "Reserves";
  item: string;
  itemDescription: string;
  quantity: number;
  zone: "north" | "center" | "south";
  city: string;
  cityDetails: {
    name: string;
    zone: string;
  };
  status: "approved" | "deny" | "in process";
  paid: boolean;
  paidBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

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
    const dispatch = useDispatch();
    const [loadingProfile, setLoadingProfile] = useState(true);
  
    const [nickname, setNickname] = useState("");
    const [profileImage, setProfileImage] = useState("");
    const [bio, setBio] = useState("");
    const [receiveNotifications, setReceiveNotifications] = useState(false);
    const getStatusColor = (status: Request["status"]) => {
      switch (status) {
        case "approved":
          return "bg-green-500";
        case "deny":
          return "bg-red-500";
        default:
          return "bg-yellow-500";
      }
    };
  
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    useEffect(() => {
      const fetchProfile = async () => {
        try {
          setLoadingProfile(true);
  
          const response = await api.get("/profiles/me");

          console.log("profile data brought from API:", response.data); 

          const { nickname, profileImage, bio, receiveNotifications } =
            response.data;
  
          setNickname(nickname || "");
          setProfileImage(profileImage || DEFAULT_PROFILE_IMAGE);
          setBio(bio || "");
          setReceiveNotifications(receiveNotifications || false);
  
          dispatch(updateUser(response.data)); 
        } catch (error) {
          console.error("Error fetching profile:", error);
        } finally {
          setLoadingProfile(false);
        }
      };
  
      fetchProfile();
    }, [dispatch]);

  const user = useSelector((state: RootState) => state.user);
  const NICKNAME_OPTIONS = [
    "May", "Lily", "Blue", "Bird", "Dudu", "Sofy", "Pedro", "Ana", "Lia", "Leo",
    "Nina", "Rafa", "Lolo", "Zoe", "Ben", "Téo", "Noah", "Ivy", "Mia", "Theo",
    "Gabi", "Dani", "João", "Cris", "Tina", "Bia", "Luca", "Max", "Yuri", "Luz",
    "Kai", "Fifi", "Titi", "Jade", "Bela", "Vivi", "Lu", "Nico", "Pip", "Sol"
  ];
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
  const DEFAULT_PROFILE_IMAGE =
  "boy_1.svg";
  const getRandomNickname = () => {
    return NICKNAME_OPTIONS[Math.floor(Math.random() * NICKNAME_OPTIONS.length)];
  };

  const [showAlternateTab, setShowAlternateTab] = useState(false);
  console.log("User from Redux:", user);

  console.log("[Profile Component Render]:", {
    nickname,
    bio,
    profileImage,
    receiveNotifications,
  });

  console.log("ID do usuário:", user._id);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const filter = new Filter();

  // const [isSaving, setIsSaving] = useState(false);
  
  const isSoldier = user.type === "Soldier"; 
  
  const [email] = useState(user.email || "");
  const [phone, setPhone] = useState(user.phone || "");

  
  const { data: userPosts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ["userPosts", user._id], 
    queryFn: () => fetchUserPosts(user._id),
    enabled: !!user._id, 
  });

  console.log("Posts recived from React Query:", userPosts);

  const { data: soldierRequests, isLoading: isLoadingSoldierRequests } = useQuery({
    queryKey: ["soldierRequests", user._id],
    queryFn: async () => {
      const response = await api.get(`/requests/user/${user._id}`); 
      console.log("Donation Requests recived from API:", response.data.requests);
      return response.data.requests;
    },
    enabled: !!user._id, 
  });

  console.log("Donation Requests recived from React Query:", soldierRequests); 

  const handleNicknameChange = (value: string) => {
    if (value === "") {
      setError("");
      setNickname(value);
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

  const handleSubmit = async () => {
    if (!nickname) {
      setError("Nickname cannot be empty.");
      return;
    }

    if (error) {
      alert("Please fix the errors before saving!");
      return;
    }

    setLoading(true);

    try {
      const profileUpdate = {
        nickname,
        bio,
        email,
        profileImage,
        receiveNotifications,
      };

      const profileResponse = await api.put("/profiles/me", profileUpdate);

      const phoneUpdate = { phone };
      const phoneResponse = phone ? await api.put("/users/me", phoneUpdate) : null;
      dispatch(
        updateUser({
          ...profileResponse.data,
          ...(phoneResponse ? { phone: phoneResponse.data.phone } : {}),
        })
      );
  
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-background text-foreground min-h-screen">
      <Navbar modes="home" isVertical={true} isAccordion={true} />
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold mb-6 text-center">
            <span className="bg-gradient-to-r text-green-500 bg-clip-text">
              Profile
            </span>{" "}
            Page
          </h1>
  
          <div className="bg-card p-6 rounded-lg shadow-md">
            <div className="flex items-start space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Nickname</label>
                <Input
                  value={nickname}
                  onChange={(e) => handleNicknameChange(e.target.value)}
                  placeholder="Enter a unique nickname"
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <label className="block text-sm font-medium mt-6 mb-1">Email</label>
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
  
            <label className="block text-sm font-medium mt-4 mb-1">Phone</label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
            />
            <label className="block text-sm font-medium mt-4 mb-1">Biography</label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a short bio"
              rows={4}
            />
            <div className="mt-4">
              <Checkbox
                checked={receiveNotifications}
                onCheckedChange={(checked: boolean) =>
                  setReceiveNotifications(checked)
                }
              />
            </div>
  
            <button
              onClick={handleSubmit}
              className="mt-4 w-full bg-gradient-to-r from-[#F596D3] to-[#D247BF] text-white py-2 rounded"
            >
              Save Changes
            </button>
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-secundary"></div>
            ) : (
              ""
            )}
          </div>
  
          <div className="flex space-x-4 mt-14 mb-18">
            <button
              onClick={() => setShowAlternateTab(false)}
              className={`font-bold text-green-500 hover:cursor-pointer ${
                !showAlternateTab ? "underline" : ""
              }`}
            >
              Posts
            </button>
            <button
              onClick={() => setShowAlternateTab(true)}
              className={`font-bold text-green-500 hover:cursor-pointer ${
                showAlternateTab ? "underline" : ""
              }`}
            >
              {isSoldier ? "Donation Requests" : "Donations"}
            </button>
          </div>
  
          {showAlternateTab ? (
            isSoldier ? (
              <div>
                <h2 className="text-2xl font-bold mb-6">Your Donation Requests</h2>
                {isLoadingSoldierRequests ? (
                  <PostSkeleton />
                ) : soldierRequests && soldierRequests.length > 0 ? (
                  soldierRequests.map((request: any) => (
                    <Card key={request._id} className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold mb-2">
                            {request.item}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            Created on {formatDate(request.createdAt)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline">{request.service}</Badge>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status.charAt(0).toUpperCase() +
                              request.status.slice(1)}
                          </Badge>
                          {request.paid && (
                            <Badge className="bg-blue-500">Paid</Badge>
                          )}
                        </div>
                      </div>
  
                      <div className="space-y-2 mb-4">
                        <p className="text-sm">
                          <span className="font-semibold">Description:</span>{" "}
                          {request.itemDescription}
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold">Quantity:</span>{" "}
                          {request.quantity}
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold">Location:</span>{" "}
                          {request.cityDetails.name} ({request.zone})
                        </p>
                        {request.paid && request.paidBy && (
                          <p className="text-sm">
                            <span className="font-semibold">Paid by:</span>{" "}
                            {request.paidBy.firstName} {request.paidBy.lastName}
                          </p>
                        )}
                      </div>
                    </Card>
                  ))
                ) : (
                  <p>No donation requests found.</p>
                )}
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold mb-6">Your Donations</h2>
                <p>Donations feature will be available soon.</p>
              </div>
            )
          ) : (
            <div>
              <h2 className="text-2xl font-bold mb-6">Your Posts</h2>
              {isLoadingPosts ? (
                <PostSkeleton />
              ) : userPosts?.posts?.length > 0 ? (
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
  );
};

export default Profile;
