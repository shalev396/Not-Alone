import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/api";
import { Navbar } from "@/components/shared/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Package,
  Search,
  Calendar,
  Plus,
  Filter,
  Loader2,
  PackageOpen,
} from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSelector } from "react-redux";
import { RootState } from "@/Redux/store";

interface Donation {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: "pending" | "assigned" | "delivery" | "arrived";
  media: string[];
  createdAt: string;
  assignedTo: {
    firstName: string;
    lastName: string;
  };
  donor: {
    firstName: string;
    lastName: string;
  };
}

const statusConfig = {
  pending: {
    color:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
    text: "Pending",
  },
  assigned: {
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
    text: "Assigned",
  },
  delivery: {
    color:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300",
    text: "In Delivery",
  },
  arrived: {
    color:
      "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
    text: "Arrived",
  },
};

export default function MyDonations() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const user = useSelector((state: RootState) => state.user);

  // Get user's assigned donations
  const { data: myDonations = [], isLoading } = useQuery({
    queryKey: ["my-donations"],
    queryFn: async () => {
      const response = await api.get("/donations/my");
      return response.data;
    },
  });

  const uniqueCategories: string[] = Array.from(
    new Set(myDonations.map((d: Donation) => d.category))
  );

  const filteredDonations = myDonations.filter((donation: Donation) => {
    const matchesSearch = search
      ? donation.title.toLowerCase().includes(search.toLowerCase()) ||
        donation.description.toLowerCase().includes(search.toLowerCase())
      : true;

    const matchesCategory =
      categoryFilter === "all" || donation.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" || donation.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleViewDetails = (donationId: string) => {
    navigate(`/donation-status/${donationId}`);
  };

  return (
    <div className="flex bg-background text-foreground min-h-screen">
      <Navbar modes="home" isVertical={true} isAccordion={true} />
      <div className="flex-1 p-4 pl-[72px] sm:pl-20 md:pl-6 pt-4 sm:pt-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-4 mb-6">
            <h2 className="text-3xl font-bold text-center md:text-left">
              <span className="bg-gradient-to-r from-primary/60 to-primary text-transparent bg-clip-text">
                My Donations
              </span>
            </h2>
            {user.type !== "Soldier" && (
              <Button onClick={() => navigate("/create-donation")}>
                Create Donation
              </Button>
            )}
          </div>

          {/* Search and Filters */}
          <Card className="mb-4 sm:mb-6">
            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-2">
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by title or description..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-8 text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-4">
                  <Select
                    value={categoryFilter}
                    onValueChange={(value) => setCategoryFilter(value)}
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
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value)}
                  >
                    <SelectTrigger className="w-full sm:w-[180px] text-sm">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {Object.entries(statusConfig).map(([key, { text }]) => (
                        <SelectItem key={key} value={key}>
                          {text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>

          {/* Donations List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredDonations.length === 0 ? (
            <Card className="py-12 sm:py-16">
              <div className="text-center space-y-4 px-4">
                <PackageOpen className="h-10 sm:h-12 w-10 sm:w-12 text-muted-foreground mx-auto" />
                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-semibold">
                    No donations found
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-[280px] sm:max-w-sm mx-auto">
                    {search ||
                    categoryFilter !== "all" ||
                    statusFilter !== "all"
                      ? "Try adjusting your filters or search term"
                      : user.type === "Soldier"
                      ? "No donations have been assigned to you yet"
                      : "Start by creating your first donation"}
                  </p>
                </div>
                {!search &&
                  categoryFilter === "all" &&
                  statusFilter === "all" &&
                  user.type !== "Soldier" && (
                    <Button
                      onClick={() => navigate("/create-donation")}
                      variant="outline"
                      className="mt-4 text-sm"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Donation
                    </Button>
                  )}
              </div>
            </Card>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredDonations.map((donation: Donation) => (
                <Card
                  key={donation._id}
                  className="p-3 sm:p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-6">
                    <div className="flex gap-3 sm:gap-6">
                      {donation.media && donation.media[0] ? (
                        <img
                          src={donation.media[0]}
                          alt={donation.title}
                          className="w-20 h-20 sm:w-28 sm:h-28 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Package className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="space-y-1.5 sm:space-y-2 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold truncate">
                          {donation.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 sm:gap-y-2 text-xs sm:text-sm text-muted-foreground">
                          <div className="flex items-center gap-1 sm:gap-1.5">
                            <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{donation.category}</span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-1.5">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>
                              {format(new Date(donation.createdAt), "PPP")}
                            </span>
                          </div>
                        </div>
                        {donation.description && (
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                            {donation.description}
                          </p>
                        )}
                      </div>
                    </div> 
                    <div className="flex flex-row sm:flex-col justify-start items-stretch sm:items-start gap-2 sm:gap-3 shrink-0 sm:min-w-[140px]">
                    {(() => {
                        const statusInfo = statusConfig[donation.status] ?? {
                          color: "bg-gray-100 text-gray-800",
                          text: "Unknown",
                        };
                        return (
                          <Badge
                            className={`${statusInfo.color} px-2 sm:px-2.5 py-0.5 text-xs sm:text-sm text-center flex-1 sm:flex-none`}
                          >
                            {statusInfo.text}
                          </Badge>
                        );
                      })()}
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none text-xs sm:text-sm h-8 sm:h-10"
                        onClick={() => handleViewDetails(donation._id)}
                      >
                        View Details
                      </Button>
                    </div>
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
