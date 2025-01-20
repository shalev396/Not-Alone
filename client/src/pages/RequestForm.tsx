import { AxiosError } from "axios";
import { api } from "@/api/api";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/shared/Navbar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { z } from "zod";

interface City {
  _id: string;
  name: string;
  zone: "north" | "center" | "south";
}

const zones = ["north", "center", "south"] as const;

const requestSchema = z.object({
  service: z.enum(["Regular", "Reserves"]),
  item: z
    .string()
    .min(2, "Item must be at least 2 characters")
    .max(100, "Item cannot exceed 100 characters"),
  itemDescription: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description cannot exceed 1000 characters"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  zone: z.enum(["north", "center", "south"]),
  city: z.string().min(1, "City is required"),
  agreeToShareDetails: z.boolean().refine((val) => val === true, {
    message: "You must agree to share details",
  }),
});

type RequestFormData = z.infer<typeof requestSchema>;

export default function RequestForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RequestFormData>({
    service: "Regular",
    item: "",
    itemDescription: "",
    quantity: 1,
    zone: "center",
    city: "",
    agreeToShareDetails: false,
  });
  const [cities, setCities] = useState<City[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await api.get("/cities");
        setCities(response.data);
      } catch (error) {
        setServerError("Failed to fetch cities");
      }
    };
    fetchCities();
  }, []);

  const handleChange = (
    field: keyof RequestFormData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setErrors({});

    try {
      // Validate form data
      requestSchema.parse(formData);

      setIsLoading(true);
      await api.post("/requests", formData);
      navigate("/my-requests"); // Assuming you have a my requests page
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setErrors(newErrors);
      } else if (error instanceof AxiosError) {
        setServerError(
          error.response?.data?.message || "Failed to submit request"
        );
      } else {
        setServerError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCities = cities.filter((city) => city.zone === formData.zone);

  return (
    <div className="flex bg-background text-foreground min-h-screen">
      <Navbar modes="home" isVertical={true} isAccordion={true} />
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
          <Card className="p-6">
            <h2 className="text-3xl font-bold mb-8 text-center">
              <span className="bg-gradient-to-r from-[#F596D3] to-[#D247BF] text-transparent bg-clip-text">
                New Request
              </span>
            </h2>

            {serverError && (
              <Alert variant="destructive" className="mb-6">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Type */}
              <div className="space-y-2">
                <Label>Service Type</Label>
                <div className="flex gap-4">
                  {["Regular", "Reserves"].map((type) => (
                    <label key={type} className="flex items-center space-x-2">
                      <Input
                        type="radio"
                        checked={formData.service === type}
                        onChange={() => handleChange("service", type)}
                        className="w-4 h-4"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
                {errors.service && (
                  <p className="text-sm text-red-500">{errors.service}</p>
                )}
              </div>

              {/* Zone Selection */}
              <div className="space-y-2">
                <Label>Zone</Label>
                <select
                  value={formData.zone}
                  onChange={(e) => {
                    handleChange("zone", e.target.value);
                    handleChange("city", ""); // Reset city when zone changes
                  }}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-[#F596D3]"
                >
                  {zones.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone.charAt(0).toUpperCase() + zone.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.zone && (
                  <p className="text-sm text-red-500">{errors.zone}</p>
                )}
              </div>

              {/* City Selection */}
              <div className="space-y-2">
                <Label>City</Label>
                <select
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-[#F596D3]"
                >
                  <option value="">Select a city</option>
                  {filteredCities.map((city) => (
                    <option key={city._id} value={city._id}>
                      {city.name}
                    </option>
                  ))}
                </select>
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city}</p>
                )}
              </div>

              {/* Item */}
              <div className="space-y-2">
                <Label>Item</Label>
                <Input
                  value={formData.item}
                  onChange={(e) => handleChange("item", e.target.value)}
                  placeholder="Enter item name"
                />
                {errors.item && (
                  <p className="text-sm text-red-500">{errors.item}</p>
                )}
              </div>

              {/* Item Description */}
              <div className="space-y-2">
                <Label>Item Description</Label>
                <Textarea
                  value={formData.itemDescription}
                  onChange={(e) =>
                    handleChange("itemDescription", e.target.value)
                  }
                  placeholder="Provide detailed description (size, color, condition, etc.)"
                  className="min-h-[100px]"
                />
                {errors.itemDescription && (
                  <p className="text-sm text-red-500">
                    {errors.itemDescription}
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    handleChange("quantity", parseInt(e.target.value) || 1)
                  }
                />
                {errors.quantity && (
                  <p className="text-sm text-red-500">{errors.quantity}</p>
                )}
              </div>

              {/* Agreement */}
              <div className="flex items-center space-x-2">
                <Input
                  type="checkbox"
                  checked={formData.agreeToShareDetails}
                  onChange={(e) =>
                    handleChange("agreeToShareDetails", e.target.checked)
                  }
                  className="w-4 h-4"
                />
                <Label>I agree to share my details with potential donors</Label>
              </div>
              {errors.agreeToShareDetails && (
                <p className="text-sm text-red-500">
                  {errors.agreeToShareDetails}
                </p>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#F596D3] to-[#D247BF] hover:opacity-90 transition-opacity"
              >
                {isLoading ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
