import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/Redux/store";
import { updateUser, fetchUserData } from "@/Redux/userSlice";
import ProfileImageDialog from "@/components/profile/ProfileImageDialog";
import { uploadImage } from "@/components/shared/UploadPhoto";
import { Navbar } from "@/components/shared/Navbar";
import { Filter } from "bad-words";
import { api } from "@/api/api";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { PostSkeleton } from "@/components/social/PostSkeleton";
import Skeleton from "react-loading-skeleton";
import { FilteredPostFeed } from "@/components/shared/feeds/FilteredPostFeed";
import SoldierJoinCity from "./SoldierJoinCity";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Upload } from "lucide-react";

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

export interface Post {
  _id: string;
  content: string;
  media?: string[];
  author: {
    //
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
    nickname?: string;
  };
  likes: string[];
  comments: Array<{
    author: string;
    nickname: string;
    profileImage?: string;
    text: string;
    createdAt: Date | string;
  }>;
  createdAt: Date | string;
}

const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const [loadingProfile, setLoadingProfile] = useState(true);
  const user = useSelector((state: RootState) => state.user);
  const isUploadUser = ["Municipality", "Organization", "Business"].includes(user.type);
  const [nickname, setNickname] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [bio, setBio] = useState("");
  const [receiveNotifications, setReceiveNotifications] = useState(false);
  const DEFAULT_PROFILE_IMAGE = "/assets/profilePictures/boy_1.svg";

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

        const { nickname, profileImage, bio, receiveNotifications } =
          response.data;
        console.log("Profile Data:^^", response.data);

        setNickname(nickname || "");
        setProfileImage(profileImage || DEFAULT_PROFILE_IMAGE);
        setBio(bio || "");
        setReceiveNotifications(receiveNotifications || false);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [dispatch]);

  const NICKNAME_OPTIONS = [
    "May",
    "Lily",
    "Blue",
    "Bird",
    "Dudu",
    "Sofy",
    "Pedro",
    "Ana",
    "Lia",
    "Leo",
    "Nina",
    "Rafa",
    "Lolo",
    "Zoe",
    "Ben",
    "Téo",
    "Noah",
    "Ivy",
    "Mia",
    "Theo",
    "Gabi",
    "Dani",
    "João",
    "Cris",
    "Tina",
    "Bia",
    "Luca",
    "Max",
    "Yuri",
    "Luz",
    "Kai",
    "Fifi",
    "Titi",
    "Jade",
    "Bela",
    "Vivi",
    "Lu",
    "Nico",
    "Pip",
    "Sol",
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
  const getRandomNickname = () => {
    return NICKNAME_OPTIONS[
      Math.floor(Math.random() * NICKNAME_OPTIONS.length)
    ];
  };

  // const [activeTab, setActiveTab] = useState<"posts" | "requests" | "joinCity">(
  //   "posts"
  // );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const filter = new Filter();

  // const [isSaving, setIsSaving] = useState(false);

  const isSoldier = user.type === "Soldier";

  const [email] = useState(user.email || "");
  const [phone, setPhone] = useState(user.phone || "");

  const { data: soldierRequests, isLoading: isLoadingSoldierRequests } =
    useQuery({
      queryKey: ["soldierRequests", user._id],
      queryFn: async () => {
        const response = await api.get(`/requests/user/${user._id}`);
        return response.data.requests;
      },
      enabled: !!user._id,
    });
  console.log("User ID in Profile:", user._id);

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

  const handleDeleteRequest = async (requestId: string) => {
    try {
      await api.delete(`/requests/${requestId}`);
      const updatedRequests = soldierRequests.filter(
        (request: Request) => request._id !== requestId
      );
      console.log("Updated soldier requests:", updatedRequests);
    } catch (error: any) {
      console.error("Error deleting request:", error.response?.data || error);
      alert("Failed to delete request.");
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

      console.log("🚀 Sending update to API:", profileUpdate);
  
      const profileResponse = await api.put("/profiles/me", profileUpdate);
      
      console.log("✅ API Response:", profileResponse.data);


      dispatch(updateUser({
        nickname: profileResponse.data.nickname,
        profileImage: profileResponse.data.profileImage,
        bio: profileResponse.data.bio,
        receiveNotifications: profileResponse.data.receiveNotifications
      }));
  
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  const navigate = useNavigate();

  return (
    <div className="flex bg-background text-foreground min-h-screen">
      <Navbar modes="home" isVertical={true} isAccordion={true} />
      <div className="flex-1 p-6 pl-[72px] sm:pl-20 md:pl-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">
            <span className="bg-gradient-to-r from-primary/60 to-primary text-transparent bg-clip-text">
              Profile Settings
            </span>
          </h1>

          {loadingProfile ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">
                Loading profile...
              </span>
            </div>
          ) : (
            <div className="space-y-8">
              <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-start">
              <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nickname">Nickname</Label>
                      <Input
                        id="nickname"
                        value={nickname}
                        onChange={(e) => handleNicknameChange(e.target.value)}
                        placeholder="Enter a unique nickname"
                        className="border-primary/20"
                      />
                      {error && (
                        <Alert variant="destructive" className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                      <Button
                        variant="link"
                        onClick={() => setNickname(getRandomNickname())}
                        className="text-primary p-0 h-auto"
                      >
                        Suggest Nickname
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={email}
                        disabled
                        className="bg-muted"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter phone number"
                        className="border-primary/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Biography</Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Write a short bio"
                        className="min-h-[100px] border-primary/20 w-full"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="notifications"
                        checked={receiveNotifications}
                        onCheckedChange={setReceiveNotifications}
                      />
                      <Label htmlFor="notifications">
                        Receive notifications
                      </Label>
                    </div>
                  </div>

                  <div className="flex-shrink-0 px-4 md:px-8 pt-6 md:pt-10">
                  {isImageLoading && (
                      <Skeleton circle={true} height={160} width={160} />
                    )}
                  <img
                    src={profileImage || DEFAULT_PROFILE_IMAGE}
                    alt="Profile"
                    onClick={() => {
                      if (!isUploadUser) setIsDialogOpen(true);
                    }}
                    onLoad={() => setIsImageLoading(false)}
                    onError={() => {
                      setIsImageLoading(false);
                      setProfileImage(DEFAULT_PROFILE_IMAGE);
                    }}
                    className={`rounded-full w-40 h-40 border border-primary/20 transition-colors ${
                      isUploadUser ? "cursor-default" : "cursor-pointer hover:border-primary"
                    }`}
                  />

{isUploadUser && (
  <div className="mt-4">
    <label htmlFor="upload-image">
      <Button variant="outline" className="w-full">
        <Upload className="w-4 h-4 mr-2" />
        Upload Image
      </Button>
    </label>
    <input
      id="upload-image"
      type="file"
      accept="image/*"
      className="hidden"
      onChange={async (e) => {
        if (e.target.files?.[0]) {
          try {
            const url = await uploadImage(e.target.files[0]);
            setProfileImage(url);
            alert("Image uploaded successfully!");
          } catch {
            alert("Failed to upload image.");
          }
        }
      }}
    />
  </div>
)}


                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  className="w-full mt-6"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Save Changes
                </Button>
              </Card>

              <Tabs defaultValue="posts" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="posts" className="flex-1">
                    Posts
                  </TabsTrigger>
                  <TabsTrigger value="requests" className="flex-1">
                    {isSoldier ? "My Requests" : "Donations"}
                  </TabsTrigger>
                  <TabsTrigger value="joinCity" className="flex-1">
                    Join City
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="posts" className="mt-6">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold">
                        <span className="bg-gradient-to-r from-primary/60 to-primary text-transparent bg-clip-text">
                          Your Posts
                        </span>
                      </h2>
                      <Button
                        onClick={() => navigate("/create-post")}
                        className="gap-2 bg-primary/90 hover:bg-primary"
                      >
                        New Post
                      </Button>
                    </div>
                    <FilteredPostFeed userId={user._id} />
                  </div>
                </TabsContent>

                <TabsContent value="requests" className="mt-6">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold">
                        <span className="bg-gradient-to-r from-primary/60 to-primary text-transparent bg-clip-text">
                          {isSoldier
                            ? "Your Donation Requests"
                            : "Your Donations"}
                        </span>
                      </h2>
                      {isSoldier && (
                        <Button
                          onClick={() => navigate("/requestForm")}
                          className="gap-2 bg-primary/90 hover:bg-primary"
                        >
                          New Request
                        </Button>
                      )}
                    </div>
                    {isLoadingSoldierRequests ? (
                      <PostSkeleton />
                    ) : soldierRequests && soldierRequests.length > 0 ? (
                      <div className="grid gap-6">
                        {soldierRequests.map((request: Request) => (
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
                                <Badge variant="outline">
                                  {request.service}
                                </Badge>
                                <Badge
                                  className={getStatusColor(request.status)}
                                >
                                  {request.status.charAt(0).toUpperCase() +
                                    request.status.slice(1)}
                                </Badge>
                                {request.paid && (
                                  <Badge variant="secondary">Paid</Badge>
                                )}
                              </div>
                            </div>

                            <div className="space-y-2 mb-4">
                              <p className="text-sm">
                                <span className="font-semibold">
                                  Description:
                                </span>{" "}
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
                                  <span className="font-semibold">
                                    Paid by:
                                  </span>{" "}
                                  {request.paidBy.firstName}{" "}
                                  {request.paidBy.lastName}
                                </p>
                              )}
                            </div>

                            {request.status === "in process" && (
                              <div className="flex justify-end">
                                <Button
                                  variant="destructive"
                                  onClick={() =>
                                    handleDeleteRequest(request._id)
                                  }
                                >
                                  Delete
                                </Button>
                              </div>
                            )}
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="p-6 text-center text-muted-foreground">
                        No requests found.
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="joinCity" className="mt-6">
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold">
                      <span className="bg-gradient-to-r from-primary/60 to-primary text-transparent bg-clip-text">
                        Join a City
                      </span>
                    </h2>
                    <SoldierJoinCity />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {isDialogOpen && (
            <ProfileImageDialog
              profileImages={profileImages}
              onSelectImage={(img) => setProfileImage(img)}
              onClose={() => setIsDialogOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
