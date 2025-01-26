import { useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/api";
import { Navbar } from "@/components/shared/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package, Truck, CheckCircle, Clock, MapPin, User } from "lucide-react";
import { RootState } from "@/Redux/store";

interface Donation {
  _id: string;
  title: string;
  description: string;
  category: string;
  city: {
    _id: string;
    name: string;
  };
  address: string;
  media: string[];
  status: "pending" | "assigned" | "delivery" | "arrived";
  assignedSoldier?: {
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  donor: {
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: "bg-yellow-500",
    text: "Pending Assignment",
  },
  assigned: {
    icon: User,
    color: "bg-blue-500",
    text: "Assigned to Soldier",
  },
  delivery: {
    icon: Truck,
    color: "bg-purple-500",
    text: "In Delivery",
  },
  arrived: {
    icon: CheckCircle,
    color: "bg-green-500",
    text: "Arrived",
  },
};

export default function DonationStatus() {
  const { donationId } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state.user);

  const { data: donation, refetch } = useQuery<Donation>({
    queryKey: ["donation", donationId],
    queryFn: async () => {
      const response = await api.get(`/donations/${donationId}`);
      return response.data;
    },
    enabled: !!donationId,
  });

  const canUpdateStatus = user.type === "Admin" || user.type === "Municipality";

  const handleStatusUpdate = async (newStatus: Donation["status"]) => {
    try {
      await api.put(`/donations/${donationId}/status`, { status: newStatus });
      setSuccessMessage("Status updated successfully");
      refetch();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to update status");
    }
  };

  const StatusIcon = donation?.status
    ? statusConfig[donation.status].icon
    : Clock;

  return (
    <div className="flex h-screen bg-background">
      <Navbar isVertical isAccordion modes="home" />
      <div className="flex-1 p-6 pl-20 md:pl-6 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert
              variant="default"
              className="bg-green-50 text-green-800 border-green-200"
            >
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {donation && (
            <>
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{donation.title}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Package className="w-4 h-4" />
                    <span>{donation.category}</span>
                    <MapPin className="w-4 h-4 ml-2" />
                    <span>{donation.city.name}</span>
                  </div>
                </div>
                <Badge
                  className={`${
                    statusConfig[donation.status].color
                  } px-4 py-2 text-white`}
                >
                  <StatusIcon className="w-4 h-4 mr-2 inline" />
                  {statusConfig[donation.status].text}
                </Badge>
              </div>

              <Card className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Donation Details</h3>
                    <p className="text-muted-foreground mb-4">
                      {donation.description}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Address:</span>{" "}
                      {donation.address}
                    </p>
                    {donation.media && donation.media.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">Photos</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {donation.media.map((url, index) => (
                            <img
                              key={index}
                              src={url}
                              alt={`Donation ${index + 1}`}
                              className="rounded-md w-full h-32 object-cover"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Contact Information</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium">Donor</p>
                        <p className="text-muted-foreground">
                          {donation.donor.firstName} {donation.donor.lastName}
                        </p>
                        <p className="text-muted-foreground">
                          {donation.donor.phone}
                        </p>
                      </div>
                      {donation.assignedSoldier && (
                        <div>
                          <p className="font-medium">Assigned Soldier</p>
                          <p className="text-muted-foreground">
                            {donation.assignedSoldier.firstName}{" "}
                            {donation.assignedSoldier.lastName}
                          </p>
                          <p className="text-muted-foreground">
                            {donation.assignedSoldier.phone}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {canUpdateStatus && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-semibold mb-4">Update Status</h3>
                    <div className="flex gap-4">
                      {Object.entries(statusConfig).map(([status, config]) => {
                        const StatusIcon = config.icon;
                        return (
                          <Button
                            key={status}
                            onClick={() =>
                              handleStatusUpdate(status as Donation["status"])
                            }
                            disabled={donation.status === status}
                            className={`flex items-center gap-2 ${
                              donation.status === status
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            variant={
                              donation.status === status
                                ? "secondary"
                                : "outline"
                            }
                          >
                            <StatusIcon className="w-4 h-4" />
                            {config.text}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
