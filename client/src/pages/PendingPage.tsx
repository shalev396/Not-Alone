import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Application Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-lg font-medium">
              Hello {userData.firstName} {userData.lastName}!
            </p>
            <p className="text-muted-foreground">
              Your application as a {userData.type} is currently being reviewed.
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-medium capitalize">
                {userData.approvalStatus}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Application Date:</span>
              <span className="font-medium">
                {new Date(userData.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Email:</span>
              <span className="font-medium">{userData.email}</span>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              We will notify you via email once your application has been
              reviewed.
            </p>
            <p>This usually takes 1-2 business days.</p>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              sessionStorage.clear();
              navigate("/login");
            }}
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
