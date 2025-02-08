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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Package } from "lucide-react";
import { Formik, Form, Field } from "formik";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Checkbox from "@/components/custom-ui/Checkbox";

interface City {
  _id: string;
  name: string;
  zone: "north" | "center" | "south";
}

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

type RequestFormValues = z.infer<typeof requestSchema>;

export default function RequestForm() {
  const navigate = useNavigate();
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await api.get("/cities");
        setCities(response.data);
      } catch (error) {
        setError("Failed to fetch cities");
      }
    };
    fetchCities();
  }, []);

  const initialValues: RequestFormValues = {
    service: "Regular",
    item: "",
    itemDescription: "",
    quantity: 1,
    zone: "center",
    city: "",
    agreeToShareDetails: false,
  };

  return (
    <div className="flex bg-background min-h-screen">
      <Navbar modes="home" isVertical={true} isAccordion={true} />
      <div className="flex-1 p-6 pl-[72px] sm:pl-20 md:pl-6">
        <div className="max-w-3xl mx-auto">
          {error && (
            <Alert
              variant="destructive"
              className="mb-6 border border-destructive/50"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card className="p-6 border-primary/10">
            <div className="space-y-4 mb-6">
              <h1 className="text-3xl font-bold text-center">
                <span className="bg-gradient-to-r from-primary/60 to-primary text-transparent bg-clip-text">
                  New Support Request
                </span>
              </h1>
              <p className="text-center text-muted-foreground">
                Fill out the form below to request support from our community
              </p>
            </div>

            <Formik
              initialValues={initialValues}
              validationSchema={toFormikValidationSchema(requestSchema)}
              onSubmit={async (values, { setSubmitting, setStatus }) => {
                try {
                  await api.post("/requests", values);
                  navigate("/profile");
                } catch (error) {
                  if (error instanceof AxiosError) {
                    setStatus(
                      error.response?.data?.message ||
                        "Failed to submit request"
                    );
                  } else {
                    setStatus("An unexpected error occurred");
                  }
                  setSubmitting(false);
                }
              }}
            >
              {({
                values,
                errors,
                touched,
                isSubmitting,
                setFieldValue,
                status,
              }) => (
                <Form className="space-y-6">
                  {status && (
                    <Alert
                      variant="destructive"
                      className="border border-destructive/50"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{status}</AlertDescription>
                    </Alert>
                  )}

                  {/* Service Type */}
                  <div className="space-y-2">
                    <Label className="text-base">Service Type</Label>
                    <div className="flex gap-4">
                      {["Regular", "Reserves"].map((type) => (
                        <label
                          key={type}
                          className="flex items-center space-x-2"
                        >
                          <Field
                            type="radio"
                            name="service"
                            value={type}
                            className="w-4 h-4 border-primary/20 text-primary"
                          />
                          <span className="text-sm text-muted-foreground">
                            {type}
                          </span>
                        </label>
                      ))}
                    </div>
                    {touched.service && errors.service && (
                      <p className="text-sm text-destructive">
                        {errors.service}
                      </p>
                    )}
                  </div>

                  {/* Zone Selection */}
                  <div className="space-y-2">
                    <Label className="text-base">Zone</Label>
                    <Select
                      name="zone"
                      value={values.zone}
                      onValueChange={(value) => {
                        setFieldValue("zone", value);
                        setFieldValue("city", "");
                      }}
                    >
                      <SelectTrigger className="w-full border-primary/20">
                        <SelectValue placeholder="Select zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {["north", "center", "south"].map((zone) => (
                          <SelectItem key={zone} value={zone}>
                            {zone.charAt(0).toUpperCase() + zone.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {touched.zone && errors.zone && (
                      <p className="text-sm text-destructive">{errors.zone}</p>
                    )}
                  </div>

                  {/* City Selection */}
                  <div className="space-y-2">
                    <Label className="text-base">City</Label>
                    <Select
                      name="city"
                      value={values.city}
                      onValueChange={(value) => setFieldValue("city", value)}
                    >
                      <SelectTrigger className="w-full border-primary/20">
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities
                          .filter((city) => city.zone === values.zone)
                          .map((city) => (
                            <SelectItem key={city._id} value={city._id}>
                              {city.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {touched.city && errors.city && (
                      <p className="text-sm text-destructive">{errors.city}</p>
                    )}
                  </div>

                  {/* Item */}
                  <div className="space-y-2">
                    <Label className="text-base">Item</Label>
                    <Field
                      as={Input}
                      name="item"
                      placeholder="Enter item name"
                      className="border-primary/20"
                    />
                    {touched.item && errors.item && (
                      <p className="text-sm text-destructive">{errors.item}</p>
                    )}
                  </div>

                  {/* Item Description */}
                  <div className="space-y-2">
                    <Label className="text-base">Item Description</Label>
                    <Field
                      as={Textarea}
                      name="itemDescription"
                      placeholder="Provide detailed description (size, color, condition, etc.)"
                      className="min-h-[100px] border-primary/20"
                    />
                    {touched.itemDescription && errors.itemDescription && (
                      <p className="text-sm text-destructive">
                        {errors.itemDescription}
                      </p>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="space-y-2">
                    <Label className="text-base">Quantity</Label>
                    <Field
                      as={Input}
                      type="number"
                      name="quantity"
                      min="1"
                      className="border-primary/20"
                    />
                    {touched.quantity && errors.quantity && (
                      <p className="text-sm text-destructive">
                        {errors.quantity}
                      </p>
                    )}
                  </div>

                  {/* Agreement */}
                  <div className="flex items-start gap-2 p-3 bg-background/50 rounded-lg border border-primary/10">
                    <div className="flex h-4 items-center">
                      <Checkbox
                        checked={values.agreeToShareDetails}
                        onCheckedChange={(checked: boolean) =>
                          setFieldValue("agreeToShareDetails", checked)
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-foreground">
                        Share Contact Information
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        I agree to share my contact details with verified donors
                        who express interest in fulfilling my request
                      </p>
                    </div>
                  </div>
                  {touched.agreeToShareDetails &&
                    errors.agreeToShareDetails && (
                      <p className="text-sm text-destructive mt-2">
                        {errors.agreeToShareDetails}
                      </p>
                    )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Package className="h-4 w-4" />
                        Submit Request
                      </>
                    )}
                  </Button>
                </Form>
              )}
            </Formik>
          </Card>
        </div>
      </div>
    </div>
  );
}
