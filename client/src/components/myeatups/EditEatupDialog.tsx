import { api } from "@/api/api";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Formik, Form, Field } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { EatUp } from "@/types/EatUps";
import {
  AlertCircle,
  X,
  Building2,
  MapPin,
  Type,
  Calendar as CalendarIcon,
  Languages as LanguagesIcon,
  Users,
  UtensilsCrossed,
  FileText,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Constants
const hostingTypes = ["organization", "donators", "city"] as const;
const languages = [
  "Hebrew",
  "English",
  "Arabic",
  "Russian",
  "Amharic",
] as const;

// Define city type
interface City {
  _id: string;
  name: string;
  zone: string;
}

// Zod schema for form validation
const eatupSchema = z.object({
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

type FormData = z.infer<typeof eatupSchema>;

interface EditEatupDialogProps {
  eatup: EatUp;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function EditEatupDialog({
  eatup,
  isOpen,
  onClose,
  onSave,
}: EditEatupDialogProps) {
  const { data: cities = [] } = useQuery<City[]>({
    queryKey: ["cities"],
    queryFn: async () => {
      const response = await api.get("/cities");
      return response.data;
    },
  });

  const defaultLanguage: (typeof languages)[number] = "Hebrew";
  const initialValues: FormData = {
    city: eatup.city || null,
    location: eatup.location,
    title: eatup.title,
    media: eatup.media || [],
    date: new Date(eatup.date).toISOString().slice(0, 16),
    kosher: eatup.kosher,
    description: eatup.description,
    languages: [
      (eatup.languages?.[0] || defaultLanguage) as (typeof languages)[number],
    ],
    hosting: (eatup.hosting || "organization") as (typeof hostingTypes)[number],
    limit: eatup.limit ?? 2,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            <span className="bg-gradient-to-r from-primary/60 to-primary text-transparent bg-clip-text font-bold">
              Edit EatUp
            </span>
          </DialogTitle>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          validationSchema={toFormikValidationSchema(eatupSchema)}
          onSubmit={async (values, { setSubmitting, setStatus }) => {
            try {
              const eatupData = {
                ...values,
                date: new Date(values.date).toISOString(),
                city: values.city || undefined,
              };

              await api.put(`/eatups/${eatup._id}`, eatupData);
              onSave();
              onClose();
            } catch (error: any) {
              const errorMessage =
                error.response?.data?.error ||
                "Failed to update EatUp. Please try again.";
              setStatus({ error: errorMessage });
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({
            isSubmitting,
            status,
            errors,
            touched,
            setFieldValue,
            values,
          }) => (
            <Form className="space-y-6 py-4">
              {status?.error && (
                <Alert variant="destructive" className="text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{status.error}</AlertDescription>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 top-2"
                    onClick={() => (status.error = null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </Alert>
              )}

              {/* City and Location Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* City - Disabled */}
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Select
                      disabled
                      value={values.city || "none"}
                      onValueChange={(value) =>
                        setFieldValue("city", value === "none" ? null : value)
                      }
                    >
                      <SelectTrigger
                        className={`pl-10 ${
                          errors.city && touched.city
                            ? "border-destructive"
                            : ""
                        }`}
                      >
                        <SelectValue placeholder="Select city (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None of these</SelectItem>
                        {cities.map((city) => (
                          <SelectItem key={city._id} value={city._id}>
                            {city.name} ({city.zone})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.city && touched.city && (
                    <FormMessage>{errors.city}</FormMessage>
                  )}
                </FormItem>

                {/* Location */}
                <FormItem>
                  <FormLabel>Location *</FormLabel>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Field name="location">
                      {({ field }: any) => (
                        <Input
                          {...field}
                          placeholder="Enter specific location (e.g., address, venue name)"
                          className={`pl-10 ${
                            errors.location && touched.location
                              ? "border-destructive"
                              : ""
                          }`}
                        />
                      )}
                    </Field>
                  </div>
                  {errors.location && touched.location && (
                    <FormMessage>{errors.location}</FormMessage>
                  )}
                </FormItem>
              </div>

              {/* Title and Date Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <div className="relative">
                    <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Field name="title">
                      {({ field }: any) => (
                        <Input
                          {...field}
                          placeholder="Enter title"
                          className={`pl-10 ${
                            errors.title && touched.title
                              ? "border-destructive"
                              : ""
                          }`}
                        />
                      )}
                    </Field>
                  </div>
                  {errors.title && touched.title && (
                    <FormMessage>{errors.title}</FormMessage>
                  )}
                </FormItem>

                {/* Date and Time */}
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
                            const [hours, minutes] = e.target.value.split(":");
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
                  {errors.date && touched.date && (
                    <FormMessage>{errors.date}</FormMessage>
                  )}
                </FormItem>
              </div>

              {/* Hosting Type and Languages Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Hosting Type */}
                <FormItem>
                  <FormLabel>Hosting Type *</FormLabel>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Select
                      value={values.hosting}
                      onValueChange={(value: (typeof hostingTypes)[number]) =>
                        setFieldValue("hosting", value)
                      }
                    >
                      <SelectTrigger
                        className={`pl-10 ${
                          errors.hosting && touched.hosting
                            ? "border-destructive"
                            : ""
                        }`}
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
                  </div>
                  {errors.hosting && touched.hosting && (
                    <FormMessage>{errors.hosting}</FormMessage>
                  )}
                </FormItem>

                {/* Languages */}
                <FormItem>
                  <FormLabel>Languages *</FormLabel>
                  <div className="relative">
                    <LanguagesIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Select
                      value={values.languages[0]}
                      onValueChange={(value: (typeof languages)[number]) =>
                        setFieldValue("languages", [value])
                      }
                    >
                      <SelectTrigger
                        className={`pl-10 ${
                          errors.languages && touched.languages
                            ? "border-destructive"
                            : ""
                        }`}
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
                  </div>
                  {errors.languages && touched.languages && (
                    <FormMessage>{errors.languages}</FormMessage>
                  )}
                </FormItem>
              </div>

              {/* Guest Limit and Kosher Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Guest Limit */}
                <FormItem>
                  <FormLabel>Guest Limit *</FormLabel>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Field name="limit">
                      {({ field }: any) => (
                        <Input
                          {...field}
                          type="number"
                          min={2}
                          max={100}
                          placeholder="Enter guest limit"
                          className={`pl-10 ${
                            errors.limit && touched.limit
                              ? "border-destructive"
                              : ""
                          }`}
                        />
                      )}
                    </Field>
                  </div>
                  {errors.limit && touched.limit && (
                    <FormMessage>{errors.limit}</FormMessage>
                  )}
                </FormItem>

                {/* Kosher */}
                <FormItem>
                  <FormLabel>Kosher</FormLabel>
                  <div className="relative">
                    <UtensilsCrossed className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Select
                      value={values.kosher ? "yes" : "no"}
                      onValueChange={(value) =>
                        setFieldValue("kosher", value === "yes")
                      }
                    >
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Is it kosher?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </FormItem>
              </div>

              {/* Description */}
              <FormItem>
                <FormLabel>Description *</FormLabel>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Field name="description">
                    {({ field }: any) => (
                      <Textarea
                        {...field}
                        placeholder="Tell us about your EatUp event..."
                        className={`pl-10 min-h-[120px] ${
                          errors.description && touched.description
                            ? "border-destructive"
                            : ""
                        }`}
                      />
                    )}
                  </Field>
                </div>
                {errors.description && touched.description && (
                  <FormMessage>{errors.description}</FormMessage>
                )}
              </FormItem>

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-primary/80 to-primary hover:opacity-90 transition-opacity"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}
