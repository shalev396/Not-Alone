import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { uploadImage } from "@/components/shared/UploadPhoto";
import { api } from "@/api/api";
import { Calendar } from "@/components/ui/calendar";
import {
  CalendarIcon,
  MapPin,
  Building2,
  Type,
  Languages,
  Users,
  UtensilsCrossed,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { format } from "date-fns";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import upload from "@/assets/upload.png";
import { useState } from "react";

// Define city type to match backend response
interface City {
  _id: string;
  name: string;
  zone: string;
  bio?: string;
  media?: string[];
  approvalStatus: string;
}

// Constants
const hostingTypes = ["organization", "donators", "city"] as const;
const languages = [
  "Hebrew",
  "English",
  "Arabic",
  "Russian",
  "Amharic",
] as const;

// Zod schema
const eatupSchema = z.object({
  city: z.string().nullable(),
  location: z.string().min(3, "Location must be at least 3 characters"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  media: z.array(z.string()).default([]),
  date: z
    .string()
    .min(1, "Date and time are required")
    .refine(
      (date) => new Date(date) > new Date(),
      "Date must be in the future"
    ),
  kosher: z.boolean(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  languages: z
    .array(z.enum(languages))
    .min(1, "At least one language is required"),
  hosting: z.enum(hostingTypes),
  limit: z.number().min(2, "Minimum 2 guests").max(100, "Maximum 100 guests"),
});

type EatupFormValues = z.infer<typeof eatupSchema>;

// Component
export default function NewEatup() {
  const navigate = useNavigate();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { data: cities = [], isLoading: isLoadingCities } = useQuery<City[]>({
    queryKey: ["cities"],
    queryFn: async () => {
      const response = await api.get("/cities");
      return response.data;
    },
  });

  const initialValues: EatupFormValues = {
    city: null,
    location: "",
    title: "",
    media: [],
    date: "",
    kosher: false,
    description: "",
    languages: ["Hebrew"],
    hosting: "organization",
    limit: 2,
  };

  const handleSubmit = async (
    values: EatupFormValues,
    { setSubmitting, setStatus }: any
  ) => {
    try {
      const submitData = {
        ...values,
        date: new Date(values.date).toISOString(),
        media: [values.media[0]],
        authorId: sessionStorage.getItem("id"),
        owner: sessionStorage.getItem("id"),
        language: values.languages[0],
        limit: values.limit.toString(),
      };

      await api.post("/eatups", submitData);
      navigate("/my-eatups");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Failed to create EatUp";
      setStatus(errorMessage);
      setErrorMessage(errorMessage);
      setShowError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex bg-background text-foreground min-h-screen">
      <Navbar modes="home2" isVertical={true} isAccordion={true} />

      <div className="flex-1 p-6 pl-[72px] sm:pl-20 md:pl-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center gap-4 mb-8">
            <h2 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-primary/60 to-primary text-transparent bg-clip-text">
                Create EatUp
              </span>
            </h2>
            <Button
              onClick={() => navigate("/my-eatups")}
              className="bg-gradient-to-r from-primary/80 to-primary hover:opacity-90 transition-opacity h-10 px-4"
              size="lg"
            >
              View My EatUps
            </Button>
          </div>

          <Card className="p-4 sm:p-6">
            <div className="space-y-6">
              <p className="text-muted-foreground text-center">
                Host a meal and connect with fellow soldiers
              </p>

              {showError && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              <Formik
                initialValues={initialValues}
                validationSchema={toFormikValidationSchema(eatupSchema)}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, touched, errors, setFieldValue, values }) => (
                  <Form className="grid gap-6">
                    {/* City and Location Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <Select
                          value={values.city || "none"}
                          onValueChange={(value) =>
                            setFieldValue(
                              "city",
                              value === "none" ? null : value
                            )
                          }
                        >
                          <SelectTrigger
                            className={
                              touched.city && errors.city
                                ? "border-destructive"
                                : ""
                            }
                          >
                            <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Select city (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None of these</SelectItem>
                            {cities.map((city) => (
                              <SelectItem key={city._id} value={city._id}>
                                {city.name} (
                                {city.zone.charAt(0).toUpperCase() +
                                  city.zone.slice(1)}
                                )
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <ErrorMessage
                          name="city"
                          component="p"
                          className="text-sm text-destructive mt-1"
                        />
                      </FormItem>

                      <FormItem>
                        <FormLabel>Location *</FormLabel>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Field
                            as={Input}
                            name="location"
                            placeholder="Enter specific location"
                            className={`pl-10 ${
                              touched.location && errors.location
                                ? "border-destructive"
                                : ""
                            }`}
                          />
                        </div>
                        <ErrorMessage
                          name="location"
                          component="p"
                          className="text-sm text-destructive mt-1"
                        />
                      </FormItem>
                    </div>

                    {/* Title and Date Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <div className="relative">
                          <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Field
                            as={Input}
                            name="title"
                            placeholder="Enter title"
                            className={`pl-10 ${
                              touched.title && errors.title
                                ? "border-destructive"
                                : ""
                            }`}
                          />
                        </div>
                        <ErrorMessage
                          name="title"
                          component="p"
                          className="text-sm text-destructive mt-1"
                        />
                      </FormItem>

                      <FormItem>
                        <FormLabel>Date and Time *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant={"outline"}
                              className={`w-full justify-start text-left font-normal ${
                                touched.date && errors.date
                                  ? "border-destructive"
                                  : ""
                              }`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {values.date ? (
                                format(new Date(values.date), "PPP HH:mm")
                              ) : (
                                <span>Pick a date and time</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={
                                values.date ? new Date(values.date) : undefined
                              }
                              onSelect={(date) => {
                                if (date) {
                                  const currentDate = values.date
                                    ? new Date(values.date)
                                    : new Date();
                                  date.setHours(currentDate.getHours());
                                  date.setMinutes(currentDate.getMinutes());
                                  setFieldValue("date", date.toISOString());
                                }
                              }}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                            <div className="p-3 border-t">
                              <Input
                                type="time"
                                value={
                                  values.date
                                    ? format(new Date(values.date), "HH:mm")
                                    : ""
                                }
                                onChange={(e) => {
                                  const [hours, minutes] =
                                    e.target.value.split(":");
                                  const newDate = values.date
                                    ? new Date(values.date)
                                    : new Date();
                                  newDate.setHours(parseInt(hours));
                                  newDate.setMinutes(parseInt(minutes));
                                  setFieldValue("date", newDate.toISOString());
                                }}
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
                        <ErrorMessage
                          name="date"
                          component="p"
                          className="text-sm text-destructive mt-1"
                        />
                      </FormItem>
                    </div>

                    {/* Hosting, Language, and Guest Limit Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormItem>
                        <FormLabel>Hosting Type *</FormLabel>
                        <Select
                          value={values.hosting}
                          onValueChange={(value) =>
                            setFieldValue("hosting", value)
                          }
                        >
                          <SelectTrigger
                            className={
                              touched.hosting && errors.hosting
                                ? "border-destructive"
                                : ""
                            }
                          >
                            <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {hostingTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <ErrorMessage
                          name="hosting"
                          component="p"
                          className="text-sm text-destructive mt-1"
                        />
                      </FormItem>

                      <FormItem>
                        <FormLabel>Language *</FormLabel>
                        <Select
                          value={values.languages[0]}
                          onValueChange={(value) =>
                            setFieldValue("languages", [value])
                          }
                        >
                          <SelectTrigger
                            className={
                              touched.languages && errors.languages
                                ? "border-destructive"
                                : ""
                            }
                          >
                            <Languages className="mr-2 h-4 w-4 text-muted-foreground" />
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
                        <ErrorMessage
                          name="languages"
                          component="p"
                          className="text-sm text-destructive mt-1"
                        />
                      </FormItem>

                      <FormItem>
                        <FormLabel>Guest Limit *</FormLabel>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Field
                            as={Input}
                            type="number"
                            name="limit"
                            placeholder="Max guests"
                            min={2}
                            max={100}
                            className={`pl-10 ${
                              touched.limit && errors.limit
                                ? "border-destructive"
                                : ""
                            }`}
                          />
                        </div>
                        <ErrorMessage
                          name="limit"
                          component="p"
                          className="text-sm text-destructive mt-1"
                        />
                      </FormItem>
                    </div>

                    {/* Kosher Switch */}
                    <FormItem>
                      <FormLabel>Kosher</FormLabel>
                      <Select
                        value={values.kosher ? "yes" : "no"}
                        onValueChange={(value) =>
                          setFieldValue("kosher", value === "yes")
                        }
                      >
                        <SelectTrigger>
                          <UtensilsCrossed className="mr-2 h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Is it kosher?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>

                    {/* Description */}
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Field
                          as={Textarea}
                          name="description"
                          placeholder="Tell us about your EatUp event..."
                          className={`pl-10 min-h-[80px] ${
                            touched.description && errors.description
                              ? "border-destructive"
                              : ""
                          }`}
                        />
                      </div>
                      <ErrorMessage
                        name="description"
                        component="p"
                        className="text-sm text-destructive mt-1"
                      />
                    </FormItem>

                    {/* Image Upload */}
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        Event Image
                      </FormLabel>
                      <div className="space-y-4">
                        <input
                          type="file"
                          id="file-upload"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setPreviewUrl(URL.createObjectURL(file));
                              const imageUrl = await uploadImage(file);
                              setFieldValue("media", [imageUrl]);
                            }
                          }}
                        />

                        <div className="flex items-center gap-4">
                          {previewUrl && (
                            <div className="relative w-40 h-40">
                              <img
                                src={previewUrl}
                                alt="Preview"
                                className="w-full h-full object-cover rounded-lg shadow-md border border-border"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewUrl(null);
                                  setFieldValue("media", []);
                                }}
                                className="absolute top-[-10px] right-[-10px] bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-destructive/90"
                              >
                                ×
                              </button>
                            </div>
                          )}
                        </div>

                        <ErrorMessage
                          name="media"
                          component="p"
                          className="text-sm text-destructive mt-1"
                        />
                        {values.media.length > 0 && !errors.media && (
                          <p className="text-sm text-muted-foreground">
                            Image uploaded successfully
                          </p>
                        )}
                      </div>
                    </FormItem>

                    <div className="flex items-center gap-4">
                      <label
                        htmlFor={previewUrl ? undefined : "file-upload"}
                        className={`${
                          previewUrl
                            ? "opacity-50 cursor-not-allowed bg-muted"
                            : "cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground"
                        } h-10 w-10 rounded-lg shadow-md inline-flex items-center justify-center transition-colors`}
                      >
                        <img
                          src={upload}
                          alt="upload"
                          className={`w-5 h-5 ${
                            previewUrl ? "opacity-50" : ""
                          }`}
                        />
                      </label>
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-primary/80 to-primary hover:opacity-90 transition-opacity"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Creating..." : "Create EatUp"}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
