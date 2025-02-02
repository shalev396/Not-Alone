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

export default function TwoFactorAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deviceToken, setDeviceToken] = useState<string | null>(null);

  // Get user data from location state
  const { userId } = location.state || {};

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }
    // Generate 2FA code on component mount
    generateCode();
  }, [userId, navigate]);

  const generateCode = async () => {
    try {
      const response = await api.post("/verify-2fa/generate", {
        userId,
      });
      setDeviceToken(response.data.deviceToken);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to generate code");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !deviceToken) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/verify-2fa/verify", {
        userId,
        code,
        deviceToken,
      });

      // Check if verification was successful
      if (response.data.verified) {
        // Get the stored user data
        const userData = JSON.parse(sessionStorage.getItem("user") || "{}");

        // Navigate to pending page
        navigate("/pending", {
          state: {
            user: userData,
          },
          replace: true, // This ensures we can't go back to the 2FA page
        });
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <CardDescription>
              Please enter the verification code sent to your email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
