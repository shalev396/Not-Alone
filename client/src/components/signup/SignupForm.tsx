import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/api";
import { useFormik } from "formik";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { ArrowLeft } from "lucide-react";
import { ModeToggle } from "@/components/custom-ui/mode-toggle";

// Zod schema for signup validation
const signupSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    passport: z
      .string()
      .min(8, "Passport number must be at least 8 characters")
      .min(1, "Passport number is required"),
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(50, "Password must be less than 50 characters"),
    confirmPassword: z.string(),
    phone: z
      .string()
      .min(1, "Phone number is required")
      .regex(
        /^\+?\d+$/,
        "Phone number can only contain numbers with an optional + at the start"
      )
      .refine((val) => {
        const numberOnly = val.startsWith("+") ? val.slice(1) : val;
        return numberOnly.length >= 9 && numberOnly.length <= 14;
      }, "Phone number must be between 9 and 14 digits"),
    type: z.enum([
      "Soldier",
      "Donor",
      "Organization",
      "Business",
      "Municipality",
    ]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupForm = z.infer<typeof signupSchema>;

export function SignupForm() {
  const navigate = useNavigate();

  const formik = useFormik<SignupForm>({
    initialValues: {
      firstName: "",
      lastName: "",
      passport: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      type: "Soldier" as const,
    },
    validationSchema: toFormikValidationSchema(signupSchema),
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        const response = await api.post("/auth/register", {
          firstName: values.firstName,
          lastName: values.lastName,
          passport: values.passport,
          email: values.email,
          password: values.password,
          phone: values.phone,
          type: values.type,
        });

        if (response.data.user?._id) {
          // Save user data to session storage
          sessionStorage.setItem("user", JSON.stringify(response.data.user));

          // Check if 2FA needs to be set up
          if (!response.data.user.is2FAEnabled) {
            // Redirect to 2FA setup
            navigate("/2fa", {
              state: {
                userId: response.data.user._id,
                email: values.email,
                isLogin: false,
              },
            });
            return;
          }

          // If 2FA is enabled, check approval status
          if (response.data.user.approvalStatus === "pending") {
            navigate("/pending");
            return;
          }
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Signup failed";
        setFieldError("email", errorMessage);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
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
            Enter your details to create your account
          </p>
        </div>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="firstName"
                className="text-sm font-medium leading-none"
              >
                First Name
              </label>
              <input
                id="firstName"
                placeholder="John"
                className={`flex h-11 w-full rounded-md border ${
                  formik.touched.firstName && formik.errors.firstName
                    ? "border-destructive"
                    : "border-input"
                } bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                {...formik.getFieldProps("firstName")}
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <p className="text-sm text-destructive">
                  {formik.errors.firstName}
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
              <input
                id="lastName"
                placeholder="Doe"
                className={`flex h-11 w-full rounded-md border ${
                  formik.touched.lastName && formik.errors.lastName
                    ? "border-destructive"
                    : "border-input"
                } bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                {...formik.getFieldProps("lastName")}
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <p className="text-sm text-destructive">
                  {formik.errors.lastName}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="passport"
                className="text-sm font-medium leading-none"
              >
                Passport Number
              </label>
              <input
                id="passport"
                placeholder="AB123456"
                className={`flex h-11 w-full rounded-md border ${
                  formik.touched.passport && formik.errors.passport
                    ? "border-destructive"
                    : "border-input"
                } bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                {...formik.getFieldProps("passport")}
              />
              {formik.touched.passport && formik.errors.passport && (
                <p className="text-sm text-destructive">
                  {formik.errors.passport}
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
              <input
                id="phone"
                placeholder="+1234567890"
                className={`flex h-11 w-full rounded-md border ${
                  formik.touched.phone && formik.errors.phone
                    ? "border-destructive"
                    : "border-input"
                } bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                {...formik.getFieldProps("phone")}
              />
              {formik.touched.phone && formik.errors.phone && (
                <p className="text-sm text-destructive">
                  {formik.errors.phone}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none">
              Email
            </label>
            <input
              id="email"
              placeholder="m@example.com"
              className={`flex h-11 w-full rounded-md border ${
                formik.touched.email && formik.errors.email
                  ? "border-destructive"
                  : "border-input"
              } bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
              {...formik.getFieldProps("email")}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-sm text-destructive">{formik.errors.email}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                className={`flex h-11 w-full rounded-md border ${
                  formik.touched.password && formik.errors.password
                    ? "border-destructive"
                    : "border-input"
                } bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                {...formik.getFieldProps("password")}
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-sm text-destructive">
                  {formik.errors.password}
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
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                className={`flex h-11 w-full rounded-md border ${
                  formik.touched.confirmPassword &&
                  formik.errors.confirmPassword
                    ? "border-destructive"
                    : "border-input"
                } bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                {...formik.getFieldProps("confirmPassword")}
              />
              {formik.touched.confirmPassword &&
                formik.errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {formik.errors.confirmPassword}
                  </p>
                )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-medium leading-none">
              Account Type
            </label>
            <select
              id="type"
              className={`flex h-11 w-full rounded-md border ${
                formik.touched.type && formik.errors.type
                  ? "border-destructive"
                  : "border-input"
              } bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
              {...formik.getFieldProps("type")}
            >
              <option value="Soldier">Soldier</option>
              <option value="Donor">Donor</option>
              <option value="Organization">Organization</option>
              <option value="Business">Business</option>
              <option value="Municipality">Municipality</option>
            </select>
            {formik.touched.type && formik.errors.type && (
              <p className="text-sm text-destructive">{formik.errors.type}</p>
            )}
          </div>

          <Button
            className="w-full h-11 text-base"
            type="submit"
            disabled={formik.isSubmitting || !formik.isValid}
          >
            {formik.isSubmitting ? "Creating Account..." : "Create Account"}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              By creating an account, you agree to our{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-normal"
                onClick={() => navigate("/termsofservice")}
              >
                Terms of Service
              </Button>{" "}
              and{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-normal"
                onClick={() => navigate("/privacypolicy")}
              >
                Privacy Policy
              </Button>
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full h-11 text-base"
            type="button"
            onClick={() => navigate("/login")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
        </form>
      </div>
    </div>
  );
}
