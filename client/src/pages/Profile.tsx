import React, { useState, useEffect } from "react";
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

type post = {
  _id: string;
  authorId: string;
  content: string;
  media: string[];
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


const nicknames = ["Bob", "Sweet", "Jon", "Juan", "Min", "Laila", "Pedro", "Jess", "Igor", "Cat"];
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
const DEFAULT_PROFILE_IMAGE = "https://api.dicebear.com/7.x/avataaars/svg?seed=default";

const getRandomItem = <T,>(array: T[]): T => array[Math.floor(Math.random() * array.length)];

const Profile: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const [showAlternateTab, setShowAlternateTab] = useState(false);
  const isSoldier = user.type === "soldier";

  const [nickname, setNickname] = useState(user.nickname || getRandomItem(nicknames));
  const [profileImage, setProfileImage] = useState(user.profileImage || DEFAULT_PROFILE_IMAGE);
  const [email, setEmail] = useState(user.email || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [bio, setBio] = useState(user.bio || "");
  const [receiveNotifications, setReceiveNotifications] = useState<boolean>(
    user.receiveNotifications ?? false
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState("");
  const filter = new Filter();

  const { data: userPosts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ["userPosts", user._id],
    queryFn: () => fetchUserPosts(user._id),
    enabled: !!user._id,
  });
console.log(userPosts);


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

  const handleNicknameBlur = () => {
    if (!nickname) {
      setNickname(user.nickname || getRandomItem(nicknames));
    }
  };

  // Função para salvar as alterações no perfil
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
        email,
        phone,
        bio,
        profileImage,
        receiveNotifications,
      };
      const response = await api.put(`/users/me`, updatedUser);

      dispatch(updateUser(response.data));
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
          <h1 className="text-3xl font-bold mb-6 text-center">
            <span className="bg-gradient-to-r text-green-500 bg-clip-text">
              Profile
            </span>{" "}
            Page
          </h1>

          {/* Detalhes do perfil */}
          <div className="bg-card p-6 rounded-lg shadow-md">
            <div className="flex items-start space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Nickname</label>
                <Input
                  value={nickname}
                  onChange={(e) => handleNicknameChange(e.target.value)}
                  onBlur={handleNicknameBlur}
                  placeholder="Enter a unique nickname"
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                {/* Email */}
                <label className="block text-sm font-medium mt-6 mb-1">Email</label>
                <Input value={email} disabled />
              </div>

              {/* Imagem do perfil */}
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
                onCheckedChange={(checked: boolean) => setReceiveNotifications(checked)}
              />
            </div>
            <button
              onClick={handleSubmit}
              className="mt-4 w-full bg-gradient-to-r from-[#F596D3] to-[#D247BF] text-white py-2 rounded"
            >
              Save Changes
            </button>
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
                <p>Feature under development...</p>
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
              ) : userPosts && userPosts.posts.length > 0 ? (
                userPosts.posts.map((post:post) => {
                console.log(post);
                
                return <PostCard key={post._id} post={post} />})
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
