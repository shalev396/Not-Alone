import { z } from "zod";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { uploadImage } from "@/components/shared/UploadPhoto";
import { api } from "@/api/api";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/shared/Navbar";

// Import constants
const zones = ["North", "Center", "South"] as const;
const EatUpsHosting = ["Family", "Organization"] as const;

// Zod schema for form validation
const eatupSchema = z.object({
  location: z.string().min(1, "Location is required"),
  zone: z.enum(zones, {
    required_error: "Please select a zone",
  }),
  date: z.string().min(1, "Date and time are required"),
  kosher: z.boolean(),
  hosting: z.enum(EatUpsHosting, {
    required_error: "Please select a hosting type",
  }),
  description: z.string().min(1, "Description is required"),
  image: z.string().min(1, "Image is required"),
  limit: z
    .string()
    .transform((val) => (val ? parseInt(val) : undefined))
    .optional(),
});

type FormData = {
  location: string;
  zone: string;
  description: string;
  image: string;
  date: string;
  kosher: boolean;
  hosting: string;
  limit: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

export default function NewPost() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form fields
  const [formData, setFormData] = useState<FormData>({
    location: "",
    zone: "",
    description: "",
    image: "",
    date: "",
    kosher: false,
    hosting: "",
    limit: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    try {
      eatupSchema.parse(formData);
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

  const handleCreatePost = async () => {
    setServerError(null);
    if (!validateForm()) return;

    setLoading(true);
    try {
      const postData = {
        ...formData,
        date: new Date(formData.date).toISOString(),
        media: [formData.image],
        authorId: sessionStorage.getItem("id"),
        title: formData.description,
        owner: sessionStorage.getItem("id"),
        language: "Hebrew",
        limit: formData.limit ? parseInt(formData.limit) : undefined,
      };

      const eatupResponse = await api.post("/eatups", postData);

      // Invalidate and refetch channels
      queryClient.invalidateQueries({ queryKey: ["channels"] });

      // Navigate to the new channel
      navigate(`/channel/${eatupResponse.data.data.channel._id}`);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        "Failed to create EatUp. Please try again.";
      setServerError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-background text-foreground min-h-screen">
      <Navbar modes="home2" isVertical={true} isAccordion={true} />

      <div className="flex-1 mx-10">
        <div className="py-6">
          <Card className="max-w-2xl mx-auto p-6">
            <h2 className="text-3xl font-bold mb-8 text-center">
              <span className="bg-gradient-to-r from-[#F596D3] to-[#D247BF] text-transparent bg-clip-text">
                Create New EatUp
              </span>
            </h2>

            <div className="space-y-4">
              <FormItem>
                <FormLabel>Location *</FormLabel>
                <Input
                  placeholder="Enter location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className={errors.location ? "border-red-500" : ""}
                />
                {errors.location && (
                  <FormMessage>{errors.location}</FormMessage>
                )}
              </FormItem>

              <FormItem>
                <FormLabel>Zone *</FormLabel>
                <Select
                  value={formData.zone}
                  onValueChange={(value) =>
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
                        {zone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.zone && <FormMessage>{errors.zone}</FormMessage>}
              </FormItem>

              <FormItem>
                <FormLabel>Date and Time *</FormLabel>
                <Input
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className={errors.date ? "border-red-500" : ""}
                />
                {errors.date && <FormMessage>{errors.date}</FormMessage>}
              </FormItem>

              <FormItem>
                <FormLabel>Hosting Type *</FormLabel>
                <Select
                  value={formData.hosting}
                  onValueChange={(value) =>
                    setFormData({ ...formData, hosting: value })
                  }
                >
                  <SelectTrigger
                    className={errors.hosting ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select hosting type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EatUpsHosting.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.hosting && <FormMessage>{errors.hosting}</FormMessage>}
              </FormItem>

              <FormItem>
                <FormLabel>Kosher</FormLabel>
                <Select
                  value={formData.kosher ? "yes" : "no"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, kosher: value === "yes" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Is it kosher?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>

              <FormItem>
                <FormLabel>Guest Limit (Optional)</FormLabel>
                <Input
                  type="number"
                  placeholder="Enter guest limit"
                  value={formData.limit}
                  onChange={(e) =>
                    setFormData({ ...formData, limit: e.target.value })
                  }
                />
                {errors.limit && <FormMessage>{errors.limit}</FormMessage>}
              </FormItem>

              <FormItem>
                <FormLabel>Description *</FormLabel>
                <Textarea
                  placeholder="Enter description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && (
                  <FormMessage>{errors.description}</FormMessage>
                )}
              </FormItem>

              <FormItem>
                <FormLabel>Image *</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const imageUrl = await uploadImage(file);
                      setFormData({ ...formData, image: imageUrl });
                    }
                  }}
                  className={errors.image ? "border-red-500" : ""}
                />
                {errors.image && <FormMessage>{errors.image}</FormMessage>}
              </FormItem>

              {serverError && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{serverError}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleCreatePost}
                className="w-full bg-gradient-to-r from-[#F596D3] to-[#D247BF] hover:opacity-90 transition-opacity"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create EatUp"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
