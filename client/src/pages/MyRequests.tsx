import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/shared/Navbar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Request {
  _id: string;
  service: "Regular" | "Reserves";
  item: string;
  itemDescription: string;
  quantity: number;
  zone: "north" | "center" | "south";
  city: string;
  cityDetails: {
    name: string;
    zone: string;
  };
  status: "approved" | "deny" | "in process";
  paid: boolean;
  paidBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function MyRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get("/requests/my");
        setRequests(response.data.requests);
      } catch (error: any) {
        setError(error.response?.data?.message || "Failed to fetch requests");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleDelete = async (requestId: string) => {
    try {
      await api.delete(`/requests/${requestId}`);
      setRequests((prev) => prev.filter((req) => req._id !== requestId));
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to delete request");
    }
  };

  const getStatusColor = (status: Request["status"]) => {
    switch (status) {
      case "approved":
        return "bg-green-500";
      case "deny":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex bg-background min-h-screen">
      <Navbar modes="home" isVertical={true} isAccordion={true} />
      <div className="flex-1 p-6 pl-20 md:pl-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-[#F596D3] to-[#D247BF] text-transparent bg-clip-text">
                My Requests
              </span>
            </h2>
            <Button
              onClick={() => navigate("/request")}
              className="bg-gradient-to-r from-[#F596D3] to-[#D247BF] hover:opacity-90"
            >
              New Request
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">Loading requests...</p>
            </Card>
          ) : requests.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground mb-4">No requests found</p>
              <Button
                onClick={() => navigate("/request")}
                className="bg-gradient-to-r from-[#F596D3] to-[#D247BF] hover:opacity-90"
              >
                Create Your First Request
              </Button>
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
                        Created on {formatDate(request.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{request.service}</Badge>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.charAt(0).toUpperCase() +
                          request.status.slice(1)}
                      </Badge>
                      {request.paid && (
                        <Badge className="bg-blue-500">Paid</Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm">
                      <span className="font-semibold">Description:</span>{" "}
                      {request.itemDescription}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Quantity:</span>{" "}
                      {request.quantity}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Location:</span>{" "}
                      {request.cityDetails.name} ({request.zone})
                    </p>
                    {request.paid && request.paidBy && (
                      <p className="text-sm">
                        <span className="font-semibold">Paid by:</span>{" "}
                        {request.paidBy.firstName} {request.paidBy.lastName}
                      </p>
                    )}
                  </div>

                  {request.status === "in process" && (
                    <div className="flex justify-end">
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(request._id)}
                        className="hover:opacity-90"
                      >
                        Delete Request
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
