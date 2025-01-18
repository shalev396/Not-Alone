import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDonations } from "@/tenstack/query";
import { Donation } from "@/types/Donation";
import { DetailsDialog } from "../DetailsDialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const zones = ["North", "Center", "South", "all"];
const DonationsCategories = ["Furniture", "Electronics", "Clothes", "all"];

const DonationSkeleton = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-6 bg-muted/50 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
};

export function DonationFeed() {
  const [search, setSearch] = useState("");
  const [zone, setZone] = useState("all");
  const [category, setCategory] = useState("all");

  const { data: donationsData, isLoading: isDonationsLoading } = useQuery({
    queryKey: ["donations"],
    queryFn: fetchDonations,
    staleTime: 1000 * 60 * 5,
  });

  const filterDonations = (donations: Donation[]) => {
    if (!donations) return [];
    return donations.filter((donation) => {
      if (!donation) return false;

      const matchesSearch = donation.description
        ? donation.description.toLowerCase().includes(search.toLowerCase())
        : true;
      const matchesZone = zone === "all" || donation.zone === zone;
      const matchesCategory =
        category === "all" || donation.category === category;

      return matchesSearch && matchesZone && matchesCategory;
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 p-4 rounded-lg space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search donations..."
            className="pl-10 bg-background"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <Select onValueChange={setZone}>
            <SelectTrigger className="w-full md:w-[180px] bg-background">
              <SelectValue placeholder="Zone" />
            </SelectTrigger>
            <SelectContent>
              {zones.map((zone) => (
                <SelectItem key={zone} value={zone}>
                  {zone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={setCategory}>
            <SelectTrigger className="w-full md:w-[180px] bg-background">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {DonationsCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isDonationsLoading ? (
        <DonationSkeleton />
      ) : donationsData ? (
        filterDonations(donationsData).map((donation: Donation) => (
          <DetailsDialog
            key={donation._id}
            donation={donation}
            type="Donations"
          />
        ))
      ) : (
        <div className="text-center py-4">No donations found</div>
      )}
    </div>
  );
}
