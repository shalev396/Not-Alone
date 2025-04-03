import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllDeals } from "@/tenstack/query";
import { Input } from "@/components/ui/input";
import { Discount } from "@/types/Discount";
import { Search } from "lucide-react";
import { DealDialog } from "@/components/shared/DealDialog";
import { Navbar } from "@/components/shared/Navbar";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
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

export default function Deals() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ["deals"],
    queryFn: fetchAllDeals,
  });

  const filteredDeals = deals.filter((deal: Discount) => {
    const matchesSearch =
      search === "" ||
      deal.title?.toLowerCase().includes(search.toLowerCase()) ||
      deal.description?.toLowerCase().includes(search.toLowerCase()) ||
      (deal.owner as any)?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      (deal.owner as any)?.lastName?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = category === "all" || deal.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex bg-background text-foreground min-h-screen">
      <Navbar modes="home" isVertical={true} isAccordion={true} />

      <div className="flex-1 p-6 pl-[72px] sm:pl-20 md:pl-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-4 mb-8">
            <h2 className="text-3xl font-bold text-center md:text-left">
              <span className="bg-gradient-to-r from-primary/60 to-primary text-transparent bg-clip-text">
                Business Deals
              </span>
            </h2>
            <p className="text-muted-foreground text-center md:text-right">
              Browse exclusive offers created by local businesses
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, description, business..."
                className="pl-10 h-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDeals.map((deal: Discount) => (
              <DealDialog key={deal._id} deal={deal} />
            ))}
          </div>

          {!isLoading && filteredDeals.length === 0 && (
            <p className="text-center text-muted-foreground pt-6">
              No deals found.
            </p>
          )}
        </div>

        {/* Floating Button */}
        <div className="fixed bottom-6 right-6 px-6 z-20">
          <div className="max-w-4xl mx-auto">
          </div>
        </div>
      </div>
    </div>
  );
}
