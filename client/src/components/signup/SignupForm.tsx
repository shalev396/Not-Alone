import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/api";
import { Formik, Form, Field } from "formik";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import {
  ArrowLeft,
  AlertCircle,
  X,
  Mail,
  Lock,
  User,
  Phone,
  CreditCard,
  Building2,
} from "lucide-react";
import { ModeToggle } from "@/components/custom-ui/mode-toggle";

// Zod schema for signup validation
const signupSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "Name must be less than 50 characters")
      .regex(
        /^[a-zA-Z\s'-]+$/,
        "Name can only contain letters, spaces, hyphens, and apostrophes"
      ),
    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Name must be less than 50 characters")
      .regex(
        /^[a-zA-Z\s'-]+$/,
        "Name can only contain letters, spaces, hyphens, and apostrophes"
      ),
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(50, "Password must be less than 50 characters")
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
        "Password must contain at least one letter and one number"
      ),
    confirmPassword: z.string(),
    phone: z.string().regex(/^\+?[\d\s-]{10,}$/, "Invalid phone format"),
    passport: z.string().min(1, "Passport/ID is required"),
    type: z.enum([
      "Soldier",
      "Municipality",
      "Donor",
      "Organization",
      "Business",
    ]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupForm = z.infer<typeof signupSchema>;

const initialValues: SignupForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  passport: "",
  type: "Soldier",
};

export function SignupForm() {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      <div className="border rounded-lg shadow-sm bg-card">
        <div className="px-8 py-10 space-y-8">
          <div className="flex justify-end">
            <ModeToggle />
          </div>
          <div className="space-y-2 text-center">
            <h1 className="text-3xl md:text-4xl font-bold">
              <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
                Create Account
              </span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Join our community and make a difference
            </p>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={toFormikValidationSchema(signupSchema)}
            onSubmit={async (values, { setSubmitting, setStatus }) => {
              try {
                const response = await api.post("/auth/register", values);

                if (response.data?.user?._id) {
                  // Store user data temporarily
                  sessionStorage.setItem(
                    "user",
                    JSON.stringify(response.data.user)
                  );

                  // Redirect to 2FA setup
                  navigate("/2fa", {
                    state: {
                      userId: response.data.user._id,
                      email: response.data.user.email,
                      isLogin: false,
                    },
                  });
                }
              } catch (error: any) {
                const errorMessage =
                  error.response?.data?.message || "Failed to create account";
                setStatus(errorMessage);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting, touched, errors, status, setStatus }) => (
              <Form className="space-y-6">
                {status && (
                  <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm font-medium flex-grow">{status}</p>
                    <button
                      type="button"
                      onClick={() => setStatus(undefined)}
                      className="text-destructive hover:text-destructive/80 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                )}

                {/* First row - First Name and Last Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="firstName"
                      className="text-sm font-medium leading-none"
                    >
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Field
                        id="firstName"
                        name="firstName"
                        placeholder="First Name"
                        className={`flex h-11 w-full rounded-md border ${
                          touched.firstName && errors.firstName
                            ? "border-destructive"
                            : "border-input"
                        } bg-background pl-10 pr-3 text-sm focus:ring-2 focus:ring-primary`}
                      />
                    </div>
                    {touched.firstName && errors.firstName && (
                      <p className="text-sm text-destructive">
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="lastName"
                      className="text-sm font-medium leading-none"
                    >
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Field
                        id="lastName"
                        name="lastName"
                        placeholder="Last Name"
                        className={`flex h-11 w-full rounded-md border ${
                          touched.lastName && errors.lastName
                            ? "border-destructive"
                            : "border-input"
                        } bg-background pl-10 pr-3 text-sm focus:ring-2 focus:ring-primary`}
                      />
                    </div>
                    {touched.lastName && errors.lastName && (
                      <p className="text-sm text-destructive">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Second row - Passport and Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="passport"
                      className="text-sm font-medium leading-none"
                    >
                      Passport/ID Number
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Field
                        id="passport"
                        name="passport"
                        placeholder="Passport Number"
                        className={`flex h-11 w-full rounded-md border ${
                          touched.passport && errors.passport
                            ? "border-destructive"
                            : "border-input"
                        } bg-background pl-10 pr-3 text-sm focus:ring-2 focus:ring-primary`}
                      />
                    </div>
                    {touched.passport && errors.passport && (
                      <p className="text-sm text-destructive">
                        {errors.passport}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="phone"
                      className="text-sm font-medium leading-none"
                    >
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Field
                        id="phone"
                        name="phone"
                        placeholder="+1234567890"
                        className={`flex h-11 w-full rounded-md border ${
                          touched.phone && errors.phone
                            ? "border-destructive"
                            : "border-input"
                        } bg-background pl-10 pr-3 text-sm focus:ring-2 focus:ring-primary`}
                      />
                    </div>
                    {touched.phone && errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Email field on its own line */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium leading-none"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Field
                      id="email"
                      name="email"
                      type="email"
                      placeholder="m@example.com"
                      className={`flex h-11 w-full rounded-md border ${
                        touched.email && errors.email
                          ? "border-destructive"
                          : "border-input"
                      } bg-background pl-10 pr-3 text-sm focus:ring-2 focus:ring-primary`}
                    />
                  </div>
                  {touched.email && errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                {/* Password and Confirm Password row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium leading-none"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Field
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Create a secure password"
                        className={`flex h-11 w-full rounded-md border ${
                          touched.password && errors.password
                            ? "border-destructive"
                            : "border-input"
                        } bg-background pl-10 pr-3 text-sm focus:ring-2 focus:ring-primary`}
                      />
                    </div>
                    {touched.password && errors.password && (
                      <p className="text-sm text-destructive">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium leading-none"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Field
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        className={`flex h-11 w-full rounded-md border ${
                          touched.confirmPassword && errors.confirmPassword
                            ? "border-destructive"
                            : "border-input"
                        } bg-background pl-10 pr-3 text-sm focus:ring-2 focus:ring-primary`}
                      />
                    </div>
                    {touched.confirmPassword && errors.confirmPassword && (
                      <p className="text-sm text-destructive">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                {/* Account Type field on its own line */}
                <div className="space-y-2">
                  <label
                    htmlFor="type"
                    className="text-sm font-medium leading-none"
                  >
                    Account Type
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Field
                      as="select"
                      id="type"
                      name="type"
                      className={`flex h-11 w-full rounded-md border ${
                        touched.type && errors.type
                          ? "border-destructive"
                          : "border-input"
                      } bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      <option value="Soldier">Soldier</option>
                      <option value="Municipality">Municipality</option>
                      <option value="Donor">Donor</option>
                      <option value="Organization">Organization</option>
                      <option value="Business">Business</option>
                    </Field>
                  </div>
                  {touched.type && errors.type && (
                    <p className="text-sm text-destructive flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {errors.type}
                    </p>
                  )}
                </div>

                <div className="space-y-6 pt-4">
                  <p className="text-sm text-muted-foreground text-center">
                    By creating an account, you agree to our{" "}
                    <Button
                      variant="link"
                      className="h-auto p-0 text-sm font-normal"
                      type="button"
                      onClick={() => navigate("/termsofservice")}
                    >
                      Terms of Service
                    </Button>{" "}
                    and{" "}
                    <Button
                      variant="link"
                      className="h-auto p-0 text-sm font-normal"
                      type="button"
                      onClick={() => navigate("/privacypolicy")}
                    >
                      Privacy Policy
                    </Button>
                  </p>

                  <Button
                    className="w-full h-11 text-base"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating Account..." : "Create Account"}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full h-11 text-base"
                    type="button"
                    onClick={() => navigate("/")}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                  </Button>

                  <p className="text-sm text-muted-foreground text-center">
                    Already have an account?{" "}
                    <a
                      className="text-primary underline-offset-4 hover:underline cursor-pointer"
                      onClick={() => navigate("/login")}
                    >
                      Sign in
                    </a>
                  </p>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
