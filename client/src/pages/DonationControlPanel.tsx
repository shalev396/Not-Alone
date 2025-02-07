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
  Filter,
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
      <div className="flex-1 p-6 pl-[72px] sm:pl-20 md:pl-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-primary/60 to-primary text-transparent bg-clip-text">
                Donation Control Panel
              </span>
            </h1>
            <Badge
              variant="outline"
              className="bg-primary/5 text-primary border-primary/20 flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              {userCity.name} - {userCity.zone}
            </Badge>
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

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="p-4 border-primary/20">
              <p className="text-sm text-muted-foreground">Total Donations</p>
              <p className="text-2xl font-bold text-primary">{stats.total}</p>
            </Card>
            <Card className="p-4 border-primary/20">
              <p className="text-sm text-muted-foreground">Pending</p>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <p className="text-2xl font-bold text-primary">
                  {stats.pending}
                </p>
              </div>
            </Card>
            <Card className="p-4 border-primary/20">
              <p className="text-sm text-muted-foreground">Assigned</p>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-500" />
                <p className="text-2xl font-bold text-blue-500">
                  {stats.assigned}
                </p>
              </div>
            </Card>
            <Card className="p-4 border-primary/20">
              <p className="text-sm text-muted-foreground">In Delivery</p>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-purple-500" />
                <p className="text-2xl font-bold text-purple-500">
                  {stats.delivery}
                </p>
              </div>
            </Card>
            <Card className="p-4 border-primary/20">
              <p className="text-sm text-muted-foreground">Arrived</p>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <p className="text-2xl font-bold text-green-500">
                  {stats.arrived}
                </p>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-6 border-primary/20">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search donations..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 bg-background/50 border-primary/20"
                  />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-background/50 border-primary/20">
                  <Clock className="w-4 h-4 mr-2 text-primary" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center gap-2">
                        <config.icon className="w-4 h-4" />
                        {config.text}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[180px] bg-background/50 border-primary/20"
                  >
                    <Calendar className="mr-2 h-4 w-4 text-primary" />
                    {dateFilter ? format(dateFilter, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarComponent
                    mode="single"
                    selected={dateFilter}
                    onSelect={setDateFilter}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {(dateFilter ||
                categoryFilter !== "all" ||
                statusFilter !== "all" ||
                search) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setDateFilter(undefined);
                    setCategoryFilter("all");
                    setStatusFilter("all");
                    setSearch("");
                  }}
                  className="text-primary hover:text-primary/80"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </Card>

          {/* Donations List */}
          <div className="space-y-4">
            {filteredDonations.length === 0 ? (
              <Card className="p-6 text-center border-primary/20">
                <p className="text-muted-foreground">
                  No donations found matching your filters
                </p>
              </Card>
            ) : (
              filteredDonations.map((donation) => {
                const StatusIcon = statusConfig[donation.status].icon;
                return (
                  <Card key={donation._id} className="p-6 border-primary/20">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div className="flex gap-4">
                        {donation.media?.[0] && (
                          <img
                            src={donation.media[0]}
                            alt={donation.title}
                            className="w-24 h-24 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            <Package className="h-4 w-4 text-primary" />
                            {donation.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge
                              variant="outline"
                              className="bg-primary/5 text-primary border-primary/20"
                            >
                              {donation.category}
                            </Badge>
                            <span className="mx-2">•</span>
                            <Calendar className="w-4 h-4" />
                            <span>
                              {format(new Date(donation.createdAt), "PPP")}
                            </span>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm font-medium flex items-center gap-2">
                              <User className="h-4 w-4 text-primary" />
                              Assigned to:
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {donation.assignedTo
                                ? `${donation.assignedTo.firstName} ${donation.assignedTo.lastName}`
                                : "Not assigned yet"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <Badge
                          className={`${
                            statusConfig[donation.status].color
                          } px-4 py-2`}
                        >
                          <StatusIcon className="w-4 h-4 mr-2" />
                          {statusConfig[donation.status].text}
                        </Badge>
                        <Button
                          variant="outline"
                          onClick={() => handleViewDetails(donation._id)}
                          className="bg-background/50 border-primary/20 hover:bg-primary/5"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
