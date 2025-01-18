import { z } from "zod";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Define available roles
const UserRoles = [
  "Soldier",
  "Municipality",
  "Donor",
  "Organization",
  "Business",
] as const;

type UserRole = (typeof UserRoles)[number];

// Zod schema for signup validation
const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  passport: z
    .string()
    .min(8, "Passport number must be at least 8 characters")
    .min(1, "Passport number is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(
      /^\+?\d+$/,
      "Phone number can only contain numbers with an optional + at the start"
    )
    .refine((val) => {
      // Remove the + if it exists to check the actual number length
      const numberOnly = val.startsWith("+") ? val.slice(1) : val;
      return numberOnly.length >= 9 && numberOnly.length <= 14;
    }, "Phone number must be between 9 and 14 digits"),
  personalIdentificationNumber: z
    .string()
    .refine(
      (val) => !val || /^[0-9]+$/.test(val),
      "Personal ID must contain only numbers"
    )
    .refine(
      (val) => !val || val.length === 9,
      "Personal ID must be exactly 9 digits"
    )
    .optional(),
  type: z.enum(UserRoles, {
    required_error: "Please select an account type",
  }),
  organizationName: z.string().optional(),
  organizationId: z.string().optional(),
  businessName: z.string().optional(),
  businessId: z.string().optional(),
  municipalityName: z.string().optional(),
});

