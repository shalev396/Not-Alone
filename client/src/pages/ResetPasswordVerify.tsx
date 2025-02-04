import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "@/api/api";
import { useFormik } from "formik";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { ArrowLeft } from "lucide-react";
import { ModeToggle } from "@/components/custom-ui/mode-toggle";
import { useEffect, useState } from "react";

// Zod schema for verification and new password
const resetPasswordSchema = z
  .object({
    code: z
      .string()
      .min(6, "Code must be 6 digits")
      .max(6, "Code must be 6 digits"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(50, "Password must be less than 50 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, email, isPasswordReset } = location.state || {};
  const [deviceToken, setDeviceToken] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !email || !isPasswordReset) {
      navigate("/forgot-password");
      return;
    }

    // Generate new code and get device token on component mount
    const generateCode = async () => {
      try {
        const response = await api.post(
          "/auth/verify-2fa/reset-password/generate",
          {
            email,
          }
        );
        setDeviceToken(response.data.deviceToken);
      } catch (error: any) {
        console.error("Failed to generate code:", error);
        navigate("/forgot-password");
      }
    };

    generateCode();
  }, [userId, email, isPasswordReset, navigate]);

  const formik = useFormik<ResetPasswordForm>({
    initialValues: {
      code: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: toFormikValidationSchema(resetPasswordSchema),
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      if (!deviceToken) {
        setFieldError("code", "Please try again, session expired");
        return;
      }

      try {
        // First verify the code
        const verifyResponse = await api.post(
          "/auth/verify-2fa/reset-password/verify",
          {
            userId,
            code: values.code,
            deviceToken,
          }
        );

        if (verifyResponse.data.verified) {
          // If code is verified, update the password
          await api.post("/auth/verify-2fa/reset-password/update", {
            userId,
            password: values.password,
          });
          navigate("/login");
        }
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || "Verification failed";
        setFieldError("code", errorMessage);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleResendCode = async () => {
    try {
      const response = await api.post(
        "/auth/verify-2fa/reset-password/generate",
        {
          email,
        }
      );
      setDeviceToken(response.data.deviceToken);
      alert("New verification code has been sent to your email");
    } catch (error: any) {
      formik.setFieldError("code", "Failed to resend code");
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <div className="w-full max-w-xl mx-auto">
        <div className="border rounded-lg shadow-sm bg-card">
          <div className="px-8 py-10 space-y-8">
            <div className="flex justify-end">
              <ModeToggle />
            </div>
            <div className="space-y-2 text-center">
              <h1 className="text-3xl md:text-4xl font-bold">
                <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
                  Reset Password
                </span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Enter the verification code sent to {email} and your new
                password
              </p>
            </div>
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="code"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Verification Code
                  </label>
                  <Button
                    type="button"
                    variant="link"
                    className="px-0 font-normal h-auto"
                    onClick={handleResendCode}
                  >
                    Resend Code
                  </Button>
                </div>
                <input
                  id="code"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className={`flex h-11 w-full rounded-md border ${
                    formik.touched.code && formik.errors.code
                      ? "border-destructive"
                      : "border-input"
                  } bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                  {...formik.getFieldProps("code")}
                />
                {formik.touched.code && formik.errors.code && (
                  <p className="text-sm text-destructive">
                    {formik.errors.code}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter new password"
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
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
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
              <Button
                className="w-full h-11 text-base"
                type="submit"
                disabled={formik.isSubmitting || !formik.isValid}
              >
                {formik.isSubmitting ? "Resetting..." : "Reset Password"}
              </Button>
              <Button
                variant="outline"
                className="w-full h-11 text-base"
                type="button"
                onClick={() => navigate("/forgot-password")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Forgot Password
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
