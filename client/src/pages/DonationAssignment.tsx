import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/api";
import { Navbar } from "@/components/shared/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Package,
  Search,
  MapPin,
  AlertCircle,
  X,
  CheckCircle,
  Mail,
  Phone,
  Calendar,
  User,
  Users,
  Filter,
} from "lucide-react";
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
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
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
      } catch (error: any) {
        if (error.response?.status === 401) {
          navigate("/login");
        }
        return [];
      }
    },
    enabled: true,
    retry: false,
  });

  const userCity = userCities?.[0];

  // Get city matching data
  const { data: cityMatchingData, isLoading: isDataLoading } =
    useQuery<CityMatchingData>({
      queryKey: ["city-matching"],
      queryFn: async () => {
        const response = await api.get("/donations/city-matching");
        return response.data;
      },
      enabled: !!userCity,
    });

  const donations = cityMatchingData?.donations || [];
  const soldiers = cityMatchingData?.soldiers || [];

  const handleAssign = async () => {
    if (!selectedDonation || !selectedSoldier) {
      setErrorMessage("Please select both a donation and a soldier");
      setShowError(true);
      return;
    }

    try {
      await api.post(
        `/donations/${selectedDonation._id}/assign/${selectedSoldier._id}`
      );
      setSuccessMessage("Donation assigned successfully!");
      setShowSuccess(true);
      setSelectedDonation(null);
      setSelectedSoldier(null);
      setTimeout(() => {
        setShowSuccess(false);
        navigate(`/donation-control-panel`);
      }, 2000);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Failed to assign donation"
      );
      setShowError(true);
    }
  };

  const filteredDonations = donations.filter((donation: Donation) => {
    if (!donation) return false;

    const matchesSearch = searchDonation
      ? (donation.title?.toLowerCase() || "").includes(
          searchDonation.toLowerCase()
        ) ||
        (donation.description?.toLowerCase() || "").includes(
          searchDonation.toLowerCase()
        )
      : true;

    const matchesCategory =
      categoryFilter === "all" || donation.category === categoryFilter;

    const isPending = donation.status === "pending";

    return matchesSearch && matchesCategory && isPending;
  });

  const filteredSoldiers = soldiers.filter((soldier: Soldier) => {
    if (!soldier) return false;

    return (
      (soldier.firstName?.toLowerCase() || "").includes(
        searchSoldier.toLowerCase()
      ) ||
      (soldier.lastName?.toLowerCase() || "").includes(
        searchSoldier.toLowerCase()
      ) ||
      (soldier.email?.toLowerCase() || "").includes(searchSoldier.toLowerCase())
    );
  });

  const uniqueCategories = Array.from(
    new Set(donations.filter((d) => d?.category).map((d) => d.category))
  );

  if (isCityLoading || isDataLoading) {
    return (
      <div className="flex bg-background text-foreground min-h-screen">
        <Navbar modes="home" isVertical={true} isAccordion={true} />
        <div className="flex-1 p-6 pl-[72px] sm:pl-20 md:pl-6">
          <div className="max-w-7xl mx-auto">
            <Card className="p-6">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="ml-3 text-muted-foreground">
                  {isCityLoading
                    ? "Checking authorization..."
                    : "Loading donations..."}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!userCity) {
    return (
      <div className="flex bg-background text-foreground min-h-screen">
        <Navbar modes="home" isVertical={true} isAccordion={true} />
        <div className="flex-1 p-6 pl-[72px] sm:pl-20 md:pl-6">
          <div className="max-w-7xl mx-auto">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Unauthorized Access</AlertTitle>
              <AlertDescription>
                You must be a member of a city to manage donation assignments.
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => navigate("/join-city")}
              className="mt-6 bg-gradient-to-r from-primary/80 to-primary hover:opacity-90 transition-opacity"
            >
              <Users className="mr-2 h-4 w-4" />
              Join a City
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-background text-foreground min-h-screen">
      <Navbar modes="home" isVertical={true} isAccordion={true} />
      <div className="flex-1 p-6 pl-[72px] sm:pl-20 md:pl-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-primary/60 to-primary text-transparent bg-clip-text">
                Assign Donations
              </span>
            </h1>
            {userCity && (
              <Badge
                variant="outline"
                className="bg-primary/5 text-primary border-primary/20 flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                {userCity.name} - {userCity.zone}
              </Badge>
            )}
          </div>

          {showError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                {errorMessage}
                <button
                  onClick={() => setShowError(false)}
                  className="rounded-full p-1 hover:bg-destructive/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </AlertDescription>
            </Alert>
          )}

          {showSuccess && (
            <Alert className="mb-6 border-primary/20 text-primary bg-primary/5">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                {successMessage}
                <button
                  onClick={() => setShowSuccess(false)}
                  className="rounded-full p-1 hover:bg-primary/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donations Section */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
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
                        className="pl-8 bg-background/50 border-primary/20"
                      />
                    </div>
                  </div>
                  {uniqueCategories.length > 0 && (
                    <Select
                      value={categoryFilter}
                      onValueChange={setCategoryFilter}
                    >
                      <SelectTrigger className="w-[180px] bg-background/50 border-primary/20">
                        <Filter className="w-4 h-4 mr-2 text-primary" />
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
                  )}
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {filteredDonations.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No donations found
                    </div>
                  ) : (
                    filteredDonations.map(
                      (donation) =>
                        donation && (
                          <Card
                            key={donation._id}
                            className={`p-4 cursor-pointer transition-all hover:border-primary/50 ${
                              selectedDonation?._id === donation._id
                                ? "border-primary bg-primary/5"
                                : ""
                            }`}
                            onClick={() => setSelectedDonation(donation)}
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <h3 className="font-semibold flex items-center gap-2">
                                  <Package className="h-4 w-4 text-primary" />
                                  {donation.title}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                  {donation.description}
                                </p>
                                <div className="flex items-center gap-4 mt-2">
                                  <Badge
                                    variant="outline"
                                    className="bg-primary/5 text-primary border-primary/20"
                                  >
                                    {donation.category}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(
                                      donation.createdAt
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              {donation.media?.[0] && (
                                <img
                                  src={donation.media[0]}
                                  alt={donation.title}
                                  className="w-20 h-20 rounded-lg object-cover"
                                />
                              )}
                            </div>
                          </Card>
                        )
                    )
                  )}
                </div>
              </div>
            </Card>

            {/* Soldiers Section */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Available Soldiers
              </h2>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search soldiers..."
                    value={searchSoldier}
                    onChange={(e) => setSearchSoldier(e.target.value)}
                    className="pl-8 bg-background/50 border-primary/20"
                  />
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {filteredSoldiers.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No soldiers found
                    </div>
                  ) : (
                    filteredSoldiers.map(
                      (soldier) =>
                        soldier && (
                          <Card
                            key={soldier._id}
                            className={`p-4 cursor-pointer transition-all hover:border-primary/50 ${
                              selectedSoldier?._id === soldier._id
                                ? "border-primary bg-primary/5"
                                : ""
                            }`}
                            onClick={() => setSelectedSoldier(soldier)}
                          >
                            <div className="space-y-2">
                              <h3 className="font-semibold flex items-center gap-2">
                                <User className="h-4 w-4 text-primary" />
                                {soldier.firstName} {soldier.lastName}
                              </h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Mail className="h-4 w-4 text-primary" />
                                {soldier.email}
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Phone className="h-4 w-4 text-primary" />
                                {soldier.phone}
                              </p>
                              {soldier.city && (
                                <Badge
                                  variant="outline"
                                  className="bg-primary/5 text-primary border-primary/20 mt-2"
                                >
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {soldier.city.name}
                                </Badge>
                              )}
                            </div>
                          </Card>
                        )
                    )
                  )}
                </div>
              </div>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleAssign}
              disabled={!selectedDonation || !selectedSoldier}
              className="bg-gradient-to-r from-primary/80 to-primary hover:opacity-90 transition-opacity"
            >
              <Package className="mr-2 h-4 w-4" />
              Assign Donation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
