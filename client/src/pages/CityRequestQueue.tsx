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
import {
  AlertCircle,
  X,
  CheckCircle,
  XCircle,
  Package,
  Calendar,
  MapPin,
  User,
  Mail,
  Phone,
  Users,
} from "lucide-react";

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
  const navigate = useNavigate();
  const [denialReason, setDenialReason] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // First, get the user's city
  const { data: userCity, isLoading: loadingCity } = useQuery({
    queryKey: ["user-city"],
    queryFn: async () => {
      try {
        const response = await api.get("/cities/me");
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 401) {
          navigate("/login");
        }
        return null;
      }
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
      setSuccessMessage("Request approved successfully!");
      setShowSuccess(true);
      refetch();
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Failed to approve request"
      );
      setShowError(true);
    }
  };

  const handleDeny = async (requestId: string) => {
    if (!denialReason) {
      setErrorMessage("Please provide a reason for denial");
      setShowError(true);
      return;
    }

    try {
      await api.post(`/requests/${requestId}/deny`, { reason: denialReason });
      setDenialReason("");
      setSelectedRequest(null);
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

  if (loadingCity || loadingRequests) {
    return (
      <div className="flex bg-background text-foreground min-h-screen">
        <Navbar modes="home" isVertical={true} isAccordion={true} />
        <div className="flex-1 p-6 pl-[72px] sm:pl-20 md:pl-6">
          <div className="max-w-3xl mx-auto">
            <Card className="p-6">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="ml-3 text-muted-foreground">
                  {loadingCity
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

  if (!userCity) {
    return (
      <div className="flex bg-background text-foreground min-h-screen">
        <Navbar modes="home" isVertical={true} isAccordion={true} />
        <div className="flex-1 p-6 pl-[72px] sm:pl-20 md:pl-6">
          <div className="max-w-3xl mx-auto">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Unauthorized Access</AlertTitle>
              <AlertDescription>
                You must be a member of a city to view and manage requests.
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => navigate("/join-city")}
              className="mt-6 bg-gradient-to-r from-primary/80 to-primary hover:opacity-90 transition-opacity"
            >
              <Users className="mr-2 h-4 w-4" />
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
                  {userCity.name} Request Queue
                </span>
              </h2>
              <Badge
                variant="outline"
                className="bg-primary/5 text-primary border-primary/20"
              >
                {requests.length} Pending{" "}
                {requests.length === 1 ? "Request" : "Requests"}
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
              <CheckCircle className="h-4 w-4" />
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

          {!requests.length ? (
            <Card className="p-6">
              <p className="text-center text-muted-foreground">
                No pending requests
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request._id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        {request.item}
                      </h3>
                      <p className="text-muted-foreground text-sm flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Requested on {formatDate(request.createdAt)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-primary/5 text-primary border-primary/20"
                    >
                      {request.city?.name || "Unassigned"}
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="text-sm space-y-2">
                      <p className="mb-2">{request.itemDescription}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-primary" />
                            <span className="font-semibold">
                              Quantity:
                            </span>{" "}
                            {request.quantity}
                          </p>
                          <p className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            <span className="font-semibold">Service:</span>{" "}
                            {request.service}
                          </p>
                          <p className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="font-semibold">Zone:</span>{" "}
                            {request.zone}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="font-semibold flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-primary" />
                            Soldier Details:
                          </p>
                          <p>
                            {request.author?.firstName}{" "}
                            {request.author?.lastName}
                          </p>
                          <p className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-primary" />
                            {request.author?.email}
                          </p>
                          <p className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-primary" />
                            {request.author?.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedRequest(request._id)}
                      className="hover:bg-destructive/5 hover:text-destructive"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Deny
                    </Button>
                    <Button
                      onClick={() => handleApprove(request._id)}
                      className="bg-gradient-to-r from-primary/80 to-primary hover:opacity-90 transition-opacity"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
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
        open={!!selectedRequest}
        onOpenChange={() => {
          setSelectedRequest(null);
          setDenialReason("");
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              <span className="bg-gradient-to-r from-primary/60 to-primary text-transparent bg-clip-text">
                Deny Request
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
              className="bg-destructive hover:bg-destructive/90"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Deny Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
