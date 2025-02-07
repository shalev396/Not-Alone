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
  User,
  Users,
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
      <div className="flex-1 p-4 sm:p-6 pl-[72px] sm:pl-20 md:pl-6">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
            <h1 className="text-2xl sm:text-3xl font-bold">
              <span className="bg-gradient-to-r from-primary/60 to-primary text-transparent bg-clip-text">
                Assign Donations
              </span>
            </h1>
            {userCity && (
              <Badge
                variant="outline"
                className="bg-primary/5 text-primary border-primary/20 flex items-center gap-2 text-sm"
              >
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                {userCity.name} - {userCity.zone}
              </Badge>
            )}
          </div>

          {/* Alerts */}
          {showError && (
            <Alert variant="destructive" className="animate-in fade-in-0">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                {errorMessage}
              </AlertDescription>
              <button
                onClick={() => setShowError(false)}
                className="absolute right-2 top-2 p-1 hover:bg-destructive/10 rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
            </Alert>
          )}

          {showSuccess && (
            <Alert className="bg-primary/10 text-primary border-primary/20 animate-in fade-in-0">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Donations Section */}
            <Card className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-semibold">
                    Available Donations
                  </h2>
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    {filteredDonations.length} items
                  </Badge>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search donations..."
                      value={searchDonation}
                      onChange={(e) => setSearchDonation(e.target.value)}
                      className="pl-8 text-sm"
                    />
                  </div>
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="w-full sm:w-[180px] text-sm">
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

                {/* Donations List */}
                <div className="space-y-3 max-h-[calc(100vh-24rem)] overflow-y-auto">
                  {filteredDonations.map((donation) => (
                    <Card
                      key={donation._id}
                      className={`p-3 sm:p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                        selectedDonation?._id === donation._id
                          ? "ring-2 ring-primary"
                          : ""
                      }`}
                      onClick={() => setSelectedDonation(donation)}
                    >
                      <div className="flex gap-3 sm:gap-4">
                        {donation.media && donation.media[0] ? (
                          <img
                            src={donation.media[0]}
                            alt={donation.title}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-muted flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm sm:text-base truncate">
                            {donation.title}
                          </h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {donation.category}
                            </Badge>
                          </div>
                          {donation.description && (
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-1">
                              {donation.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>

            {/* Soldiers Section */}
            <Card className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-semibold">
                    Available Soldiers
                  </h2>
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    {filteredSoldiers.length} soldiers
                  </Badge>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search soldiers..."
                    value={searchSoldier}
                    onChange={(e) => setSearchSoldier(e.target.value)}
                    className="pl-8 text-sm"
                  />
                </div>

                {/* Soldiers List */}
                <div className="space-y-3 max-h-[calc(100vh-24rem)] overflow-y-auto">
                  {filteredSoldiers.map((soldier) => (
                    <Card
                      key={soldier._id}
                      className={`p-3 sm:p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                        selectedSoldier?._id === soldier._id
                          ? "ring-2 ring-primary"
                          : ""
                      }`}
                      onClick={() => setSelectedSoldier(soldier)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-medium text-sm sm:text-base">
                            {soldier.firstName} {soldier.lastName}
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="truncate">{soldier.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>{soldier.phone}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Assignment Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleAssign}
              disabled={!selectedDonation || !selectedSoldier}
              className="w-full sm:w-auto bg-gradient-to-r from-primary/80 to-primary hover:opacity-90 transition-opacity"
            >
              Assign Donation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
