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
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/shared/Navbar";

// Constants
const hostingTypes = ["organization", "donators", "city"] as const;
const languages = [
  "Hebrew",
  "English",
  "Arabic",
  "Russian",
  "Amharic",
] as const;

// Define city type to match backend response
interface City {
  _id: string;
  name: string;
  zone: string;
  bio?: string;
  media?: string[];
  approvalStatus: string;
}

// Fetch cities query
const fetchCities = async () => {
  try {
    const response = await api.get("/cities");
    console.log("Cities response:", response.data); // For debugging
    return response.data as City[];
  } catch (error) {
    console.error("Error fetching cities:", error);
    return [];
  }
};

// Zod schema for form validation
const formSchema = z.object({
  city: z.string().nullable(),
  location: z
    .string()
    .min(3, "Location must be at least 3 characters")
    .max(100, "Location cannot exceed 100 characters"),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters"),
  media: z.array(z.string()).max(10, "Cannot exceed 10 media items"),
  date: z
    .string()
    .min(1, "Date and time are required")
    .refine(
      (date) => new Date(date) > new Date(),
      "Date must be in the future"
    ),
  kosher: z.boolean(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description cannot exceed 1000 characters"),
  languages: z
    .array(z.enum(languages))
    .min(1, "At least one language is required")
    .max(5, "Cannot exceed 5 languages"),
  hosting: z.enum(hostingTypes, {
    required_error: "Please select a hosting type",
  }),
  limit: z
    .number()
    .min(2, "Minimum 2 guests required")
    .max(100, "Cannot exceed 100 guests"),
});

type FormData = z.infer<typeof formSchema>;

type FormErrors = Partial<Record<keyof FormData, string>>;

export default function NewEatup() {
  const navigate = useNavigate();
  const { data: cities = [], isLoading: isLoadingCities } = useQuery<City[]>({
    queryKey: ["cities"],
    queryFn: fetchCities,
  });

  // Form fields
  const [formData, setFormData] = useState<FormData>({
    city: null,
    location: "",
    title: "",
    media: [],
    date: "",
    kosher: false,
    description: "",
    languages: ["Hebrew"],
    hosting: "organization" as const,
    limit: 2,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    try {
      formSchema.parse(formData);
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

  const handleCreateEatup = async () => {
    setServerError(null);
    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        date: new Date(formData.date).toISOString(),
        media: [formData.media[0]],
        authorId: sessionStorage.getItem("id"),
        title: formData.description,
        owner: sessionStorage.getItem("id"),
        language: "Hebrew",
        limit: formData.limit ? formData.limit.toString() : undefined,
      };

      await api.post("/eatups", submitData);
      navigate("/my-eatups");
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
                <FormLabel>City</FormLabel>
                <Select
                  value={formData.city || "none"}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      city: value === "none" ? null : value,
                    })
                  }
                >
                  <SelectTrigger
                    className={errors.city ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select city (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None of these</SelectItem>
                    {cities && cities.length > 0 ? (
                      cities.map((city) => (
                        <SelectItem key={city._id} value={city._id}>
                          {city.name} (
                          {city.zone.charAt(0).toUpperCase() +
                            city.zone.slice(1)}
                          )
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-cities" disabled>
                        {isLoadingCities
                          ? "Loading cities..."
                          : "No approved cities available"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.city && <FormMessage>{errors.city}</FormMessage>}
              </FormItem>

              <FormItem>
                <FormLabel>Location *</FormLabel>
                <Input
                  placeholder="Enter specific location (e.g., address, venue name)"
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
                <FormLabel>Title *</FormLabel>
                <Input
                  placeholder="Enter title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && <FormMessage>{errors.title}</FormMessage>}
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
                  onValueChange={(value: (typeof hostingTypes)[number]) =>
                    setFormData({ ...formData, hosting: value })
                  }
                >
                  <SelectTrigger
                    className={errors.hosting ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select hosting type" />
                  </SelectTrigger>
                  <SelectContent>
                    {hostingTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.hosting && <FormMessage>{errors.hosting}</FormMessage>}
              </FormItem>

              <FormItem>
                <FormLabel>Languages *</FormLabel>
                <Select
                  value={formData.languages[0]}
                  onValueChange={(value: (typeof languages)[number]) =>
                    setFormData({ ...formData, languages: [value] })
                  }
                >
                  <SelectTrigger
                    className={errors.languages ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.languages && (
                  <FormMessage>{errors.languages}</FormMessage>
                )}
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
                <FormLabel>Guest Limit *</FormLabel>
                <Input
                  type="number"
                  placeholder="Enter guest limit"
                  value={formData.limit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      limit: parseInt(e.target.value) || 2,
                    })
                  }
                  min={2}
                  max={100}
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
                <FormLabel>Images</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const imageUrl = await uploadImage(file);
                      setFormData({
                        ...formData,
                        media: [imageUrl],
                      });
                    }
                  }}
                  className={errors.media ? "border-red-500" : ""}
                />
                {errors.media && <FormMessage>{errors.media}</FormMessage>}
                {formData.media.length > 0 && (
                  <div className="mt-2">
                    <p>Uploaded images: {formData.media.length}</p>
                  </div>
                )}
              </FormItem>

              {serverError && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{serverError}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleCreateEatup}
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
