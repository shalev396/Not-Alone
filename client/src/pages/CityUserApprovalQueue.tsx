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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if user is a city member
  const { data: userCities = [], isLoading: checkingAuth } = useQuery({
    queryKey: ["user-city"],
    queryFn: async () => {
      try {
        const response = await api.get("/cities/me");
        console.log("User city response:", response.data);
        return response.data; // Get all cities
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
      console.log("Join requests response:", response.data);
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
      refetch();
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to approve request");
    }
  };

  const handleDeny = async (userId: string) => {
    if (!denialReason) {
      setError("Please provide a reason for denial");
      return;
    }

    try {
      await api.post(`/cities/${userCity?._id}/join-requests/${userId}`, {
        action: "DENY",
        reason: denialReason,
      });
      setDenialReason("");
      setSelectedUserId(null);
      refetch();
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to deny request");
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
      <div className="flex h-screen">
        <Navbar isVertical isAccordion modes="home" />
        <div className="flex-1 p-6 pl-20 md:pl-6">
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">
              {checkingAuth
                ? "Checking authorization..."
                : "Loading requests..."}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // Show unauthorized message if not a city member
  if (!checkingAuth && !userCity) {
    return (
      <div className="flex h-screen">
        <Navbar isVertical isAccordion modes="home" />
        <div className="flex-1 p-6 pl-20 md:pl-6">
          <div className="max-w-4xl mx-auto">
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Unauthorized Access</AlertTitle>
              <AlertDescription>
                You must be a member of a city to access this page.
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => navigate("/join-city")}
              className="bg-gradient-to-r from-[#F596D3] to-[#D247BF] hover:opacity-90"
            >
              Join a City
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Navbar isVertical isAccordion modes="home" />

      <div className="flex-1 overflow-auto">
        <div className="flex-1 p-6 pl-20 md:pl-6 bg-background">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-[#F596D3] to-[#D247BF] text-transparent bg-clip-text">
                  User Join Requests
                </span>
              </h2>
              <Badge variant="outline">
                {joinRequests.length} Pending{" "}
                {joinRequests.length === 1 ? "Request" : "Requests"}
              </Badge>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert
                variant="default"
                className="mb-6 bg-green-50 text-green-800 border-green-200"
              >
                {successMessage}
              </Alert>
            )}

            {!joinRequests.length ? (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">
                  No pending join requests
                </p>
              </Card>
            ) : (
              <div className="grid gap-6">
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
                      <Badge variant="outline">{request.type}</Badge>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="text-sm">
                        <p>
                          <span className="font-semibold">Email:</span>{" "}
                          {request.userId.email}
                        </p>
                        <p>
                          <span className="font-semibold">Phone:</span>{" "}
                          {request.userId.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedUserId(request.userId._id)}
                        className="hover:bg-red-50"
                      >
                        Deny
                      </Button>
                      <Button
                        onClick={() => handleApprove(request.userId._id)}
                        className="bg-gradient-to-r from-[#F596D3] to-[#D247BF] hover:opacity-90"
                      >
                        Approve
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={!!selectedUserId}
        onOpenChange={() => {
          setSelectedUserId(null);
          setDenialReason("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deny Join Request</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Please provide a reason for denial..."
              value={denialReason}
              onChange={(e) => setDenialReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
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
            >
              Deny Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
