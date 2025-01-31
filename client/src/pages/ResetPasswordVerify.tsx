import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ResetPasswordVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState<"verify" | "reset">("verify");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deviceToken, setDeviceToken] = useState<string | null>(null);

  // Get user data from location state
  const { userId, email } = location.state || {};

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
      setError(error.response?.data?.message || "Failed to generate code");
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !deviceToken) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.post(
        "/auth/verify-2fa/reset-password/verify",
        {
          userId,
          code,
          deviceToken,
        }
      );

      if (response.data.verified) {
        setStep("reset");
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post("/auth/verify-2fa/reset-password/update", {
        userId,
        password,
      });

      // Redirect to login
      navigate("/login", { replace: true });
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  // Generate code on component mount
  useEffect(() => {
    if (!userId || !email) {
      navigate("/forgot-password");
      return;
    }
    generateCode();
  }, [userId, email, navigate]);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>
              {step === "verify" ? "Verify Code" : "Reset Password"}
            </CardTitle>
            <CardDescription>
              {step === "verify"
                ? "Enter the verification code sent to your email"
                : "Enter your new password"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "verify" ? (
              <form onSubmit={handleVerifySubmit} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Enter verification code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={6}
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-500 p-2 bg-red-50 dark:bg-red-950/50 rounded-md">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Verifying..." : "Verify Code"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={generateCode}
                  disabled={loading}
                >
                  Resend Code
                </Button>
              </form>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <Input
                    type="password"
                    placeholder="New password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-500 p-2 bg-red-50 dark:bg-red-950/50 rounded-md">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
