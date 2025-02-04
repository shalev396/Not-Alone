import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "@/api/api";
import { useFormik } from "formik";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { ArrowLeft } from "lucide-react";
import { ModeToggle } from "@/components/custom-ui/mode-toggle";
import { useEffect, useState } from "react";

// Zod schema for verification code
const verificationSchema = z.object({
  code: z
    .string()
    .min(6, "Code must be 6 digits")
    .max(6, "Code must be 6 digits"),
});

type VerificationForm = z.infer<typeof verificationSchema>;

export default function TwoFactorAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [deviceToken, setDeviceToken] = useState<string | null>(null);
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
    } catch (error: any) {
      console.error("Failed to generate code:", error);
      navigate(isLogin ? "/login" : "/signup");
    }
  };

  const formik = useFormik<VerificationForm>({
    initialValues: {
      code: "",
    },
    validationSchema: toFormikValidationSchema(verificationSchema),
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
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
            // Handle signup flow - redirect to pending page with user data
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
      } finally {
        setSubmitting(false);
      }
    },
  });

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
            <form onSubmit={formik.handleSubmit} className="space-y-6">
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
                    disabled={formik.isSubmitting}
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

              <Button
                className="w-full h-11 text-base"
                type="submit"
                disabled={formik.isSubmitting || !formik.isValid}
              >
                {formik.isSubmitting ? "Verifying..." : "Verify Code"}
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
