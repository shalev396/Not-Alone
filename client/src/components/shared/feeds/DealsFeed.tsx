import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllDeals } from "@/tenstack/query";
import { Discount } from "@/types/Discount";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Store, Tag } from "lucide-react";

const categories = [
  "Health & Wellness",
  "Clothes",
  "Gear & Equipment",
  "Electronics",
  "Entertainment",
  "Home",
  "All",
];

export function DealsFeed() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const { data: deals, isLoading } = useQuery({
    queryKey: ["deals"],
    queryFn: fetchAllDeals,
    staleTime: 1000 * 60 * 5,
  });

  const filtered = (deals || []).filter((deal: Discount) => {
    const matchesSearch =
      search === "" ||
      deal.title.toLowerCase().includes(search.toLowerCase()) ||
      (deal.description || "").toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || deal.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full space-y-6">
      <Card className="border-primary/20 w-full">
        <CardContent className="p-6 space-y-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search deals by title or description..."
              className="pl-10 bg-background/50 border-primary/20 h-11 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-[220px] bg-background/50 border-primary/20">
              <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
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
        </CardContent>
      </Card>

      <div className="grid gap-4 w-full">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-6 w-1/3 mb-2" />
              <Skeleton className="h-4 w-3/4 mb-1" />
              <Skeleton className="h-4 w-1/2" />
            </Card>
          ))
        ) : filtered.length > 0 ? (
            filtered.map((deal: Discount) => (
                <Card key={deal._id} className="cursor-pointer hover:shadow-md">
                  <CardContent>
                    <h3 className="font-bold text-lg">{deal.title}</h3>
              
                <p className="text-muted-foreground line-clamp-2">
                  {deal.description || "No description provided."}
                </p>
                <div className="flex flex-wrap gap-2 text-sm mt-2">
                  <Badge className="bg-primary/10 text-primary">
                    {deal.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Store className="h-4 w-4 text-muted-foreground" />
                    {deal.owner?.firstName || "Business"}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No deals found.
          </div>
        )}
      </div>
    </div>
  );
}
