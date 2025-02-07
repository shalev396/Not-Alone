import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/shared/Navbar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, X, UserCheck, UserX, Mail, Phone } from "lucide-react";

interface JoinRequest {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    type: string;
  };
  type: "Municipality" | "Soldier";
  requestDate?: string;
}

export default function CityUserApprovalQueue() {
  const navigate = useNavigate();
  const [denialReason, setDenialReason] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Check if user is a city member
  const { data: userCities = [], isLoading: checkingAuth } = useQuery({
    queryKey: ["user-city"],
    queryFn: async () => {
      try {
        const response = await api.get("/cities/me");
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 401) {
          navigate("/login");
        }
        return [];
      }
    },
  });

  // Get the first city since a user can only be in one city
  const userCity = userCities[0];

  const {
    data: joinRequests = [],
    isLoading: loadingRequests,
    refetch,
  } = useQuery<JoinRequest[]>({
    queryKey: ["pending-joins", userCity?._id],
    queryFn: async () => {
      if (!userCity?._id) throw new Error("No city ID");
      const response = await api.get(`/cities/${userCity._id}/join-requests`);
      return response.data;
    },
    enabled: !!userCity?._id,
  });

  const handleApprove = async (userId: string) => {
    try {
      await api.post(`/cities/${userCity?._id}/join-requests/${userId}`, {
        action: "APPROVE",
      });
      setSuccessMessage("User successfully approved and added to the city!");
      setShowSuccess(true);
      refetch();
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Failed to approve request"
      );
      setShowError(true);
    }
  };

  const handleDeny = async (userId: string) => {
    if (!denialReason) {
      setErrorMessage("Please provide a reason for denial");
      setShowError(true);
      return;
    }

    try {
      await api.post(`/cities/${userCity?._id}/join-requests/${userId}`, {
        action: "DENY",
        reason: denialReason,
      });
      setDenialReason("");
      setSelectedUserId(null);
      setSuccessMessage("Request denied successfully");
      setShowSuccess(true);
      refetch();
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Failed to deny request"
      );
      setShowError(true);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (checkingAuth || loadingRequests) {
    return (
      <div className="flex bg-background text-foreground min-h-screen">
        <Navbar modes="home" isVertical={true} isAccordion={true} />
        <div className="flex-1 p-6 pl-[72px] sm:pl-20 md:pl-6">
          <div className="max-w-3xl mx-auto">
            <Card className="p-6">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="ml-3 text-muted-foreground">
                  {checkingAuth
                    ? "Checking authorization..."
                    : "Loading requests..."}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Show unauthorized message if not a city member
  if (!checkingAuth && !userCity) {
    return (
      <div className="flex bg-background text-foreground min-h-screen">
        <Navbar modes="home" isVertical={true} isAccordion={true} />
        <div className="flex-1 p-6 pl-[72px] sm:pl-20 md:pl-6">
          <div className="max-w-3xl mx-auto">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Unauthorized Access</AlertTitle>
              <AlertDescription>
                You must be a member of a city to access this page.
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => navigate("/join-city")}
              className="mt-6 bg-gradient-to-r from-primary/80 to-primary hover:opacity-90 transition-opacity"
            >
              Join a City
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-background text-foreground min-h-screen">
      <Navbar modes="home" isVertical={true} isAccordion={true} />

      <div className="flex-1 p-6 pl-[72px] sm:pl-20 md:pl-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-primary/60 to-primary text-transparent bg-clip-text">
                  User Join Requests
                </span>
              </h2>
              <Badge
                variant="outline"
                className="bg-primary/5 text-primary border-primary/20"
              >
                {joinRequests.length} Pending{" "}
                {joinRequests.length === 1 ? "Request" : "Requests"}
              </Badge>
            </div>
          </div>

          {showError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                {errorMessage}
                <button
                  onClick={() => setShowError(false)}
                  className="rounded-full p-1 hover:bg-destructive/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </AlertDescription>
            </Alert>
          )}

          {showSuccess && (
            <Alert className="mb-6 border-primary/20 text-primary bg-primary/5">
              <UserCheck className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                {successMessage}
                <button
                  onClick={() => setShowSuccess(false)}
                  className="rounded-full p-1 hover:bg-primary/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </AlertDescription>
            </Alert>
          )}

          {!joinRequests.length ? (
            <Card className="p-6">
              <p className="text-center text-muted-foreground">
                No pending join requests
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {joinRequests.map((request) => (
                <Card key={request._id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        {request.userId.firstName} {request.userId.lastName}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {request.requestDate
                          ? formatDate(request.requestDate)
                          : "Recent request"}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-primary/5 text-primary border-primary/20"
                    >
                      {request.type}
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4 text-primary" />
                      <span>{request.userId.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4 text-primary" />
                      <span>{request.userId.phone}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedUserId(request.userId._id)}
                      className="hover:bg-destructive/5 hover:text-destructive"
                    >
                      <UserX className="mr-2 h-4 w-4" />
                      Deny
                    </Button>
                    <Button
                      onClick={() => handleApprove(request.userId._id)}
                      className="bg-gradient-to-r from-primary/80 to-primary hover:opacity-90 transition-opacity"
                    >
                      <UserCheck className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={!!selectedUserId}
        onOpenChange={() => {
          setSelectedUserId(null);
          setDenialReason("");
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              <span className="bg-gradient-to-r from-primary/60 to-primary text-transparent bg-clip-text">
                Deny Join Request
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Please provide a reason for denial..."
              value={denialReason}
              onChange={(e) => setDenialReason(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedUserId(null);
                setDenialReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedUserId && handleDeny(selectedUserId)}
              disabled={!denialReason}
              className="bg-destructive hover:bg-destructive/90"
            >
              <UserX className="mr-2 h-4 w-4" />
              Deny Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
