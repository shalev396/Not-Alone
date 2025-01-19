import { useState } from "react";
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

interface Request {
  _id: string;
  service: string;
  item: string;
  itemDescription: string;
  quantity: number;
  zone: string;
  city: {
    _id: string;
    name: string;
  };
  status: string;
  author: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  createdAt: string;
}

export default function CityRequestQueue() {
  const [denialReason, setDenialReason] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // First, get the user's city
  const { data: userCity, isLoading: loadingCity } = useQuery({
    queryKey: ["user-city"],
    queryFn: async () => {
      const response = await api.get("/cities/me");
      console.log("User city response:", response.data);
      return response.data;
    },
  });

  // Then fetch requests
  const {
    data: requests = [],
    isLoading: loadingRequests,
    refetch,
  } = useQuery<Request[]>({
    queryKey: ["pending-requests", userCity?._id],
    queryFn: async () => {
      const response = await api.get("/requests", {
        params: {
          status: "in process",
          cityId: userCity?._id,
        },
      });
      console.log("Requests response:", response.data);

      // Filter requests to only show those from user's city or without a city
      const filteredRequests = (response.data.requests || []).filter(
        (request: Request) => {
          return !request.city || request.city._id === userCity?._id;
        }
      );

      return filteredRequests;
    },
    enabled: !!userCity, // Only fetch requests when we have the user's city
  });

  const handleApprove = async (requestId: string) => {
    try {
      await api.post(`/requests/${requestId}/approve`);
      refetch();
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to approve request");
    }
  };

  const handleDeny = async (requestId: string) => {
    if (!denialReason) {
      setError("Please provide a reason for denial");
      return;
    }

    try {
      await api.post(`/requests/${requestId}/deny`, { reason: denialReason });
      setDenialReason("");
      setSelectedRequest(null);
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

  if (loadingCity || loadingRequests) {
    return (
      <div className="flex h-screen">
        <Navbar isVertical isAccordion modes="home" />
        <div className="flex-1 p-6 pl-20 md:pl-6">
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">
              {loadingCity ? "Loading city..." : "Loading requests..."}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // If user is not part of a city, show error
  if (!userCity) {
    return (
      <div className="flex h-screen">
        <Navbar isVertical isAccordion modes="home" />
        <div className="flex-1 p-6 pl-20 md:pl-6">
          <div className="max-w-4xl mx-auto">
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Access Denied</AlertTitle>
              <AlertDescription>
                You must be a member of a city to view and manage requests.
              </AlertDescription>
            </Alert>
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
                  {userCity.name} Request Queue
                </span>
              </h2>
              <Badge variant="outline">
                {requests.length} Pending{" "}
                {requests.length === 1 ? "Request" : "Requests"}
              </Badge>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!requests.length ? (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">No pending requests</p>
              </Card>
            ) : (
              <div className="grid gap-6">
                {requests.map((request) => (
                  <Card key={request._id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          {request.item}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          Requested on {formatDate(request.createdAt)}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {request.city?.name || "Unassigned"}
                      </Badge>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="text-sm">
                        <p className="mb-2">{request.itemDescription}</p>
                        <p>
                          <span className="font-semibold">Quantity:</span>{" "}
                          {request.quantity}
                        </p>
                        <p>
                          <span className="font-semibold">Service:</span>{" "}
                          {request.service}
                        </p>
                        <p>
                          <span className="font-semibold">Zone:</span>{" "}
                          {request.zone}
                        </p>
                        <div className="mt-4">
                          <p className="font-semibold mb-1">Soldier Details:</p>
                          <p>
                            {request.author?.firstName}{" "}
                            {request.author?.lastName}
                          </p>
                          <p>{request.author?.email}</p>
                          <p>{request.author?.phone}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedRequest(request._id)}
                        className="hover:bg-red-50"
                      >
                        Deny
                      </Button>
                      <Button
                        onClick={() => handleApprove(request._id)}
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
        open={!!selectedRequest}
        onOpenChange={() => {
          setSelectedRequest(null);
          setDenialReason("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deny Request</DialogTitle>
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
                setSelectedRequest(null);
                setDenialReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedRequest && handleDeny(selectedRequest)}
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
