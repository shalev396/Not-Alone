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
import {
  Package,
  Search,
  MapPin,
  User,
  Calendar,
  Clock,
  Truck,
  CheckCircle,
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
    color: "bg-yellow-500",
    text: "Pending Assignment",
  },
  assigned: {
    icon: User,
    color: "bg-blue-500",
    text: "Assigned to Soldier",
  },
  delivery: {
    icon: Truck,
    color: "bg-purple-500",
    text: "In Delivery",
  },
  arrived: {
    icon: CheckCircle,
    color: "bg-green-500",
    text: "Arrived",
  },
};

export default function DonationControlPanel() {
  const navigate = useNavigate();
  const [error] = useState<string | null>(null);
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
      } catch (error) {
        console.error("Failed to fetch user city:", error);
        return [];
      }
    },
    enabled: true,
    retry: false,
  });

  const userCity = userCities?.[0];

  // Get all donations in the city
  const { data: cityDonations } = useQuery<DonationResponse>({
    queryKey: ["city-donations"],
    queryFn: async () => {
      const response = await api.get("/donations/city-matching");
      return response.data;
    },
    enabled: !!userCity, // Only fetch when we have the user's city
  });

  console.log("Current userCity:", userCity); // Debug log

  const donations = cityDonations?.donations || [];

  const uniqueCategories = Array.from(
    new Set(donations.map((d: AssignedDonation) => d.category))
  );

  const filteredDonations = donations.filter((donation: AssignedDonation) => {
    const matchesSearch = search
      ? donation.title.toLowerCase().includes(search.toLowerCase()) ||
        donation.description.toLowerCase().includes(search.toLowerCase())
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

  return (
    <div className="flex h-screen bg-background">
      <Navbar isVertical isAccordion modes="home" />
      <div className="flex-1 p-6 pl-20 md:pl-6 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-[#F596D3] to-[#D247BF] text-transparent bg-clip-text">
                Donation Control Panel
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

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Total Donations</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-yellow-500">
                {stats.pending}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Assigned</p>
              <p className="text-2xl font-bold text-blue-500">
                {stats.assigned}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">In Delivery</p>
              <p className="text-2xl font-bold text-purple-500">
                {stats.delivery}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Arrived</p>
              <p className="text-2xl font-bold text-green-500">
                {stats.arrived}
              </p>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search donations or soldiers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
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
                  <Button variant="outline" className="w-[180px]">
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateFilter ? format(dateFilter, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
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
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </Card>

          {/* Donations List */}
          <div className="space-y-4">
            {filteredDonations.map((donation) => {
              const StatusIcon = statusConfig[donation.status].icon;
              return (
                <Card key={donation._id} className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex gap-4">
                      {donation.media && donation.media[0] && (
                        <img
                          src={donation.media[0]}
                          alt={donation.title}
                          className="w-24 h-24 rounded object-cover"
                        />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          {donation.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Package className="w-4 h-4" />
                          <span>{donation.category}</span>
                          <span className="mx-2">•</span>
                          <Calendar className="w-4 h-4" />
                          <span>
                            {format(new Date(donation.createdAt), "PPP")}
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm font-medium">Assigned to:</p>
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
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}

            {filteredDonations.length === 0 && (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">
                  No donations found matching your filters
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
