import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "@/api/api";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { ArrowLeft, AlertCircle, X, Lock } from "lucide-react";
import { ModeToggle } from "@/components/custom-ui/mode-toggle";
import { useEffect, useState } from "react";

// Zod schema for verification code
const verificationSchema = z.object({
  code: z
    .string()
    .min(6, "Code must be 6 digits")
    .max(6, "Code must be 6 digits")
    .regex(/^[0-9]{6}$/, "Code must contain only numbers"),
});

type VerificationForm = z.infer<typeof verificationSchema>;

export default function TwoFactorAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [deviceToken, setDeviceToken] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { userId, email, isLogin } = location.state || {};

  useEffect(() => {
    if (!userId || !email) {
      navigate(isLogin ? "/login" : "/signup");
      return;
    }
    generateCode();
  }, [userId, email, isLogin, navigate]);

  const generateCode = async () => {
    try {
      const response = await api.post("/verify-2fa/generate", {
        userId,
      });
      setDeviceToken(response.data.deviceToken);
      setShowError(false);
    } catch (error: any) {
      console.error("Failed to generate code:", error);
      setErrorMessage(
        "Failed to generate verification code. Please try again."
      );
      setShowError(true);
      setTimeout(() => {
        navigate(isLogin ? "/login" : "/signup");
      }, 3000);
    }
  };

  const handleSubmit = async (
    values: VerificationForm,
    { setSubmitting, setFieldError }: any
  ) => {
    if (!deviceToken) {
      setFieldError("code", "Please try again, session expired");
      return;
    }

    try {
      const response = await api.post("/verify-2fa/verify", {
        userId,
        code: values.code,
        deviceToken,
      });

      if (response.data.verified) {
        if (isLogin) {
          // Handle login flow
          const userData = JSON.parse(sessionStorage.getItem("user") || "{}");
          navigate("/pending", {
            state: { user: userData },
            replace: true,
          });
        } else {
          // Handle signup flow
          const userData = JSON.parse(sessionStorage.getItem("user") || "{}");
          navigate("/pending", {
            state: { request: userData },
            replace: true,
          });
        }
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Invalid verification code";
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
                  Two-Factor Authentication
                </span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Please enter the verification code sent to {email}
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
              initialValues={{ code: "" }}
              validationSchema={toFormikValidationSchema(verificationSchema)}
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
                        disabled={isSubmitting}
                      >
                        Resend Code
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

                  <Button
                    className="w-full h-11 text-base"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Verifying..." : "Verify Code"}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full h-11 text-base"
                    type="button"
                    onClick={() => navigate(isLogin ? "/login" : "/signup")}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to {isLogin ? "Login" : "Sign Up"}
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
