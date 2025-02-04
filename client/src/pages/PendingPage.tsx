import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Clock,
  Mail,
  Calendar,
  UserCircle,
  BadgeCheck,
} from "lucide-react";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  type: string;
  approvalStatus: string;
  createdAt: string;
}

export default function PendingPage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    // Get user data from session storage
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserData(user);

      // If user is approved, redirect to home
      if (user.approvalStatus === "approved") {
        navigate("/");
      }
    } else {
      // If no user data, redirect to login
      navigate("/login");
    }
  }, [navigate]);

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">
            Loading your application status...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="container max-w-xl mx-auto flex items-center justify-center p-4">
        <Card className="w-full shadow-lg border-primary/20">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center">
              <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text font-bold">
                Application Status
              </span>
            </CardTitle>
            <p className="text-center text-muted-foreground">
              Your account is being reviewed by our team
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User Info Section */}
            <div className="text-center space-y-2 pb-4 border-b">
              <UserCircle className="h-16 w-16 mx-auto text-primary opacity-80" />
              <div>
                <h2 className="text-xl font-semibold">
                  {userData.firstName} {userData.lastName}
                </h2>
                <p className="text-muted-foreground capitalize">
                  {userData.type} Account
                </p>
              </div>
            </div>

            {/* Status Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Clock className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Status</p>
                  <p className="text-sm capitalize flex items-center gap-2">
                    {userData.approvalStatus}
                    <BadgeCheck className="h-4 w-4 text-yellow-500" />
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Application Date
                  </p>
                  <p className="text-sm">
                    {new Date(userData.createdAt).toLocaleDateString(
                      undefined,
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Contact Email
                  </p>
                  <p className="text-sm">{userData.email}</p>
                </div>
              </div>
            </div>

            {/* Information Box */}
            <div className="bg-primary/5 rounded-lg p-4 space-y-2 text-sm">
              <p className="font-medium text-foreground">What happens next?</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>
                  • Our team will review your application within 1-2 business
                  days
                </li>
                <li>• You'll receive an email notification once approved</li>
                <li>
                  • After approval, you can log in and access all features
                </li>
              </ul>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                sessionStorage.clear();
                navigate("/login");
              }}
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
