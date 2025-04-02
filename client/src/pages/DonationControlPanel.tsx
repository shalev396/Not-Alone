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
  User,
  Calendar,
  Clock,
  Truck,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

interface AssignedDonation {
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
  assignedTo: {
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

interface DonationResponse {
  donations: AssignedDonation[];
  city: {
    id: string;
    name: string;
    zone: string;
  };
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: "bg-primary/20 text-primary",
    text: "Pending Assignment",
  },
  assigned: {
    icon: User,
    color: "bg-blue-500/20 text-blue-500",
    text: "Assigned to Soldier",
  },
  delivery: {
    icon: Truck,
    color: "bg-purple-500/20 text-purple-500",
    text: "In Delivery",
  },
  arrived: {
    icon: CheckCircle,
    color: "bg-green-500/20 text-green-500",
    text: "Arrived",
  },
};

export default function DonationControlPanel() {
  const navigate = useNavigate();
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);

  // Get user's city
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
        setErrorMessage("Failed to fetch city information");
        setShowError(true);
        return [];
      }
    },
    enabled: true,
    retry: false,
  });

  const userCity = userCities?.[0];

  // Get all donations in the city
  const { data: cityDonations, isLoading: isDonationsLoading } =
    useQuery<DonationResponse>({
      queryKey: ["city-donations"],
      queryFn: async () => {
        try {
          const response = await api.get("/donations/city-matching");
          return response.data;
        } catch (error: any) {
          setErrorMessage("Failed to fetch donations");
          setShowError(true);
          throw error;
        }
      },
      enabled: !!userCity,
    });

  const donations = cityDonations?.donations || [];

  const uniqueCategories = Array.from(
    new Set(donations.filter((d) => d?.category).map((d) => d.category))
  );

  const filteredDonations = donations.filter((donation: AssignedDonation) => {
    if (!donation) return false;

    const matchesSearch = search
      ? (donation.title?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (donation.description?.toLowerCase() || "").includes(
          search.toLowerCase()
        )
      : true;

    const matchesCategory =
      categoryFilter === "all" || donation.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" || donation.status === statusFilter;
    const matchesDate =
      !dateFilter ||
      format(new Date(donation.createdAt), "yyyy-MM-dd") ===
        format(dateFilter, "yyyy-MM-dd");

    return matchesSearch && matchesCategory && matchesStatus && matchesDate;
  });

  const handleViewDetails = (donationId: string) => {
    navigate(`/donation-status/${donationId}`);
  };

  const getDonationStats = () => {
    const total = donations.length;
    const pending = donations.filter((d) => d.status === "pending").length;
    const assigned = donations.filter((d) => d.status === "assigned").length;
    const delivery = donations.filter((d) => d.status === "delivery").length;
    const arrived = donations.filter((d) => d.status === "arrived").length;

    return { total, pending, assigned, delivery, arrived };
  };

  const stats = getDonationStats();

  if (isCityLoading || isDonationsLoading) {
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
                You must be a member of a city to manage donations.
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => navigate("/join-city")}
              className="mt-6 bg-gradient-to-r from-primary/80 to-primary hover:opacity-90 transition-opacity"
            >
              <MapPin className="mr-2 h-4 w-4" />
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold">
              <span className="bg-gradient-to-r from-primary/60 to-primary text-transparent bg-clip-text">
                Donation Control Panel
              </span>
            </h1>
            <Badge variant="outline" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {userCity?.name || "No City"}
            </Badge>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <Card className="p-4 flex flex-col items-center text-center">
              <Package className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm font-medium text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </Card>

            {(Object.entries(statusConfig) as [
              keyof typeof statusConfig,
              {
                icon: React.ElementType;
                color: string;
                text: string;
              }
            ][]).map(([status, config]) => {
              const count = stats[status] ?? 0;
              const Icon = config.icon;

              return (
                <Card key={status} className="p-4 flex flex-col items-center text-center">
                  <Icon className={`h-8 w-8 ${config.color} mb-2`} />
                  <p className="text-sm font-medium text-muted-foreground line-clamp-1">
                    {config.text}
                  </p>
                  <p className="text-2xl font-bold">{count}</p>
                </Card>
              );
            })}
          </div>
          {/* Filters */}
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search donations..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 w-full"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
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
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {Object.entries(statusConfig).map(([status, config]) => (
                        <SelectItem key={status} value={status}>
                          {config.text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full sm:w-[180px] justify-start text-left font-normal ${
                          !dateFilter && "text-muted-foreground"
                        }`}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {dateFilter ? format(dateFilter, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={dateFilter}
                        onSelect={setDateFilter}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </Card>

          {/* Donations List */}
          <div className="space-y-4">
            {filteredDonations.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">No donations found</p>
              </Card>
            ) : (
              filteredDonations.map((donation) => (
                <Card
                  key={donation._id}
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewDetails(donation._id)}
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-[120px] h-[120px]">
                      {donation.media && donation.media.length > 0 ? (
                        <img
                          src={donation.media[0]}
                          alt={donation.title}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg truncate">
                          {donation.title}
                        </h3>
                        {statusConfig[donation.status] ? (
                        <Badge className={`${statusConfig[donation.status].color} w-fit`}>
                          {statusConfig[donation.status].text}
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-300 text-gray-700 w-fit">Unknown</Badge>
                      )}
                      </div>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                        {donation.description}
                      </p>
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {donation.donor.firstName} {donation.donor.lastName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(donation.createdAt), "PPP")}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Error Alert */}
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
        </div>
      </div>
    </div>
  );
}
