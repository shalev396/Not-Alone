import { useState } from "react";
// import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/shared/Navbar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Loader2, Building2, MapPin } from "lucide-react";

interface City {
  _id: string;
  name: string;
  zone: "north" | "center" | "south";
  bio: string;
  approvalStatus: "approved" | "pending" | "denied";
  municipalityUsers: string[];
  pendingJoins?: Array<{
    userId: string;
    type: string;
  }>;
}

interface PendingRequest {
  cityId: string;
  status: string;
}

export default function JoinCityRequest() {
  //   const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(
    new Set()
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Get user ID from session storage
  const userId = sessionStorage.getItem("id");

  // First fetch all cities
  const { data: cities = [], isLoading: loadingCities } = useQuery<City[]>({
    queryKey: ["cities"],
    queryFn: async () => {
      try {
        const response = await api.get("/cities");
        console.log("Cities response:", response.data);
        return response.data.filter(
          (city: City) => city.approvalStatus === "approved"
        );
      } catch (error) {
        console.error("Error fetching cities:", error);
        return [];
      }
    },
  });

  // Then check for pending requests
  const { data: existingRequests } = useQuery({
    queryKey: ["pending-requests"],
    queryFn: async () => {
      try {
        const response = await api.get("/cities/my-pending-requests");
        console.log("Pending requests response:", response.data);
        const pendingCityIds = new Set(
          (response.data as PendingRequest[]).map((req) => req.cityId)
        );
        setPendingRequests(pendingCityIds);
        return response.data;
      } catch (error) {
        console.error("Error fetching pending requests:", error);
        return [];
      }
    },
    enabled: !!userId, // Only fetch pending requests if we have a userId
  });
  console.log("existingRequests", existingRequests);
  // Filter cities in the render phase
  const availableCities = cities.filter((city: City) => {
    // Only filter out cities where user is already a member
    const isNotMember = !city.municipalityUsers?.includes(userId || "");
    console.log(`City ${city.name}:`, {
      municipalityUsers: city.municipalityUsers,
      userId,
      isNotMember,
      hasPendingRequest: pendingRequests.has(city._id),
    });
    return isNotMember;
  });

  const filteredCities = selectedZone
    ? availableCities.filter((city) => city.zone === selectedZone)
    : availableCities;

  const handleJoinRequest = async (cityId: string) => {
    try {
      setError(null);
      setSuccessMessage(null);

      // Check if already pending
      if (pendingRequests.has(cityId)) {
        setError("You already have a pending request for this city");
        return;
      }

      await api.post(`/cities/${cityId}/join/municipality`);
      setPendingRequests((prev) => new Set([...prev, cityId]));
      setSuccessMessage("Join request submitted successfully!");

      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to submit join request";
      setError(errorMessage);

      if (
        errorMessage.includes(
          "Already assigned to city or have a pending request"
        )
      ) {
        setPendingRequests((prev) => new Set([...prev, cityId]));
      }

      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  const zones = ["north", "center", "south"];

  if (loadingCities) {
    return (
      <div className="flex bg-background min-h-screen">
        <Navbar modes="home" isVertical={true} isAccordion={true} />
        <div className="flex-1 p-6 pl-[72px] sm:pl-20 md:pl-6">
          <div className="max-w-4xl mx-auto">
            <Card className="p-6">
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading cities...</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-background min-h-screen">
      <Navbar modes="home" isVertical={true} isAccordion={true} />
      <div className="flex-1 p-6 pl-[72px] sm:pl-20 md:pl-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-primary/60 to-primary text-transparent bg-clip-text">
                Join a City as Municipality
              </span>
            </h2>
            <p className="text-muted-foreground">
              Select a city to join and contribute to your community
            </p>
          </div>

          {error && (
            <Alert
              variant="destructive"
              className="border border-destructive/50"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="border border-primary/50 text-primary">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedZone(null)}
              className={`transition-colors ${
                !selectedZone
                  ? "bg-primary/10 border-primary/20"
                  : "hover:bg-primary/5"
              }`}
            >
              All Zones
            </Button>
            {zones.map((zone) => (
              <Button
                key={zone}
                variant="outline"
                onClick={() => setSelectedZone(zone)}
                className={`transition-colors ${
                  selectedZone === zone
                    ? "bg-primary/10 border-primary/20"
                    : "hover:bg-primary/5"
                }`}
              >
                {zone.charAt(0).toUpperCase() + zone.slice(1)}
              </Button>
            ))}
          </div>

          {filteredCities.length === 0 ? (
            <Card className="p-6">
              <div className="text-center space-y-2">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  No cities available in this zone
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCities.map((city) => (
                <Card
                  key={city._id}
                  className="overflow-hidden transition-all duration-200 hover:shadow-lg border-primary/10 hover:border-primary/20"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1.5">
                        <h3 className="text-xl font-semibold">{city.name}</h3>
                        <Badge
                          variant="outline"
                          className="flex items-center w-fit gap-1 text-xs capitalize"
                        >
                          <MapPin className="h-3 w-3" />
                          {city.zone}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {city.bio}
                    </p>

                    <Button
                      onClick={() => handleJoinRequest(city._id)}
                      className={`w-full transition-all duration-200 ${
                        pendingRequests.has(city._id)
                          ? "bg-muted hover:bg-muted cursor-not-allowed"
                          : "bg-primary/90 hover:bg-primary hover:shadow-md"
                      }`}
                      disabled={pendingRequests.has(city._id)}
                    >
                      {pendingRequests.has(city._id)
                        ? "Request Pending"
                        : "Request to Join"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
