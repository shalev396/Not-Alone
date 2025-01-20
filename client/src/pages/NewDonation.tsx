import { useState } from "react";
import { api } from "@/api/api";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { uploadImage } from "@/components/shared/UploadPhoto";
import { Navbar } from "@/components/shared/Navbar";
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

// Constants
const categories = [
  "Furniture",
  "Clothes",
  "Electricity",
  "Army Equipments",
] as const;

// Define city type
interface City {
  _id: string;
  name: string;
  zone: string;
}

// Fetch cities query
const fetchCities = async () => {
  try {
    const response = await api.get("/cities");
    return response.data as City[];
  } catch (error) {
    console.error("Error fetching cities:", error);
    return [];
  }
};

// Zod schema for form validation
const donationSchema = z.object({
  city: z.string({ required_error: "City is required" }),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address cannot exceed 200 characters"),
  category: z.enum(categories, {
    required_error: "Please select a category",
  }),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters"),
  description: z
    .string()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),
  media: z.array(z.string()).max(10, "Cannot exceed 10 media items"),
});

type FormData = z.infer<typeof donationSchema>;
type FormErrors = Partial<Record<keyof FormData, string>>;

export default function NewDonation() {
  const navigate = useNavigate();
  const { data: cities = [] } = useQuery<City[]>({
    queryKey: ["cities"],
    queryFn: fetchCities,
  });

  const [formData, setFormData] = useState<FormData>({
    city: "",
    address: "",
    category: "Furniture",
    title: "",
    description: "",
    media: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    try {
      donationSchema.parse(formData);
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

  const handleSubmit = async () => {
    setServerError(null);
    if (!validateForm()) return;

    setLoading(true);
    try {
      await api.post("/donations", formData);
      navigate("/my-donations");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        "Failed to create donation. Please try again.";
      setServerError(errorMessage);
    } finally {
      setLoading(false);
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

  return (
    <div className="flex h-screen">
      <Navbar isVertical isAccordion modes="home" />

      <div className="flex-1 overflow-auto">
        <div className="flex-1 p-6 pl-20 md:pl-6 bg-background">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Create New Donation</CardTitle>
                <CardDescription>
                  Fill in the details to create a new donation for soldiers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormItem>
                  <FormLabel>City *</FormLabel>
                  <Select
                    value={formData.city}
                    onValueChange={(value) =>
                      setFormData({ ...formData, city: value })
                    }
                  >
                    <SelectTrigger
                      className={errors.city ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city._id} value={city._id}>
                          {city.name} ({city.zone})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.city && <FormMessage>{errors.city}</FormMessage>}
                </FormItem>

                <FormItem>
                  <FormLabel>Address *</FormLabel>
                  <Input
                    placeholder="Enter your address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className={errors.address ? "border-red-500" : ""}
                  />
                  {errors.address && (
                    <FormMessage>{errors.address}</FormMessage>
                  )}
                </FormItem>

                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <Select
                    value={formData.category}
                    onValueChange={(value: (typeof categories)[number]) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger
                      className={errors.category ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <FormMessage>{errors.category}</FormMessage>
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
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    placeholder="Enter description (optional)"
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
                    {loading ? "Creating..." : "Create Donation"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
