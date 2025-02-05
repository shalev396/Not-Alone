import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { api } from "@/api/api";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { ArrowLeft, AlertCircle, X, Mail, Lock } from "lucide-react";
import { ModeToggle } from "@/components/custom-ui/mode-toggle";
import { setUser } from "@/Redux/userSlice";
import { login } from "@/Redux/authSlice";
import { useEffect, useRef } from "react";
import { RootState } from "@/Redux/store";

// Zod schema for login validation
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password must be less than 50 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

const initialValues: LoginForm = {
  email: "",
  password: "",
};

export function LoginForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);

  useEffect(() => {
    // Check if user is already logged in
    const token = sessionStorage.getItem("token");
    const userId = sessionStorage.getItem("id");

    if (token && userId && user.email) {
      // Navigate based on user type
      switch (user.type?.toLowerCase()) {
        case "admin":
          navigate("/admin/queue");
          break;
        case "soldier":
          navigate("/home/eatup");
          break;
        case "municipality":
          navigate("/my-eatups");
          break;
        case "donor":
          navigate("/contribute");
          break;
        case "organization":
          navigate("/social");
          break;
        case "business":
          navigate("/profile");
          break;
        default:
          navigate("/home");
      }
    }
  }, [navigate, user]);

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="border rounded-lg shadow-sm bg-card">
        <div className="px-8 py-10 space-y-8">
          <div className="flex justify-end">
            <ModeToggle />
          </div>
          <div className="space-y-2 text-center">
            <h1 className="text-3xl md:text-4xl font-bold">
              <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
                Login
              </span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Enter your credentials to access your account
            </p>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={toFormikValidationSchema(loginSchema)}
            onSubmit={async (values, { setSubmitting, setStatus }) => {
              try {
                const res = await api.post("/auth/login", values);

                if (res?.data?.user?._id) {
                  // First check if 2FA needs to be set up
                  if (!res.data.user.is2FAEnabled) {
                    // Save user data to session storage
                    sessionStorage.setItem(
                      "user",
                      JSON.stringify(res.data.user)
                    );

                    // Redirect to 2FA setup
                    navigate("/2fa", {
                      state: {
                        userId: res.data.user._id,
                        email: res.data.user.email,
                        isLogin: true,
                      },
                    });
                    return;
                  }

                  // Only proceed with approval status check if 2FA is enabled
                  if (res.data.user.approvalStatus === "pending") {
                    sessionStorage.setItem(
                      "user",
                      JSON.stringify(res.data.user)
                    );
                    navigate("/pending");
                    return;
                  }

                  // If both 2FA is enabled and user is approved, proceed with login
                  sessionStorage.setItem("token", res.data.token);
                  sessionStorage.setItem("id", res.data.user._id);
                  dispatch(setUser(res.data.user));
                  dispatch(login(res.data.token));

                  // Navigate based on user type
                  switch (res.data.user.type.toLowerCase()) {
                    case "admin":
                      navigate("/admin/queue");
                      break;
                    case "soldier":
                      navigate("/home/eatup");
                      break;
                    case "municipality":
                      navigate("/my-eatups");
                      break;
                    case "donor":
                      navigate("/contribute");
                      break;
                    case "organization":
                      navigate("/social");
                      break;
                    case "business":
                      navigate("/profile");
                      break;
                    default:
                      navigate("/home");
                  }
                } else if (res?.data?.type === "pending") {
                  navigate("/pending", {
                    state: { request: res.data.request },
                  });
                }
              } catch (error: any) {
                const errorMessage =
                  error.response?.data?.message || "Failed to login";
                setStatus(errorMessage);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting, touched, errors, status, setStatus }) => {
              // Clear error after 10 seconds
              useEffect(() => {
                let timeoutId: NodeJS.Timeout;
                if (status) {
                  timeoutId = setTimeout(() => {
                    setStatus(undefined);
                  }, 10000);
                }
                return () => {
                  if (timeoutId) {
                    clearTimeout(timeoutId);
                  }
                };
              }, [status, setStatus]);

              return (
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

                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Field
                        id="email"
                        placeholder="m@example.com"
                        className={`flex h-11 w-full rounded-md border ${
                          touched.email && errors.email
                            ? "border-destructive"
                            : "border-input"
                        } bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                        name="email"
                      />
                    </div>
                    {touched.email && errors.email && (
                      <p className="text-sm text-destructive flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Field
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        className={`flex h-11 w-full rounded-md border ${
                          touched.password && errors.password
                            ? "border-destructive"
                            : "border-input"
                        } bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                        name="password"
                      />
                    </div>
                    {touched.password && errors.password && (
                      <p className="text-sm text-destructive flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
                    <Button
                      variant="link"
                      className="px-0 font-normal"
                      type="button"
                      onClick={() => navigate("/forgot-password")}
                    >
                      Forgot password?
                    </Button>
                    <Button
                      variant="link"
                      className="px-0 font-normal"
                      type="button"
                      onClick={() => navigate("/signup")}
                    >
                      Don't have an account? Sign up
                    </Button>
                  </div>

                  <Button
                    className="w-full h-11 text-base"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Signing in..." : "Sign in"}
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
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
}
