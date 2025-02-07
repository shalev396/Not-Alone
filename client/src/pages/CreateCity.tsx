import { useState } from "react";
import { api } from "@/api/api";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { uploadImage } from "@/components/shared/UploadPhoto";
import { Card } from "@/components/ui/card";
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
import { FormItem, FormLabel } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Navbar } from "@/components/shared/Navbar";
import { MapPin, Building2, FileText, ImageIcon } from "lucide-react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import upload from "@/assets/upload.png";

// Constants
const zones = ["north", "center", "south"] as const;

// Zod schema for city creation
const citySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  zone: z.enum(zones),
  bio: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
  media: z.array(z.string()).default([]),
});

type CityFormValues = z.infer<typeof citySchema>;

export default function CreateCity() {
  const navigate = useNavigate();
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // const handleImageUpload = async (
  //   file: File,
  //   setFieldValue: any,
  //   values: CityFormValues
  // ) => {
  //   try {
  //     const imageUrl = await uploadImage(file);
  //     setFieldValue("media", [...(values.media || []), imageUrl]);
  //     setPreviewUrl(URL.createObjectURL(file));
  //   } catch (error) {
  //     console.error("Failed to upload image:", error);
  //     setErrorMessage("Failed to upload image. Please try again.");
  //     setShowError(true);
  //   }
  // };

  const handleSubmit = async (
    values: CityFormValues,
    { setSubmitting, setStatus }: any
  ) => {
    try {
      await api.post("/cities", values);
      navigate("/admin/cities");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Failed to create city";
      setStatus(errorMessage);
      setErrorMessage(errorMessage);
      setShowError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const initialValues: CityFormValues = {
    name: "",
    zone: "center",
    bio: "",
    media: [],
  };

  return (
    <div className="flex bg-background text-foreground min-h-screen">
      <Navbar modes="home" isVertical={true} isAccordion={true} />

      <div className="flex-1 p-6 pl-[72px] sm:pl-20 md:pl-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-primary/60 to-primary text-transparent bg-clip-text">
                Create City
              </span>
            </h2>
          </div>

          <Card className="p-4 sm:p-6">
            <div className="space-y-6">
              <p className="text-muted-foreground text-center">
                Add a new city to support Lone Soldiers in your area
              </p>

              {showError && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              <Formik
                initialValues={initialValues}
                validationSchema={toFormikValidationSchema(citySchema)}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, setFieldValue, values, touched, errors }) => (
                  <Form className="grid gap-6">
                    {/* City Name and Zone Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormItem>
                        <FormLabel>City Name *</FormLabel>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Field
                            as={Input}
                            name="name"
                            placeholder="Enter city name"
                            className={`pl-10 ${
                              touched.name && errors.name
                                ? "border-destructive"
                                : ""
                            }`}
                          />
                        </div>
                        <ErrorMessage
                          name="name"
                          component="p"
                          className="text-sm text-destructive mt-1"
                        />
                      </FormItem>

                      <FormItem>
                        <FormLabel>Zone *</FormLabel>
                        <Field name="zone">
                          {({ field, form }: any) => (
                            <Select
                              value={field.value}
                              onValueChange={(value) =>
                                form.setFieldValue("zone", value)
                              }
                            >
                              <SelectTrigger
                                className={`${
                                  touched.zone && errors.zone
                                    ? "border-destructive"
                                    : ""
                                }`}
                              >
                                <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                                <SelectValue placeholder="Select zone" />
                              </SelectTrigger>
                              <SelectContent>
                                {zones.map((zone) => (
                                  <SelectItem key={zone} value={zone}>
                                    {zone.charAt(0).toUpperCase() +
                                      zone.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </Field>
                        <ErrorMessage
                          name="zone"
                          component="p"
                          className="text-sm text-destructive mt-1"
                        />
                      </FormItem>
                    </div>

                    {/* Description */}
                    <FormItem>
                      <FormLabel>City Description *</FormLabel>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Field
                          as={Textarea}
                          name="bio"
                          placeholder="Enter city description"
                          className={`min-h-[100px] pl-10 ${
                            touched.bio && errors.bio
                              ? "border-destructive"
                              : ""
                          }`}
                        />
                      </div>
                      <ErrorMessage
                        name="bio"
                        component="p"
                        className="text-sm text-destructive mt-1"
                      />
                    </FormItem>

                    {/* Images */}
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        City Image
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
                        {isSubmitting ? "Creating..." : "Create City"}
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
