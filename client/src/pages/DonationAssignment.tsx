import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/api";
import { Navbar } from "@/components/shared/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Package, Search, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Donation {
  _id: string;
  title: string;
  description: string;
  category: string;
  city: {
    _id: string;
    name: string;
    zone: string;
  };
  address: string;
  media: string[];
  status: "pending";
  donor: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface Soldier {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  city: {
    _id: string;
    name: string;
    zone: string;
  };
}

interface CityMatchingData {
  donations: Donation[];
  soldiers: Soldier[];
}

export default function DonationAssignment() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchDonation, setSearchDonation] = useState("");
  const [searchSoldier, setSearchSoldier] = useState("");
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(
    null
  );
  const [selectedSoldier, setSelectedSoldier] = useState<Soldier | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // First get the user's city
  const { data: userCities, isLoading: isCityLoading } = useQuery({
    queryKey: ["user-city"],
    queryFn: async () => {
      try {
        const response = await api.get("/cities/me");
        return response.data;
      } catch (error) {
        console.error("Failed to fetch user city:", error);
        return [];
      }
    },
    enabled: true,
    retry: false,
  });

  const userCity = userCities?.[0];

  // Get city matching data
  const { data: cityMatchingData } = useQuery<CityMatchingData>({
    queryKey: ["city-matching"],
    queryFn: async () => {
      const response = await api.get("/donations/city-matching");
      return response.data;
    },
    enabled: !!userCity, // Only fetch when we have the user's city
  });

  console.log("Current userCity:", userCity); // Debug log

  const donations = cityMatchingData?.donations || [];
  const soldiers = cityMatchingData?.soldiers || [];

  const handleAssign = async () => {
    if (!selectedDonation || !selectedSoldier) {
      setError("Please select both a donation and a soldier");
      return;
    }

    try {
      await api.post(
        `/donations/${selectedDonation._id}/assign/${selectedSoldier._id}`
      );
      setSuccessMessage("Donation assigned successfully!");
      setSelectedDonation(null);
      setSelectedSoldier(null);
      setTimeout(() => {
        setSuccessMessage(null);
        navigate(`/donation-control-panel`);
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to assign donation");
    }
  };

  const filteredDonations = donations.filter((donation: Donation) => {
    const matchesSearch = searchDonation
      ? donation.title.toLowerCase().includes(searchDonation.toLowerCase()) ||
        donation.description
          .toLowerCase()
          .includes(searchDonation.toLowerCase())
      : true;

    const matchesCategory =
      categoryFilter === "all" || donation.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const filteredSoldiers = soldiers.filter((soldier: Soldier) => {
    return (
      soldier.firstName.toLowerCase().includes(searchSoldier.toLowerCase()) ||
      soldier.lastName.toLowerCase().includes(searchSoldier.toLowerCase()) ||
      soldier.email.toLowerCase().includes(searchSoldier.toLowerCase())
    );
  });

  const uniqueCategories = Array.from(
    new Set(donations.map((d: Donation) => d.category))
  );

  return (
    <div className="flex h-screen bg-background">
      <Navbar isVertical isAccordion modes="home" />
      <div className="flex-1 p-6 pl-20 md:pl-6 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-[#F596D3] to-[#D247BF] text-transparent bg-clip-text">
                Assign Donations
              </span>
            </h1>
            {isCityLoading ? (
              <Badge
                variant="outline"
                className="text-base px-4 py-2 bg-background"
              >
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </Badge>
            ) : userCity ? (
              <Badge
                variant="outline"
                className="text-base px-4 py-2 bg-background flex items-center"
              >
                <MapPin className="w-4 h-4 mr-2 shrink-0" />
                <span>
                  {userCity.name} - {userCity.zone}
                </span>
              </Badge>
            ) : null}
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donations Section */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Available Donations
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search donations..."
                        value={searchDonation}
                        onChange={(e) => setSearchDonation(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {uniqueCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {filteredDonations.map((donation) => (
                    <Card
                      key={donation._id}
                      className={`p-4 cursor-pointer ${
                        selectedDonation?._id === donation._id
                          ? "border-primary"
                          : ""
                      }`}
                      onClick={() => setSelectedDonation(donation)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{donation.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {donation.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <Package className="w-4 h-4" />
                            <span>{donation.category}</span>
                          </div>
                        </div>
                        {donation.media && donation.media[0] && (
                          <img
                            src={donation.media[0]}
                            alt={donation.title}
                            className="w-20 h-20 rounded object-cover"
                          />
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>

            {/* Soldiers Section */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Available Soldiers</h2>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search soldiers..."
                    value={searchSoldier}
                    onChange={(e) => setSearchSoldier(e.target.value)}
                    className="pl-8"
                  />
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {filteredSoldiers.map((soldier) => (
                    <Card
                      key={soldier._id}
                      className={`p-4 cursor-pointer ${
                        selectedSoldier?._id === soldier._id
                          ? "border-primary"
                          : ""
                      }`}
                      onClick={() => setSelectedSoldier(soldier)}
                    >
                      <h3 className="font-semibold">
                        {soldier.firstName} {soldier.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {soldier.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {soldier.phone}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleAssign}
              disabled={!selectedDonation || !selectedSoldier}
              className="bg-gradient-to-r from-[#F596D3] to-[#D247BF] hover:opacity-90"
            >
              Assign Donation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
