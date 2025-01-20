import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/api/api";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/shared/Navbar";
import { Badge } from "@/components/ui/badge";

interface Donation {
  _id: string;
  city: string;
  address: string;
  category: "Furniture" | "Clothes" | "Electricity" | "Army Equipments";
  title: string;
  description?: string;
  media: string[];
  status: "pending" | "assigned" | "delivery" | "arrived";
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  cityDetails?: {
    name: string;
    zone: string;
  };
  assignedSoldier?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

export default function MyDonations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const userId = sessionStorage.getItem("id");
  const navigate = useNavigate();

  const fetchDonations = async () => {
    try {
      const response = await api.get("/donations/my");
      setDonations(response.data || []);
    } catch (error) {
      console.error("Error fetching donations:", error);
      setDonations([]);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchDonations();
    }
  }, [userId]);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/donations/${id}`);
      await fetchDonations();
    } catch (error) {
      console.error("Error deleting donation:", error);
    }
  };

  const getStatusColor = (status: Donation["status"]) => {
    const colors = {
      pending: "bg-yellow-500",
      assigned: "bg-blue-500",
      delivery: "bg-purple-500",
      arrived: "bg-green-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="flex h-screen">
      <Navbar isVertical isAccordion modes="home" />

      <div className="flex-1 overflow-auto">
        <div className="flex-1 p-6 pl-20 md:pl-6 bg-background">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-[#F596D3] to-[#D247BF] text-transparent bg-clip-text">
                  My Donations
                </span>
              </h2>
              <Button
                onClick={() => navigate("/create-donation")}
                className="bg-gradient-to-r from-[#F596D3] to-[#D247BF] hover:opacity-90 transition-opacity"
              >
                Create New Donation
              </Button>
            </div>

            {donations.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">
                  You haven't created any donations yet.
                </p>
              </Card>
            ) : (
              donations.map((donation) => (
                <Card
                  key={donation._id}
                  className="p-6 mb-6 drop-shadow-xl shadow-black/10 dark:shadow-white/10"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/3">
                      {donation.media && donation.media.length > 0 ? (
                        <img
                          src={donation.media[0]}
                          alt="Donation"
                          className="object-cover rounded-md w-full h-[200px]"
                        />
                      ) : (
                        <div className="bg-muted h-[200px] rounded-md flex items-center justify-center">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold mb-2">
                            {donation.title}
                          </h3>
                          <Badge
                            className={`${getStatusColor(
                              donation.status
                            )} text-white`}
                          >
                            {donation.status.charAt(0).toUpperCase() +
                              donation.status.slice(1)}
                          </Badge>
                        </div>
                        <Badge variant="outline">{donation.category}</Badge>
                      </div>

                      <p className="text-muted-foreground">
                        {donation.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Location</p>
                          <p className="text-muted-foreground">
                            {donation.address}
                            {donation.cityDetails &&
                              ` (${donation.cityDetails.name}, ${donation.cityDetails.zone})`}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Created At</p>
                          <p className="text-muted-foreground">
                            {formatDate(donation.createdAt)}
                          </p>
                        </div>
                      </div>

                      {donation.assignedSoldier && (
                        <div>
                          <p className="text-sm font-medium">Assigned To</p>
                          <p className="text-muted-foreground">
                            {donation.assignedSoldier.firstName}{" "}
                            {donation.assignedSoldier.lastName} (
                            {donation.assignedSoldier.phone})
                          </p>
                        </div>
                      )}

                      <div className="flex gap-4 pt-4">
                        {donation.status === "pending" && (
                          <Button
                            variant="destructive"
                            onClick={() => handleDelete(donation._id)}
                          >
                            Delete Donation
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
