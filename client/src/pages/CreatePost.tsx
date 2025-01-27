import { useState } from "react";
import {  useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { uploadImage } from "@/components/shared/UploadPhoto";
import { useSelector, useDispatch } from "react-redux"; // Import dispatch
import { RootState } from "@/Redux/store";
import { api } from "@/api/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/shared/Navbar";
import upload from "@/assets/upload.png";
import { updateUser } from "@/Redux/userSlice"; // Redux action for updating the user state

export default function CreatePost({ onPostCreated }: { onPostCreated: () => void }) {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch(); // For updating the Redux state
  const queryClient = useQueryClient();
  const navigate = useNavigate(); 

  // Function to assign a random profile picture
  const assignRandomProfileImage = () => {
    const profileImages = [
      "/assets/profilePictures/boy_1.svg",
      "/assets/profilePictures/boy_2.svg",
      "/assets/profilePictures/boy_3.svg",
      "/assets/profilePictures/boy_4.svg",
      "/assets/profilePictures/boy_5.svg",
      "/assets/profilePictures/boy_6.svg",
      "/assets/profilePictures/boy_7.svg",
      "/assets/profilePictures/girl_1.svg",
      "/assets/profilePictures/girl_2.svg",
      "/assets/profilePictures/girl_4.svg",
      "/assets/profilePictures/girl_5.svg",
      "/assets/profilePictures/girl_6.svg",
    ];
    return profileImages[Math.floor(Math.random() * profileImages.length)];
  };

  const ensureUserProfileImage = async (): Promise<string> => {
    if (!user.profileImage) {
      const randomImage = assignRandomProfileImage();
  
      try {
        const response = await api.put(`/users/me`, { profileImage: randomImage });
  
        dispatch(updateUser(response.data));
  
        return randomImage; 
      } catch (error) {
        console.error("Failed to update profile image:", error);
        return "/assets/profilePictures/default.svg"; 
      }
    }
    return user.profileImage;
  };
  





  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const response = await api.post("/posts", postData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      onPostCreated();
      navigate("/social");
    },
    onError: () => {
      setError("Failed to create post. Please try again.");
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreviewUrl(null);
  };




  const handleSubmit = async () => {
    setError(null);
  
    if (!content && !image) {
      setError("You must provide content or an image.");
      return;
    }
  
    setLoading(true);
    let imageUrl = "";
    let profileImageUrl: string = "";
  
    try {
      profileImageUrl = await ensureUserProfileImage();
  
      if (image) {
        setUploading(true);
        imageUrl = await uploadImage(image);
        setUploading(false);
      }
  
      const postData = {
        content,
        media: imageUrl ? [imageUrl] : [],
        author: {
          _id: user._id,
          profileImage: profileImageUrl, 
        },
        visibility: user.type,
      };
  
      createPostMutation.mutate(postData);
  
      setContent("");
      setImage(null);
      setPreviewUrl(null);
    } catch (error: any) {
      setError("Failed to create post. Please try again.");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };
  




  const handleContainerClick = () => {
    if (error) {
      setError(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground" onClick={handleContainerClick}>
      {/* Navbar */}
      <Navbar modes="home" isVertical={true} isAccordion={true} />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <Card className="max-w-2xl w-full p-6 bg-card text-card-foreground rounded-lg shadow-lg h-[75vh] relative">
          <h2 className="text-xl font-bold mb-4">
            Create a <span className="text-green-500">New</span> Post
          </h2>
          <div className="space-y-4 relative">
            {/* Input for content */}
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="resize-none h-80 bg-muted text-muted-foreground border border-border focus:ring-primary focus:border-primary rounded-lg relative z-10"
            />

            {previewUrl && (
              <div className="absolute inset-0 bottom-[80px] left-[15px] flex items-end justify-start z-10">
                <div className="relative w-40 h-40">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg shadow-md border border-border"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-[-10px] right-[-10px] bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* File upload */}
            <div className="flex items-center gap-4 mt-4">
              <input
                type="file"
                id="file-upload"
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer bg-pink-500 hover:bg-pink-400 text-white py-3 px-4 rounded-lg shadow-md inline-block flex items-center justify-center"
              >
                <img src={upload} alt="upload" className="w-6 h-6" />
              </label>
              <Button
                onClick={handleSubmit}
                disabled={loading || uploading}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-6 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-secundary"></div>
                ) : (
                  "Create Post"
                )}
              </Button>
            </div>
            {/* Error message */}
            {error && (
              <Alert
                variant="destructive"
                className="bg-destructive text-destructive-foreground rounded-lg mt-4"
              >
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
