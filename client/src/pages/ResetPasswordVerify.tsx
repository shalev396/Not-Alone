import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "@/api/api";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { ArrowLeft, AlertCircle, X, Lock } from "lucide-react";
import { ModeToggle } from "@/components/custom-ui/mode-toggle";
import { useEffect, useState } from "react";

// Zod schema for verification and new password
const resetPasswordSchema = z
  .object({
    code: z
      .string()
      .min(6, "Code must be 6 digits")
      .max(6, "Code must be 6 digits")
      .regex(/^[0-9]{6}$/, "Code must contain only numbers"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(50, "Password must be less than 50 characters")
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
        "Password must contain at least one letter and one number"
      ),
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
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!userId || !email || !isPasswordReset) {
      navigate("/forgot-password");
      return;
    }
    generateCode();
  }, [userId, email, isPasswordReset, navigate]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const generateCode = async () => {
    if (cooldown > 0) {
      setErrorMessage(
        `Please wait ${cooldown} seconds before requesting a new code`
      );
      setShowError(true);
      return;
    }

    try {
      const response = await api.post(
        "/auth/verify-2fa/reset-password/generate",
        {
          email,
        }
      );
      setDeviceToken(response.data.deviceToken);
      setShowError(false);
      setCooldown(60); // Start 60-second cooldown
    } catch (error: any) {
      console.error("Failed to generate code:", error);
      setErrorMessage("Failed to generate code. Please try again.");
      setShowError(true);
    }
  };

  const handleSubmit = async (
    values: ResetPasswordForm,
    { setSubmitting, setFieldError }: any
  ) => {
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
      setErrorMessage(errorMessage);
      setShowError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <div className="w-full max-w-md mx-auto">
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

            {/* Error Alert */}
            {showError && (
              <div className="bg-destructive/15 text-destructive rounded-lg p-3 flex items-center gap-2 relative">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p className="text-sm">{errorMessage}</p>
                <button
                  onClick={() => setShowError(false)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-destructive/10 rounded-full"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <Formik
              initialValues={{ code: "", password: "", confirmPassword: "" }}
              validationSchema={toFormikValidationSchema(resetPasswordSchema)}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, touched, errors }) => (
                <Form className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label
                        htmlFor="code"
                        className="text-sm font-medium leading-none"
                      >
                        Verification Code
                      </label>
                      <Button
                        type="button"
                        variant="link"
                        className="px-0 font-normal h-auto"
                        onClick={generateCode}
                        disabled={cooldown > 0 || isSubmitting}
                      >
                        {cooldown > 0
                          ? `Resend Code (${cooldown}s)`
                          : "Resend Code"}
                      </Button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Field
                        id="code"
                        name="code"
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        className={`flex h-11 w-full rounded-md border ${
                          touched.code && errors.code
                            ? "border-destructive"
                            : "border-input"
                        } bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                      />
                    </div>
                    <ErrorMessage
                      name="code"
                      component="p"
                      className="text-sm text-destructive mt-1"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium leading-none"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Field
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Enter new password"
                        className={`flex h-11 w-full rounded-md border ${
                          touched.password && errors.password
                            ? "border-destructive"
                            : "border-input"
                        } bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                      />
                    </div>
                    <ErrorMessage
                      name="password"
                      component="p"
                      className="text-sm text-destructive mt-1"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium leading-none"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Field
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                        className={`flex h-11 w-full rounded-md border ${
                          touched.confirmPassword && errors.confirmPassword
                            ? "border-destructive"
                            : "border-input"
                        } bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                      />
                    </div>
                    <ErrorMessage
                      name="confirmPassword"
                      component="p"
                      className="text-sm text-destructive mt-1"
                    />
                  </div>

                  <Button
                    className="w-full h-11 text-base"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Resetting..." : "Reset Password"}
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
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
}
