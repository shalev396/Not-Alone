import { useState } from "react";
import { api } from "@/api/api";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { uploadImage } from "@/components/shared/UploadPhoto";
import { Navbar } from "@/components/shared/Navbar";
import { Formik, Form, Field } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  AlertCircle,
  X,
  Upload,
  MapPin,
  Package2,
  FileText,
  ImageIcon,
  ArrowLeft,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/Redux/store";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Constants
const categories = [
  "Health & Wellness",
  "Clothes",
  "Gear & Equipment",
  "Electronics",
  "Entertainment",
  "Home",
] as const;

// Zod schema for form validation
const dealSchema = z.object({
    category: z.enum(categories, {
      required_error: "Please select a category",
    }),
    title: z.string().min(3).max(100),
    description: z.string().max(1000).optional(),
    media: z.array(z.string()).max(10), 
});

type DealForm = z.infer<typeof dealSchema>;

export default function NewDeal() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const user = useSelector((state: RootState) => state.user);

  // Redirect soldiers away from this page
  if (user.type === "Soldier") {
    return (
      <div className="flex h-screen bg-background">
        <Navbar isVertical isAccordion modes="home" />
        <div className="flex-1 overflow-auto">
          <div className="container max-w-3xl py-6 pl-20 md:pl-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Soldiers cannot create deals. This feature is only available
                for business.
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="mt-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleImageUpload = async (
    file: File,
    setFieldValue: any,
    values: DealForm
  ) => {
    try {
      const imageUrl = await uploadImage(file);
      setFieldValue("media", [...values.media, imageUrl]);
    } catch (error) {
      console.error("Error uploading image:", error);
      setServerError("Failed to upload image. Please try again.");
      setShowError(true);
    }
  };

  const initialValues: DealForm = {
    category: "Electronics",
    title: "",
    description: "",
    media: [],
  };

  return (
    <div className="flex h-screen bg-background">
      <Navbar isVertical isAccordion modes="home" />

      <div className="flex-1 overflow-auto">
        <div className="container max-w-3xl py-6 pl-20 md:pl-6">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-primary/60 to-primary text-transparent bg-clip-text">
                Create New Deal
              </span>
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Support our Lone Soldiers by offering special deals at your business
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              {showError && (
                <div className="bg-destructive/15 text-destructive rounded-lg p-3 flex items-center gap-2 relative mb-6">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <p className="text-sm">{serverError}</p>
                  <button
                    onClick={() => setShowError(false)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-destructive/10 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <Formik
                initialValues={initialValues}
                validationSchema={toFormikValidationSchema(dealSchema)}
                onSubmit={async (values, { setSubmitting }) => {
                  setServerError(null);
                  setShowError(false);
                  try {
                    await api.post("/deals", values);
                    navigate("/my-deals");
                  } catch (error: any) {
                    const errorMessage =
                      error.response?.data?.error ||
                      "Failed to create new deal. Please try again.";
                    setServerError(errorMessage);
                    setShowError(true);
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {({ isSubmitting, touched, errors, setFieldValue, values }) => (
                  <Form className="space-y-6">
                    <div className="grid gap-6">

                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Package2 className="h-4 w-4 text-primary" />
                          Category *
                        </FormLabel>
                        <Field name="category">
                          {({ field }: any) => (
                            <Select
                              value={field.value}
                              onValueChange={(value) =>
                                setFieldValue("category", value)
                              }
                            >
                              <SelectTrigger
                                className={
                                  touched.category && errors.category
                                    ? "border-destructive"
                                    : ""
                                }
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
                          )}
                        </Field>
                        {touched.category && errors.category && (
                          <FormMessage>{errors.category as string}</FormMessage>
                        )}
                      </FormItem>

                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          Title *
                        </FormLabel>
                        <Field name="title">
                          {({ field }: any) => (
                            <Input
                              {...field}
                              placeholder="Enter a descriptive title"
                              className={
                                touched.title && errors.title
                                  ? "border-destructive"
                                  : ""
                              }
                            />
                          )}
                        </Field>
                        {touched.title && errors.title && (
                          <FormMessage>{errors.title as string}</FormMessage>
                        )}
                      </FormItem>

                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          Description
                        </FormLabel>
                        <Field name="description">
                          {({ field }: any) => (
                            <Textarea
                              {...field}
                              placeholder="Provide additional details about your donation"
                              className={
                                touched.description && errors.description
                                  ? "border-destructive"
                                  : ""
                              }
                            />
                          )}
                        </Field>
                        {touched.description && errors.description && (
                          <FormMessage>
                            {errors.description as string}
                          </FormMessage>
                        )}
                      </FormItem>

                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <ImageIcon className="h-4 w-4 text-primary" />
                          Photos
                        </FormLabel>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full h-20 border-dashed"
                              onClick={() => {
                                const input = document.createElement("input");
                                input.type = "file";
                                input.accept = "image/*";
                                input.onchange = async (e) => {
                                  const file = (e.target as HTMLInputElement)
                                    .files?.[0];
                                  if (file) {
                                    await handleImageUpload(
                                      file,
                                      setFieldValue,
                                      values
                                    );
                                  }
                                };
                                input.click();
                              }}
                            >
                              <div className="flex flex-col items-center gap-2">
                                <Upload className="h-5 w-5 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  Click to upload photos
                                </span>
                              </div>
                            </Button>
                          </div>

                          {values.media.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                              {values.media.map((url, index) => (
                                <div
                                  key={index}
                                  className="relative group aspect-square"
                                >
                                  <img
                                    src={url}
                                    alt={`Uploaded ${index + 1}`}
                                    className="w-full h-full object-cover rounded-md"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFieldValue(
                                        "media",
                                        values.media.filter(
                                          (_, i) => i !== index
                                        )
                                      );
                                    }}
                                    className="absolute top-2 right-2 bg-destructive/90 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {values.media.length > 0 && (
                            <p className="text-sm text-muted-foreground">
                              {values.media.length} photo
                              {values.media.length !== 1 ? "s" : ""} uploaded
                              {values.media.length >= 10 &&
                                " (Maximum reached)"}
                            </p>
                          )}
                        </div>
                      </FormItem>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/my-deals")}
                        className="w-full sm:w-auto"
                      >
                        My Deals
                      </Button>
                      <Button
                        type="submit"
                        className="w-full sm:w-auto bg-gradient-to-r from-primary/60 to-primary hover:opacity-90 transition-opacity"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Creating..." : "Create Deal"}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
