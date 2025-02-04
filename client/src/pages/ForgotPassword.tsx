import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/api";
import { useFormik } from "formik";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { ArrowLeft } from "lucide-react";
import { ModeToggle } from "@/components/custom-ui/mode-toggle";

// Zod schema for forgot password validation
const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const navigate = useNavigate();

  const formik = useFormik<ForgotPasswordForm>({
    initialValues: {
      email: "",
    },
    validationSchema: toFormikValidationSchema(forgotPasswordSchema),
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
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
      } finally {
        setSubmitting(false);
      }
    },
  });

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
                  Forgot Password
                </span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Enter your email and we'll send you a verification code to reset
                your password
              </p>
            </div>
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
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
                  <p className="text-sm text-destructive">
                    {formik.errors.email}
                  </p>
                )}
              </div>
              <Button
                className="w-full h-11 text-base"
                type="submit"
                disabled={formik.isSubmitting || !formik.isValid}
              >
                {formik.isSubmitting ? "Sending..." : "Send Verification Code"}
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
