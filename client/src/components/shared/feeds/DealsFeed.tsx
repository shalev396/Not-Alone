import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllDeals } from "@/tenstack/query";
import { Discount } from "@/types/Discount";
import { DealCard } from "./DealCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = [
  "all",
  "Health & Wellness",
  "Clothes",
  "Gear & Equipment",
  "Electronics",
  "Entertainment",
  "Home",
];

export function DealsFeed() {
  const [search, setSearch] = useState("");
  const [businessSearch, setBusinessSearch] = useState("");
  const [category, setCategory] = useState("all");

  const {
    data: deals = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["deals"],
    queryFn: fetchAllDeals,
    staleTime: 1000 * 60 * 5,
  });

  const filteredDeals = deals.filter((deal: Discount) => {
    const matchesSearch =
      search === "" ||
      deal.title?.toLowerCase().includes(search.toLowerCase()) ||
      deal.description?.toLowerCase().includes(search.toLowerCase());

    const matchesBusiness =
      businessSearch === "" ||
      deal.owner?.firstName?.toLowerCase().includes(businessSearch.toLowerCase()) ||
      deal.owner?.lastName?.toLowerCase().includes(businessSearch.toLowerCase());

    const matchesCategory = category === "all" || deal.category === category;

    return matchesSearch && matchesBusiness && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 p-4 rounded-lg space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search deals by title or description..."
            className="pl-10 bg-background"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Input
          placeholder="Search by business name..."
          className="bg-background"
          onChange={(e) => setBusinessSearch(e.target.value)}
        />

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-[200px] bg-background">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isError && <div className="text-center py-4">Error loading deals.</div>}

      {!isLoading && filteredDeals.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          No deals found.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDeals.map((deal: Discount) => (
          <DealCard key={deal._id} deal={deal} />
        ))}
      </div>
    </div>
  );
}