type FormData = {
  firstName: string;
  lastName: string;
  passport: string;
  email: string;
  password: string;
  phone: string;
  personalIdentificationNumber: string;
  type: UserRole | "";
  organizationName: string;
  organizationId: string;
  businessName: string;
  businessId: string;
  municipalityName: string;
};

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    passport: "",
    email: "",
    password: "",
    phone: "",
    personalIdentificationNumber: "",
    type: "",
    organizationName: "",
    organizationId: "",
    businessName: "",
    businessId: "",
    municipalityName: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );

  const validateForm = () => {
    try {
      if (!formData.type) {
        setErrors({ type: "Please select an account type" });
        return false;
      }

      // Additional validation based on type
      if (formData.type === "Organization" && !formData.organizationName) {
        setErrors({ organizationName: "Organization name is required" });
        return false;
      }

      if (formData.type === "Business" && !formData.businessName) {
        setErrors({ businessName: "Business name is required" });
        return false;
      }

      if (formData.type === "Municipality" && !formData.municipalityName) {
        setErrors({ municipalityName: "Municipality name is required" });
        return false;
      }

      const validationResult = signupSchema.safeParse({
        ...formData,
        type: formData.type as UserRole,
      });

      if (!validationResult.success) {
        const newErrors: Partial<Record<keyof FormData, string>> = {};
        validationResult.error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof FormData] = err.message;
          }
        });
        setErrors(newErrors);
        return false;
      }

      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ type: error.message });
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrors({});

    if (!validateForm()) {
      return;
    }

    if (!formData.type) {
      setErrors({ type: "Please select an account type" });
      return;
    }

    setLoading(true);

    try {
      // Prepare the data based on the user type
      const submitData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        passport: formData.passport,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        type: formData.type,
      };

      // Add type-specific fields
      if (formData.type === "Organization") {
        Object.assign(submitData, {
          organizationName: formData.organizationName,
          organizationId: formData.organizationId,
        });
      } else if (formData.type === "Business") {
        Object.assign(submitData, {
          businessName: formData.businessName,
          businessId: formData.businessId,
        });
      } else if (formData.type === "Municipality") {
        Object.assign(submitData, {
          municipalityName: formData.municipalityName,
        });
      } else if (formData.type === "Soldier") {
        Object.assign(submitData, {
          personalIdentificationNumber: formData.personalIdentificationNumber,
        });
      }

      const response = await api.post("/signup-requests", submitData);

      // Navigate to pending page with request data
      navigate("/pending", {
        state: {
          token: response.data.token,
          request: response.data.request,
        },
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Failed to submit signup request";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleTypeChange = (value: UserRole) => {
    setFormData({
      ...formData,
      type: value,
    });
  };

  // Determine which additional fields to show based on type
  const showOrganizationFields = formData.type === "Organization";
  const showBusinessFields = formData.type === "Business";
  const showMunicipalityFields = formData.type === "Municipality";
  const showPersonalIdField = formData.type === "Soldier";

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="w-full">
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Account Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleTypeChange(value as UserRole)}
                >
                  <SelectTrigger
                    className={cn(
                      "w-full",
                      errors.type ? "border-red-500" : ""
                    )}
                  >
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    {UserRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="passport">Passport Number</Label>
                <Input
                  id="passport"
                  placeholder="AB123456"
                  required
                  value={formData.passport}
                  onChange={handleChange}
                  className={errors.passport ? "border-red-500" : ""}
                />
                {errors.passport && (
                  <p className="text-sm text-red-500">{errors.passport}</p>
                )}
              </div>

              {showOrganizationFields && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="organizationName">Organization Name</Label>
                    <Input
                      id="organizationName"
                      placeholder="Organization Name"
                      required
                      value={formData.organizationName}
                      onChange={handleChange}
                      className={
                        errors.organizationName ? "border-red-500" : ""
                      }
                    />
                    {errors.organizationName && (
                      <p className="text-sm text-red-500">
                        {errors.organizationName}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="organizationId">Organization ID</Label>
                    <Input
                      id="organizationId"
                      placeholder="Organization ID Number"
                      value={formData.organizationId}
                      onChange={handleChange}
                      className={errors.organizationId ? "border-red-500" : ""}
                    />
                    {errors.organizationId && (
                      <p className="text-sm text-red-500">
                        {errors.organizationId}
                      </p>
                    )}
                  </div>
                </>
              )}

              {showBusinessFields && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      placeholder="Business Name"
                      required
                      value={formData.businessName}
                      onChange={handleChange}
                      className={errors.businessName ? "border-red-500" : ""}
                    />
                    {errors.businessName && (
                      <p className="text-sm text-red-500">
                        {errors.businessName}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="businessId">Business ID</Label>
                    <Input
                      id="businessId"
                      placeholder="Business ID Number"
                      value={formData.businessId}
                      onChange={handleChange}
                      className={errors.businessId ? "border-red-500" : ""}
                    />
                    {errors.businessId && (
                      <p className="text-sm text-red-500">
                        {errors.businessId}
                      </p>
                    )}
                  </div>
                </>
              )}

              {showMunicipalityFields && (
                <div className="grid gap-2">
                  <Label htmlFor="municipalityName">Municipality Name</Label>
                  <Input
                    id="municipalityName"
                    placeholder="Municipality Name"
                    required
                    value={formData.municipalityName}
                    onChange={handleChange}
                    className={errors.municipalityName ? "border-red-500" : ""}
                  />
                  {errors.municipalityName && (
                    <p className="text-sm text-red-500">
                      {errors.municipalityName}
                    </p>
                  )}
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+1234567890"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone}</p>
                )}
              </div>

              {showPersonalIdField && (
                <div className="grid gap-2">
                  <Label htmlFor="personalIdentificationNumber">
                    Personal ID Number
                  </Label>
                  <Input
                    id="personalIdentificationNumber"
                    placeholder="123456789"
                    value={formData.personalIdentificationNumber}
                    onChange={handleChange}
                    className={
                      errors.personalIdentificationNumber
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {errors.personalIdentificationNumber && (
                    <p className="text-sm text-red-500">
                      {errors.personalIdentificationNumber}
                    </p>
                  )}
                </div>
              )}

              {error && (
                <div className="text-sm text-red-500 p-2 bg-red-50 dark:bg-red-950/50 rounded-md">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>

              <Button variant="outline" className="w-full">
                Sign up with Google
              </Button>

              <div className="text-center text-sm">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="underline underline-offset-4"
                >
                  Login
                </button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
