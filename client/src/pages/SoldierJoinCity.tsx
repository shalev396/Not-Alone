import { useState } from "react";
// import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/api";
import { Navbar } from "@/components/shared/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";
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

export default function SoldierJoinCity() {
  //   const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
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
      await api.post(`/cities/${cityId}/join/soldier`);
      setPendingRequests((prev) => new Set([...prev, cityId]));
      setSuccessMessage("Join request submitted successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setError(
        error.response?.data?.message || "Failed to submit join request"
      );
      setTimeout(() => setError(null), 3000);
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
    <div className="flex h-screen bg-background">
      <Navbar isVertical isAccordion modes="home" />
      <div className="flex-1 p-6 pl-20 md:pl-6 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-[#F596D3] to-[#D247BF] text-transparent bg-clip-text">
                Join a City
              </span>
            </h1>
          </div>

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

          {/* Filters */}
          <Card className="p-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search cities..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={zoneFilter} onValueChange={setZoneFilter}>
                <SelectTrigger className="w-[180px]">
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

          {/* Cities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCities.map((city) => (
              <Card key={city._id} className="overflow-hidden">
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
                      <MapPin className="w-4 h-4 mr-1" />
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
                    className={`w-full ${
                      pendingRequests.has(city._id) ||
                      city.soldiers?.includes(userId || "")
                        ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#F596D3] to-[#D247BF] hover:opacity-90"
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

          {filteredCities.length === 0 && !isLoading && (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">
                No cities found matching your search criteria
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
