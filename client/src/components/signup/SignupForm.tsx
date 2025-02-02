import { z } from "zod";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/api";
import { Button } from "@/components/ui/button";
import { Formik, Form } from "formik";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { withZodSchema } from "formik-validator-zod";
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
  type: z.enum(UserRoles, {
    required_error: "Please select an account type",
  }),
});

type FormData = {
  firstName: string;
  lastName: string;
  passport: string;
  email: string;
  password: string;
  phone: string;
  type: UserRole | "Soldier";
};

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: FormData) => {
    try {
      // Prepare the data based on the user type
      const submitData = {
        firstName: values.firstName,
        lastName: values.lastName,
        passport: values.passport,
        email: values.email,
        password: values.password,
        phone: values.phone,
        type: values.type,
      };

      const response = await api.post("/auth/register", submitData);

      // Save user data to session storage
      sessionStorage.setItem("user", JSON.stringify(response.data.user));

      // Redirect to 2FA page
      navigate("/2fa", {
        state: {
          userId: response.data.user._id,
          email: response.data.user.email,
          isLogin: false,
        },
      });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error || "Failed to submit signup request";
      setError(errorMessage);
    }
  };

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
          <Formik<FormData>
            initialValues={{
              firstName: "",
              lastName: "",
              passport: "",
              email: "",
              password: "",
              phone: "",
              type: "Soldier",
            }}
            onSubmit={handleSubmit}
            validate={withZodSchema(signupSchema)}
          >
            {(formik) => (
              <Form className="w-full">
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type">Account Type</Label>
                    <Select
                      value={formik.values.type}
                      onValueChange={(value: UserRole) => {
                        formik.setFieldValue("type", value);
                      }}
                    >
                      <SelectTrigger
                        className={cn(
                          "w-full",
                          formik.errors.type && "border-red-500"
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
                    {formik.errors.type && (
                      <p className="text-sm text-red-500">
                        {formik.errors.type}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        required
                        value={formik.values.firstName}
                        onChange={(e) => {
                          formik.setFieldValue("firstName", e.target.value);
                        }}
                        className={cn(
                          formik.errors.firstName && "border-red-500"
                        )}
                      />
                      {formik.errors.firstName && (
                        <p className="text-sm text-red-500">
                          {formik.errors.firstName}
                        </p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        required
                        value={formik.values.lastName}
                        onChange={(e) => {
                          formik.setFieldValue("lastName", e.target.value);
                        }}
                        className={
                          formik.errors.lastName ? "border-red-500" : ""
                        }
                      />
                      {formik.errors.lastName && (
                        <p className="text-sm text-red-500">
                          {formik.errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="passport">Passport Number</Label>
                    <Input
                      id="passport"
                      placeholder="AB123456"
                      required
                      value={formik.values.passport}
                      onChange={(e) => {
                        formik.setFieldValue("passport", e.target.value);
                      }}
                      className={formik.errors.passport ? "border-red-500" : ""}
                    />
                    {formik.errors.passport && (
                      <p className="text-sm text-red-500">
                        {formik.errors.passport}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={formik.values.email}
                      onChange={(e) => {
                        formik.setFieldValue("email", e.target.value);
                      }}
                      className={formik.errors.email ? "border-red-500" : ""}
                    />
                    {formik.errors.email && (
                      <p className="text-sm text-red-500">
                        {formik.errors.email}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      value={formik.values.password}
                      onChange={(e) => {
                        formik.setFieldValue("password", e.target.value);
                      }}
                      className={formik.errors.password ? "border-red-500" : ""}
                    />
                    {formik.errors.password && (
                      <p className="text-sm text-red-500">
                        {formik.errors.password}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="+1234567890"
                      required
                      value={formik.values.phone}
                      onChange={(e) => {
                        formik.setFieldValue("phone", e.target.value);
                      }}
                      className={formik.errors.phone ? "border-red-500" : ""}
                    />
                    {formik.errors.phone && (
                      <p className="text-sm text-red-500">
                        {formik.errors.phone}
                      </p>
                    )}
                  </div>

                  {error && (
                    <div className="text-sm text-red-500 p-2 bg-red-50 dark:bg-red-950/50 rounded-md">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={formik.isValid}
                  >
                    {formik.isSubmitting
                      ? "Creating account..."
                      : "Create account"}
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
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  );
}
