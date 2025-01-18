import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/Redux/store";
import { updateUser } from "@/Redux/userSlice";
import ProfileImageDialog from "@/components/profile/ProfileImageDialog";
import Checkbox from "@/components/custom-ui/Checkbox";
import { Navbar } from "@/components/shared/Navbar";
import { Filter } from "bad-words";
import { api } from "@/api/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const nicknames = [
  "Bob",
  "Sweet",
  "Jon",
  "Juan",
  "Min",
  "Laila",
  "Pedro",
  "Jess",
  "Igor",
  "Cat",
];
const profileImages = ["boy_1.svg", "boy_2.svg", "girl_1.svg", "girl_2.svg"];
const DEFAULT_PROFILE_IMAGE =
  "https://api.dicebear.com/7.x/avataaars/svg?seed=default";

const getRandomItem = <T,>(array: T[]): T =>
  array[Math.floor(Math.random() * array.length)];

const Profile: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  console.log(user.bio);

  const defaultNickname = user.nickname || getRandomItem(nicknames);
  const [nickname, setNickname] = useState(defaultNickname);
  const [profileImage, setProfileImage] = useState(
    user.profileImage || DEFAULT_PROFILE_IMAGE
  );
  const [email, setEmail] = useState(user.email || "");
  console.log(email);

  const [phone, setPhone] = useState(user.phone || "");
  const [bio, setBio] = useState(user.bio || "");
  console.log(bio);

  const [receiveNotifications, setReceiveNotifications] = useState<boolean>(
    user.receiveNotifications ?? false
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState("");

  const filter = new Filter();

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
      setNickname(defaultNickname);
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

    try {
      const updatedUser = {
        nickname,
        email,
        phone,
        bio,
        profileImage,
        receiveNotifications,
      };

      const response = await api.put(`/users/${user._id}`, updatedUser);

      dispatch(updateUser(response.data));
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get(`/users/${user._id}`);
        console.log(response.data);
        setNickname(response.data.nickname);
        setProfileImage(response.data.profileImage);
        setEmail(response.data.email);
        setPhone(response.data.phone);
        setBio(response.data.bio);
        setReceiveNotifications(response.data.receiveNotifications);

        console.log(user._id);

        dispatch(updateUser(response.data));
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="flex bg-background text-foreground min-h-screen">
      <Navbar modes="home" isVertical={true} isAccordion={true} />
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold mb-6 text-center">
            <span className="bg-gradient-to-r from-[#F596D3] to-[#D247BF] text-transparent bg-clip-text">
              Profile
            </span>{" "}
            Settings
          </h1>

          <div className="w-full max-w-4xl bg-card p-6 rounded-lg shadow-md">
            <div className="flex flex-row items-start space-x-4">
              <div className="flex-1 space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nickname
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => handleNicknameChange(e.target.value)}
                    onBlur={handleNicknameBlur}
                    placeholder="Enter a unique nickname"
                    className="w-full p-2 rounded bg-background text-foreground border border-input"
                  />
                  <button
                    onClick={() => setNickname(getRandomItem(nicknames))}
                    className="mt-2 text-sm text-[#F596D3] hover:text-[#D247BF] hover:underline"
                  >
                    Suggest a Nickname
                  </button>
                  {error && (
                    <p className="text-red-500 text-sm mt-2">{error}</p>
                  )}
                </div>
                <div className="w-full lg:w-auto mt-4 lg:mt-0">
                  <label className="block text-sm font-medium mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full p-2 rounded bg-background text-foreground border border-input"
                  />
                </div>
              </div>

              <div className="flex-none lg:w-1/2 flex flex-col items-center justify-center mt-5 lg:mt-0">
                <img
                  src={profileImage || DEFAULT_PROFILE_IMAGE}
                  alt="Profile"
                  onClick={() => setIsDialogOpen(true)}
                  className="rounded-full cursor-pointer border-2 hover:border-[#F596D3] w-[100px] h-[100px] lg:w-[175px] lg:h-[175px]"
                />
                <button
                  onClick={() => setIsDialogOpen(true)}
                  className="text-xs mt-6 text-center text-[#F596D3] hover:text-[#D247BF] hover:underline decoration-1"
                >
                  Change <br /> profile picture
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 mt-4">
                Email
              </label>
              <Input
                type="email"
                disabled
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter email"
                className="w-full"
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mt-4 mb-1">
                  Biography
                </label>
                <Textarea
                  value={bio}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setBio(e.target.value)
                  }
                  placeholder="Write a short bio"
                  className="w-full resize-none"
                  rows={4}
                />
              </div>
            </div>

            <div className="flex items-center mt-4">
              <Checkbox
                checked={receiveNotifications}
                onCheckedChange={(checked: boolean) =>
                  setReceiveNotifications(checked)
                }
              />
            </div>
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-[#F596D3] to-[#D247BF] text-white font-bold py-2 rounded hover:opacity-90 transition-opacity mt-4"
            >
              Save Changes
            </button>
          </div>

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
