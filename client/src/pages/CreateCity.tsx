import { useState } from "react";
import { api } from "@/api/api";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { uploadImage } from "@/components/shared/UploadPhoto";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Navbar } from "@/components/shared/Navbar";

// Constants
const zones = ["north", "south", "center"] as const;

// Zod schema for form validation
const citySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),
  zone: z.enum(zones, {
    required_error: "Please select a zone",
  }),
  bio: z
    .string()
    .min(10, "Bio must be at least 10 characters")
    .max(1000, "Bio cannot exceed 1000 characters"),
  media: z.array(z.string()).max(10, "Cannot exceed 10 media items"),
});

type FormData = z.infer<typeof citySchema>;
type FormErrors = Partial<Record<keyof FormData, string>>;

export default function CreateCity() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    zone: "center",
    bio: "",
    media: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    try {
      citySchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof FormData] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const imageUrl = await uploadImage(file);
      setFormData({
        ...formData,
        media: [...formData.media, imageUrl],
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      setServerError("Failed to upload image. Please try again.");
    }
  };

  const handleSubmit = async () => {
    setServerError(null);
    if (!validateForm()) return;

    setLoading(true);
    try {
      await api.post("/cities", formData);
      navigate("/social");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        "Failed to create city. Please try again.";
      setServerError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Navbar isVertical isAccordion modes="home" />

      <div className="flex-1 overflow-auto">
        <div className="container max-w-2xl py-8">
          <Card>
            <CardHeader>
              <CardTitle>Create New City</CardTitle>
              <CardDescription>
                Fill in the details to create a new city
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormItem>
                <FormLabel>City Name *</FormLabel>
                <Input
                  placeholder="Enter city name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <FormMessage>{errors.name}</FormMessage>}
              </FormItem>

              <FormItem>
                <FormLabel>Zone *</FormLabel>
                <Select
                  value={formData.zone}
                  onValueChange={(value: (typeof zones)[number]) =>
                    setFormData({ ...formData, zone: value })
                  }
                >
                  <SelectTrigger
                    className={errors.zone ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((zone) => (
                      <SelectItem key={zone} value={zone}>
                        {zone.charAt(0).toUpperCase() + zone.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.zone && <FormMessage>{errors.zone}</FormMessage>}
              </FormItem>

              <FormItem>
                <FormLabel>Bio *</FormLabel>
                <Textarea
                  placeholder="Enter city description"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  className={errors.bio ? "border-red-500" : ""}
                />
                {errors.bio && <FormMessage>{errors.bio}</FormMessage>}
              </FormItem>

              <FormItem>
                <FormLabel>Photos</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      await handleImageUpload(file);
                    }
                  }}
                  className={errors.media ? "border-red-500" : ""}
                />
                {errors.media && <FormMessage>{errors.media}</FormMessage>}
                {formData.media.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {formData.media.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Uploaded ${index + 1}`}
                          className="w-full h-40 object-cover rounded-md"
                        />
                        <button
                          onClick={() => {
                            setFormData({
                              ...formData,
                              media: formData.media.filter(
                                (_, i) => i !== index
                              ),
                            });
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {formData.media.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {formData.media.length} photo
                    {formData.media.length !== 1 ? "s" : ""} uploaded
                    {formData.media.length >= 10 && " (Maximum reached)"}
                  </p>
                )}
              </FormItem>

              {serverError && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{serverError}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end space-x-4 pt-4">
                <Button variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-[#F596D3] to-[#D247BF] hover:opacity-90 transition-opacity"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create City"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
