import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navbar } from "@/components/shared/Navbar";
import { Discount } from "@/types/Discount";

export default function MyDeals() {
  const [deals, setDeals] = useState<Discount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const navigate = useNavigate();

  const fetchDeals = async () => {
    try {
      const response = await api.get("/discounts/my");
      setDeals(response.data);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to fetch your deals");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const filteredDeals = deals.filter((deal) => {
    const matchSearch = deal.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "all" || deal.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <div className="flex bg-background min-h-screen text-foreground">
      <Navbar modes="home" isVertical={true} isAccordion={true} />

      <div className="flex-1 p-6 pl-[72px] sm:pl-20 md:pl-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center gap-4 mb-8">
            <h2 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-primary/60 to-primary text-transparent bg-clip-text">
                My Deals
              </span>
            </h2>
            <Button onClick={() => navigate("/new-deal")} className="bg-gradient-to-r from-primary/80 to-primary h-10 px-4">
              Create Deal
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              placeholder="Search deals by title..."
              className="h-11 w-full md:w-2/3"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-[250px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Health & Wellness">Health & Wellness</SelectItem>
                <SelectItem value="Clothes">Clothes</SelectItem>
                <SelectItem value="Gear & Equipment">Gear & Equipment</SelectItem>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Entertainment">Entertainment</SelectItem>
                <SelectItem value="Home">Home</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6 space-y-4">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </Card>
              ))}
            </div>
          ) : filteredDeals.length === 0 ? (
            <Card className="p-8 text-center border border-primary/10">
              <p className="text-muted-foreground mb-4">No deals found</p>
              <Button onClick={() => navigate("/new-deal")} variant="outline">
                Create Your First Deal
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredDeals.map((deal) => (
                <Card key={deal._id} className="overflow-hidden border border-border/40 hover:shadow-lg">
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-[200px] h-[200px] flex items-center justify-center bg-muted">
                      {deal.media && deal.media.length > 0 ? (
                        <img
                          src={deal.media[0]}
                          alt={deal.title}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="text-muted-foreground">No Image</div>
                      )}
                    </div>
                    <div className="flex-1 p-4 space-y-3">
                      <div className="flex justify-between">
                        <h3 className="text-xl font-semibold">
                          {deal.title}
                        </h3>
                        <Badge className="text-sm capitalize bg-primary/10 text-primary border-primary/20">
                          {deal.category}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground line-clamp-3 text-sm">
                        {deal.description || "No description provided."}
                      </p>
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
