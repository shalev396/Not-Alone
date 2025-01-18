import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { api } from "@/api/api";
import { cn } from "@/lib/utils";

interface SignupRequest {
  progress: "submitted" | "under review" | "waiting kyc" | "completed";
  approved: "in queue" | "approved" | "deny";
  type: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  _id: string;
  reason?: string;
}

export default function PendingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [request, setRequest] = useState<SignupRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If we have request data from login/signup, use it
    if (location.state?.request) {
      setRequest(location.state.request);
      setLoading(false);

      // Set up authorization header for future requests
      if (location.state.token) {
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${location.state.token}`;
      }
    } else {
      // No state means invalid access
      setError("Invalid access to pending page");
      setLoading(false);
    }
  }, [location.state]);

  // Poll for updates only if not denied
  useEffect(() => {
    if (!request?._id || !location.state?.token || request.approved === "deny")
      return;

    const fetchRequest = async () => {
      try {
        const response = await api.get(`/signup-requests/${request._id}`);
        setRequest(response.data);

        // If request is completed and approved, redirect to login
        if (
          response.data.progress === "completed" &&
          response.data.approved === "approved"
        ) {
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        }
      } catch (error: any) {
        setError(
          error.response?.data?.error || "Failed to fetch request status"
        );
      }
    };

    const interval = setInterval(fetchRequest, 30000);
    return () => clearInterval(interval);
  }, [request?._id, request?.approved, location.state?.token, navigate]);

  const getProgressMessage = (request: SignupRequest) => {
    if (request.approved === "deny") {
      return "Your request has been denied.";
    }

    switch (request.progress) {
      case "submitted":
        return "Your request has been submitted and is waiting for review.";
      case "under review":
        return "An admin is currently reviewing your request.";
      case "waiting kyc":
        return "Please complete your KYC verification.";
      case "completed":
        return request.approved === "approved"
          ? "Your request has been approved. You can now log in."
          : "Your request has been processed.";
      default:
        return "Status unknown";
    }
  };

  return (
    <div className="container mx-auto max-w-lg py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Application Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error ? (
            <div className="text-red-500">{error}</div>
          ) : loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : request ? (
            <>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Status</h3>
                  <p
                    className={cn(
                      "text-muted-foreground",
                      request.approved === "deny" && "text-destructive"
                    )}
                  >
                    {getProgressMessage(request)}
                  </p>
                  {request.approved === "deny" && request.reason && (
                    <p className="mt-2 text-sm text-destructive border border-destructive/50 rounded-md p-3 bg-destructive/10">
                      Reason: {request.reason}
                    </p>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">Account Type</h3>
                  <p className="text-muted-foreground">{request.type}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Name</h3>
                  <p className="text-muted-foreground">
                    {request.firstName} {request.lastName}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-muted-foreground">{request.email}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Submitted On</h3>
                  <p className="text-muted-foreground">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="pt-4">
                <p className="text-sm text-muted-foreground">
                  {request.approved === "approved"
                    ? "Your account has been approved! Redirecting to login..."
                    : request.approved === "deny"
                    ? "You can create a new signup request if you wish to try again."
                    : "We will notify you via email when your application status changes."}
                </p>
              </div>
            </>
          ) : null}
          <div className="pt-6">
            <Button
              className="w-full"
              variant="outline"
              onClick={() => navigate("/")}
            >
              Return to Home
            </Button>
            {/* {request?.approved === "deny" && (
              <Button
                className="w-full mt-2"
                onClick={() => navigate("/signup")}
              >
                Create New Request
              </Button>
            )} */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
