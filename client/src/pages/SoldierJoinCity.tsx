import { useState } from "react";
// import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Loader2, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface City {
  _id: string;
  name: string;
  zone: string;
  bio: string;
  media: string[];
  approvalStatus: "approved";
  soldiers: string[];
}

interface JoinError {
  error: string;
  cityName?: string;
}

export default function SoldierJoinCity() {
  //   const navigate = useNavigate();
  const [error, setError] = useState<JoinError | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState<string>("all");
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(
    new Set()
  );

  const userId = sessionStorage.getItem("id");

  // Get available cities
  const { data: cities = [], isLoading } = useQuery<City[]>({
    queryKey: ["cities"],
    queryFn: async () => {
      try {
        console.log("Making API call to fetch cities...");
        const response = await api.get("/cities");
        console.log("Cities API Response:", response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching cities:", error);
        return [];
      }
    },
  });

  // Get pending join requests
  const { data: pendingJoinRequests } = useQuery({
    queryKey: ["pending-join-requests"],
    queryFn: async () => {
      try {
        const response = await api.get("/cities/my-pending-requests");
        console.log("Pending requests response:", response.data);
        const pendingCityIds = new Set(
          response.data.map((request: any) => request.cityId)
        );
        setPendingRequests(pendingCityIds as Set<string>);
        return response.data;
      } catch (error) {
        console.error("Error fetching pending requests:", error);
        return [];
      }
    },
    enabled: !!userId,
  });
  console.log("Pending requests:", pendingJoinRequests);
  const handleJoinRequest = async (cityId: string) => {
    try {
      setError(null);
      await api.post(`/cities/${cityId}/join/soldier`);
      setPendingRequests((prev) => new Set([...prev, cityId]));
      setSuccessMessage("Join request submitted successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      const errorData = error.response?.data;
      if (
        errorData?.error ===
        "Already assigned to city or have a pending request"
      ) {
        setError({
          error: "You already have a pending request or are assigned to a city",
          cityName: errorData.cityName,
        });
        // Update pending requests to reflect the current state
        if (errorData.cityName) {
          setPendingRequests((prev) => new Set([...prev, cityId]));
        }
      } else {
        setError({
          error: errorData?.message || "Failed to submit join request",
        });
      }
      setTimeout(() => setError(null), 5000);
    }
  };

  const filteredCities = cities.filter((city) => {
    console.log("Filtering city:", city);
    const matchesSearch =
      city.name.toLowerCase().includes(search.toLowerCase()) ||
      city.bio.toLowerCase().includes(search.toLowerCase());
    const matchesZone = zoneFilter === "all" || city.zone === zoneFilter;
    const isNotMember = !city.soldiers?.includes(userId || "");
    const shouldShow = matchesSearch && matchesZone && isNotMember;
    console.log(
      `City ${city.name} - matchesSearch: ${matchesSearch}, matchesZone: ${matchesZone}, isNotMember: ${isNotMember}, shouldShow: ${shouldShow}`
    );
    return shouldShow;
  });

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive" className="border border-destructive/50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="mt-1">
            {error.cityName ? (
              <>
                {error.error}
                {error.cityName && (
                  <span className="font-medium"> in {error.cityName}</span>
                )}
              </>
            ) : (
              error.error
            )}
          </AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="border border-primary/50 bg-primary/10 text-primary">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 border-primary/20"
              />
            </div>
          </div>
          <Select value={zoneFilter} onValueChange={setZoneFilter}>
            <SelectTrigger className="w-[180px] border-primary/20">
              <SelectValue placeholder="Zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Zones</SelectItem>
              <SelectItem value="north">North</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="south">South</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading cities...</span>
        </div>
      ) : filteredCities.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">
            No cities found matching your search criteria
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCities.map((city) => (
            <Card
              key={city._id}
              className="overflow-hidden border-primary/10 hover:border-primary/20 transition-colors"
            >
              {city.media && city.media[0] && (
                <div className="relative h-48">
                  <img
                    src={city.media[0]}
                    alt={city.name}
                    className="w-full h-full object-cover"
                  />
                  <Badge
                    variant="outline"
                    className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm"
                  >
                    <MapPin className="w-4 h-4 mr-1 text-primary" />
                    {city.zone}
                  </Badge>
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{city.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {city.bio}
                </p>
                <Button
                  className={`w-full shadow-lg hover:shadow-xl transition-all duration-200 gap-2 ${
                    pendingRequests.has(city._id) ||
                    city.soldiers?.includes(userId || "")
                      ? "bg-muted hover:bg-muted cursor-not-allowed"
                      : "bg-primary/90 hover:bg-primary"
                  }`}
                  onClick={() => handleJoinRequest(city._id)}
                  disabled={
                    pendingRequests.has(city._id) ||
                    city.soldiers?.includes(userId || "")
                  }
                >
                  {pendingRequests.has(city._id)
                    ? "Request Pending"
                    : city.soldiers?.includes(userId || "")
                    ? "Already a Member"
                    : "Request to Join"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
