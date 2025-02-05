import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/api";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { ArrowLeft, AlertCircle, X, Mail } from "lucide-react";
import { ModeToggle } from "@/components/custom-ui/mode-toggle";
import { useState } from "react";

// Zod schema for forgot password validation
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(100, "Email must be less than 100 characters"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (
    values: ForgotPasswordForm,
    { setSubmitting, setFieldError }: any
  ) => {
    try {
      const response = await api.post(
        "/auth/verify-2fa/reset-password/generate",
        {
          email: values.email,
        }
      );

      if (response.data.userId) {
        navigate("/reset-password-verify", {
          state: {
            userId: response.data.userId,
            email: values.email,
            isPasswordReset: true,
          },
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Email not found";
      setFieldError("email", errorMessage);
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
                  Forgot Password
                </span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Enter your email and we'll send you a verification code to reset
                your password
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
              initialValues={{ email: "" }}
              validationSchema={toFormikValidationSchema(forgotPasswordSchema)}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, touched, errors }) => (
                <Form className="space-y-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Field
                        id="email"
                        name="email"
                        type="email"
                        placeholder="m@example.com"
                        autoComplete="email"
                        className={`flex h-11 w-full rounded-md border ${
                          touched.email && errors.email
                            ? "border-destructive"
                            : "border-input"
                        } bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                      />
                    </div>
                    <ErrorMessage
                      name="email"
                      component="p"
                      className="text-sm text-destructive mt-1"
                    />
                  </div>

                  <Button
                    className="w-full h-11 text-base"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Verification Code"}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full h-11 text-base"
                    type="button"
                    onClick={() => navigate("/login")}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
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
