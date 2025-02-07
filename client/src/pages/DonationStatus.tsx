import { useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/api";
import { Navbar } from "@/components/shared/Navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  User,
  Phone,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { RootState } from "@/Redux/store";
import { format } from "date-fns";

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
    color:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
    text: "Pending Assignment",
  },
  assigned: {
    icon: User,
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
    text: "Assigned to Soldier",
  },
  delivery: {
    icon: Truck,
    color:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300",
    text: "In Delivery",
  },
  arrived: {
    icon: CheckCircle,
    color:
      "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
    text: "Arrived",
  },
};

export default function DonationStatus() {
  const { donationId } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state.user);

  const {
    data: donation,
    refetch,
    isLoading,
  } = useQuery<Donation>({
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
      setTimeout(() => setError(null), 5000);
    }
  };

  const StatusIcon = donation?.status
    ? statusConfig[donation.status].icon
    : Clock;

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Navbar isVertical isAccordion modes="home" />
        <div className="flex-1 p-6 pl-20 md:pl-6 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-12 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Navbar isVertical isAccordion modes="home" />
      <div className="flex-1 p-3 sm:p-6 pl-16 sm:pl-20 md:pl-6 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {error && (
            <Alert
              variant="destructive"
              className="animate-in fade-in-0 slide-in-from-top-5"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="bg-primary/10 text-primary border-primary/20 animate-in fade-in-0 slide-in-from-top-5">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {donation && (
            <>
              <div className="space-y-1 sm:space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold">
                  <span className="bg-gradient-to-r from-primary/60 to-primary text-transparent bg-clip-text">
                    Donation Details
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Track and manage the status of this donation
                </p>
              </div>

              <Card className="overflow-hidden">
                <CardHeader className="border-b bg-muted/50 p-4 sm:p-6">
                  <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-lg sm:text-xl">
                        {donation.title}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>{donation.category}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>{donation.city.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>
                            {format(
                              new Date(donation.createdAt),
                              "MMM dd, yyyy"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      className={`${
                        statusConfig[donation.status].color
                      } px-2 py-1 sm:px-3 sm:py-1 w-fit`}
                    >
                      <StatusIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      {statusConfig[donation.status].text}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold mb-2">
                          Description
                        </h3>
                        <p className="text-sm sm:text-base text-muted-foreground">
                          {donation.description || "No description provided"}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-base sm:text-lg font-semibold mb-2">
                          Location
                        </h3>
                        <p className="text-sm sm:text-base text-muted-foreground">
                          {donation.address}
                        </p>
                      </div>

                      {donation.media && donation.media.length > 0 && (
                        <div>
                          <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">
                            Photos
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                            {donation.media.map((url, index) => (
                              <img
                                key={index}
                                src={url}
                                alt={`Donation ${index + 1}`}
                                className="rounded-md aspect-square object-cover hover:opacity-90 transition-opacity cursor-pointer"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">
                          Contact Information
                        </h3>
                        <div className="grid gap-3 sm:gap-4">
                          <Card className="p-3 sm:p-4">
                            <div className="flex items-start gap-2 sm:gap-3">
                              <div className="p-1.5 sm:p-2 rounded-full bg-primary/10 shrink-0">
                                <User className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm sm:text-base">
                                  Donor
                                </p>
                                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                  {donation.donor.firstName}{" "}
                                  {donation.donor.lastName}
                                </p>
                                <div className="flex items-center gap-1 mt-0.5 sm:mt-1 text-xs sm:text-sm text-muted-foreground">
                                  <Phone className="w-3 h-3" />
                                  <span className="truncate">
                                    {donation.donor.phone}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Card>

                          {donation.assignedSoldier && (
                            <Card className="p-3 sm:p-4">
                              <div className="flex items-start gap-2 sm:gap-3">
                                <div className="p-1.5 sm:p-2 rounded-full bg-primary/10 shrink-0">
                                  <User className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-sm sm:text-base">
                                    Assigned Soldier
                                  </p>
                                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                    {donation.assignedSoldier.firstName}{" "}
                                    {donation.assignedSoldier.lastName}
                                  </p>
                                  <div className="flex items-center gap-1 mt-0.5 sm:mt-1 text-xs sm:text-sm text-muted-foreground">
                                    <Phone className="w-3 h-3" />
                                    <span className="truncate">
                                      {donation.assignedSoldier.phone}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          )}
                        </div>
                      </div>

                      {canUpdateStatus && (
                        <div className="pt-3 sm:pt-4 border-t">
                          <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">
                            Update Status
                          </h3>
                          <div className="grid grid-cols-1 gap-2 sm:gap-3">
                            {Object.entries(statusConfig).map(
                              ([status, config]) => {
                                const StatusIcon = config.icon;
                                return (
                                  <Button
                                    key={status}
                                    onClick={() =>
                                      handleStatusUpdate(
                                        status as Donation["status"]
                                      )
                                    }
                                    disabled={donation.status === status}
                                    variant={
                                      donation.status === status
                                        ? "secondary"
                                        : "outline"
                                    }
                                    className="w-full justify-start text-sm sm:text-base h-9 sm:h-10"
                                  >
                                    <StatusIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                                    {config.text}
                                  </Button>
                                );
                              }
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
