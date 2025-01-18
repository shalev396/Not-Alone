import { AxiosError } from "axios";
import { api } from "@/api/api";
import { useState, ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/shared/Navbar";

// Define the shape of the formData
type FormDataType = {
  service: string;
  itemType: string;
  itemDescription: string;
  quantity: string;
  urgency: string;
  geographicArea: string;
  notes: string;
  agreeToShareDetails: boolean;
};

function RequestForm() {
  const [formData, setFormData] = useState<FormDataType>({
    service: "",
    itemType: "",
    itemDescription: "",
    quantity: "",
    urgency: "Immediate",
    geographicArea: "",
    notes: "",
    agreeToShareDetails: false,
  });

  // ChangeEvent for input fields
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // FormEvent for form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await api.post("/requests", formData);
      alert("Request submitted successfully!");
      console.log(response.data);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(
          "Error submitting the request:",
          error.response?.data || error.message
        );
        alert("Failed to submit the request. Please try again.");
      } else {
        console.error("Unexpected error:", error);
        alert("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="flex bg-background text-foreground min-h-screen">
      <Navbar modes="home" isVertical={true} isAccordion={true} />
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
          <Card className="p-6">
            <h2 className="text-3xl font-bold mb-8 text-center">
              <span className="bg-gradient-to-r from-[#F596D3] to-[#D247BF] text-transparent bg-clip-text">
                Donation Request
              </span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service */}
              <div className="space-y-2">
                <Label>Service</Label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2">
                    <Input
                      type="radio"
                      name="service"
                      value="Regular"
                      checked={formData.service === "Regular"}
                      onChange={handleChange}
                    />
                    <span>Regular</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Input
                      type="radio"
                      name="service"
                      value="Reserves"
                      checked={formData.service === "Reserves"}
                      onChange={handleChange}
                    />
                    <span>Reserves</span>
                  </label>
                </div>
              </div>

              {/* Request Details */}
              <div className="space-y-2">
                <Label>Item Type</Label>
                <Input
                  name="itemType"
                  value={formData.itemType}
                  onChange={handleChange}
                  placeholder="Enter item type"
                />
              </div>

              <div className="space-y-2">
                <Label>Item Description</Label>
                <Textarea
                  name="itemDescription"
                  value={formData.itemDescription}
                  onChange={handleChange}
                  placeholder="Details like size, color, desired condition"
                />
              </div>

              <div className="space-y-2">
                <Label>Required Quantity</Label>
                <Input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="Enter quantity"
                />
              </div>

              {/* Additional Details */}
              <div className="space-y-2">
                <Label>Urgency</Label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-[#F596D3]"
                >
                  <option value="Immediate">Immediate</option>
                  <option value="Specific Date">Specific Date</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Preferred Geographic Area</Label>
                <Input
                  name="geographicArea"
                  value={formData.geographicArea}
                  onChange={handleChange}
                  placeholder="Enter geographic area"
                />
              </div>

              <div className="space-y-2">
                <Label>Additional Notes</Label>
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Additional comments"
                />
              </div>

              {/* Agreement */}
              <div className="flex items-center space-x-2">
                <Input
                  type="checkbox"
                  name="agreeToShareDetails"
                  checked={formData.agreeToShareDetails}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <Label>I agree to the terms and conditions</Label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#F596D3] to-[#D247BF] hover:opacity-90 transition-opacity"
              >
                Submit Request
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default RequestForm;
