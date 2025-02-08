import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/shared/Navbar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Plus, Trash2 } from "lucide-react";

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
        return "bg-primary/80 hover:bg-primary/70";
      case "deny":
        return "bg-destructive/80 hover:bg-destructive/70";
      default:
        return "bg-yellow-500/80 hover:bg-yellow-500/70";
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
      <div className="flex-1 p-6 pl-[72px] sm:pl-20 md:pl-6">
        <div className="max-w-4xl mx-auto">
          {error && (
            <Alert
              variant="destructive"
              className="mb-6 border border-destructive/50"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">
                Loading requests...
              </span>
            </div>
          ) : requests.length === 0 ? (
            <Card className="p-8 text-center border border-primary/10">
              <p className="text-muted-foreground mb-6">No requests found</p>
              <Button
                onClick={() => navigate("/requestForm")}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Your First Request
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {requests.map((request) => (
                <Card
                  key={request._id}
                  className="p-6 border border-primary/10 hover:border-primary/20 transition-colors"
                >
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
                      <Badge variant="outline" className="border-primary/20">
                        {request.service}
                      </Badge>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.charAt(0).toUpperCase() +
                          request.status.slice(1)}
                      </Badge>
                      {request.paid && (
                        <Badge className="bg-blue-500/80 hover:bg-blue-500/70">
                          Paid
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 mb-4 text-muted-foreground">
                    <p className="text-sm">
                      <span className="font-medium text-foreground">
                        Description:
                      </span>{" "}
                      {request.itemDescription}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-foreground">
                        Quantity:
                      </span>{" "}
                      {request.quantity}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-foreground">
                        Location:
                      </span>{" "}
                      {request.cityDetails.name} ({request.zone})
                    </p>
                    {request.paid && request.paidBy && (
                      <p className="text-sm">
                        <span className="font-medium text-foreground">
                          Paid by:
                        </span>{" "}
                        {request.paidBy.firstName} {request.paidBy.lastName}
                      </p>
                    )}
                  </div>

                  {request.status === "in process" && (
                    <div className="flex justify-end">
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(request._id)}
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
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
