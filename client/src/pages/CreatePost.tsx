import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { uploadImage } from "@/components/shared/UploadPhoto";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/Redux/store";
import { api } from "@/api/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/shared/Navbar";
import { Image, X, Loader2 } from "lucide-react";
import { updateUser } from "@/Redux/userSlice";
import { Formik, Form, Field } from "formik";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";

// Zod schema for post validation
const postSchema = z.object({
  content: z
    .string()
    .min(1, "Post content is required")
    .max(1000, "Post content must be less than 1000 characters"),
  image: z.any().optional(),
});

type PostForm = z.infer<typeof postSchema>;

export default function CreatePost({
  onPostCreated,
}: {
  onPostCreated: () => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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
        const response = await api.put(`/users/me`, {
          profileImage: randomImage,
        });
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
  });

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFieldValue("image", file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = (
    setFieldValue: (field: string, value: any) => void
  ) => {
    setFieldValue("image", null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (
    values: PostForm,
    { setSubmitting, setStatus }: any
  ) => {
    try {
      setUploading(true);
      let imageUrl = "";
      let profileImageUrl = await ensureUserProfileImage();

      if (values.image) {
        imageUrl = await uploadImage(values.image);
      }

      const postData = {
        content: values.content,
        media: imageUrl ? [imageUrl] : [],
        author: {
          _id: user._id,
          profileImage: profileImageUrl,
        },
        visibility: user.type,
      };

      await createPostMutation.mutateAsync(postData);
    } catch (error: any) {
      setStatus({ error: "Failed to create post. Please try again." });
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  return (
    <div className="flex bg-background text-foreground min-h-screen">
      {/* Navbar */}
      <Navbar modes="home" isVertical={true} isAccordion={true} />

      {/* Main Content */}
      <div className="flex-1 p-6 pl-[72px] sm:pl-20 md:pl-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-4 mb-8">
            <h2 className="text-3xl font-bold text-center md:text-left">
              <span className="bg-gradient-to-r from-primary/60 to-primary text-transparent bg-clip-text">
                Create Post
              </span>
            </h2>
            <p className="text-muted-foreground text-center md:text-right">
              Share your thoughts with the community
            </p>
          </div>

          <Card className="p-6">
            <Formik
              initialValues={{ content: "", image: null }}
              validationSchema={toFormikValidationSchema(postSchema)}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, errors, touched, setFieldValue, status }) => (
                <Form className="space-y-4">
                  <div className="space-y-2">
                    <Field
                      as={Textarea}
                      name="content"
                      placeholder="What's on your mind?"
                      className={`min-h-[200px] resize-none bg-background text-foreground border-primary/20 focus-visible:ring-primary ${
                        touched.content && errors.content
                          ? "border-destructive"
                          : ""
                      }`}
                    />
                    {touched.content && errors.content && (
                      <p className="text-sm text-destructive">
                        {errors.content}
                      </p>
                    )}
                  </div>

                  {previewUrl && (
                    <div className="relative inline-block">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-[200px] rounded-lg object-cover"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute -top-2 -right-2"
                        onClick={() => handleRemoveImage(setFieldValue)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-4">
                    <input
                      type="file"
                      id="file-upload"
                      onChange={(e) => handleImageChange(e, setFieldValue)}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="border-primary/20"
                      size="icon"
                      asChild
                    >
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Image className="h-4 w-4" />
                      </label>
                    </Button>

                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isSubmitting || uploading}
                    >
                      {isSubmitting || uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Create Post"
                      )}
                    </Button>
                  </div>

                  {status?.error && (
                    <Alert variant="destructive">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{status.error}</AlertDescription>
                    </Alert>
                  )}
                </Form>
              )}
            </Formik>
          </Card>
        </div>
      </div>
    </div>
  );
}
