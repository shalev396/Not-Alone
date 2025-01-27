import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/api";
import { Navbar } from "@/components/shared/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Package, Search, Calendar } from "lucide-react";
import { format } from "date-fns";
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
    color: "bg-yellow-100 text-yellow-800",
    text: "Pending",
  },
  assigned: {
    color: "bg-blue-100 text-blue-800",
    text: "Assigned",
  },
  delivery: {
    color: "bg-purple-100 text-purple-800",
    text: "In Delivery",
  },
  arrived: {
    color: "bg-green-100 text-green-800",
    text: "Arrived",
  },
};

export default function MyDonations() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter] = useState<string>("all");

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
    <div className="flex h-screen bg-background">
      <Navbar isVertical isAccordion modes="home" />
      <div className="flex-1 p-6 pl-20 md:pl-6 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-[#F596D3] to-[#D247BF] text-transparent bg-clip-text">
                My Donations
              </span>
            </h1>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search donations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select
              value={categoryFilter}
              onValueChange={(value) => setCategoryFilter(value)}
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
            <Select
              value={categoryFilter}
              onValueChange={(value) => setCategoryFilter(value)}
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

          {/* Donations List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredDonations.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No donations found
              </div>
            ) : (
              filteredDonations.map((donation: Donation) => (
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
                          <p className="text-sm font-medium">Donor:</p>
                          <p className="text-sm text-muted-foreground">
                            {donation.donor.firstName} {donation.donor.lastName}
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
