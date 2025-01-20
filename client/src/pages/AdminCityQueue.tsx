import { useState } from "react";
import { api } from "@/api/api";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/shared/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface City {
  _id: string;
  name: string;
  zone: string;
  bio: string;
  media: string[];
  approvalStatus: "pending" | "approved" | "denied";
  createdAt: string;
}

export default function AdminCityQueue() {
  const [denialReason, setDenialReason] = useState("");
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    data: cities = [],
    isLoading,
    refetch,
  } = useQuery<City[]>({
    queryKey: ["pending-cities"],
    queryFn: async () => {
      const response = await api.get("/cities/pending");
      return response.data;
    },
  });

  const handleApprove = async (cityId: string) => {
    try {
      await api.post(`/cities/${cityId}/approve`);
      refetch();
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to approve city");
    }
  };

  const handleDeny = async (cityId: string) => {
    if (!denialReason) {
      setError("Please provide a reason for denial");
      return;
    }

    try {
      await api.post(`/cities/${cityId}/deny`, { reason: denialReason });
      setDenialReason("");
      setSelectedCity(null);
      refetch();
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to deny city");
    }
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
                  City Approval Queue
                </span>
              </h2>
              <Badge variant="outline">
                {cities.length} Pending{" "}
                {cities.length === 1 ? "City" : "Cities"}
              </Badge>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isLoading ? (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">Loading cities...</p>
              </Card>
            ) : cities.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">
                  No pending cities to approve
                </p>
              </Card>
            ) : (
              cities.map((city) => (
                <Card key={city._id} className="mb-6">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl mb-2">
                          {city.name}
                        </CardTitle>
                        <CardDescription>
                          Zone:{" "}
                          {city.zone.charAt(0).toUpperCase() +
                            city.zone.slice(1)}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">
                        Created: {new Date(city.createdAt).toLocaleDateString()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Bio</h4>
                        <p className="text-muted-foreground">{city.bio}</p>
                      </div>

                      {city.media && city.media.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Photos</h4>
                          <div className="grid grid-cols-2 gap-4">
                            {city.media.map((url, index) => (
                              <img
                                key={index}
                                src={url}
                                alt={`City ${index + 1}`}
                                className="w-full h-40 object-cover rounded-md"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedCity === city._id ? (
                        <div className="space-y-4">
                          <Textarea
                            placeholder="Enter reason for denial"
                            value={denialReason}
                            onChange={(e) => setDenialReason(e.target.value)}
                          />
                          <div className="flex justify-end gap-4">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedCity(null);
                                setDenialReason("");
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleDeny(city._id)}
                            >
                              Confirm Denial
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-4">
                          <Button
                            variant="destructive"
                            onClick={() => setSelectedCity(city._id)}
                          >
                            Deny
                          </Button>
                          <Button
                            className="bg-gradient-to-r from-[#F596D3] to-[#D247BF] hover:opacity-90 transition-opacity"
                            onClick={() => handleApprove(city._id)}
                          >
                            Approve
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
