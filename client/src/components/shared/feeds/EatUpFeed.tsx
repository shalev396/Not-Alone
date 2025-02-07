import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchEatUps } from "@/tenstack/query";
import { EatUp } from "@/types/EatUps";
import { DetailsDialog } from "../DetailsDialog";
import { Input } from "@/components/ui/input";
import {
  Search,
  Calendar,
  Utensils,
  Users,
  MapPin,
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "../DatePickerWithRange";
import { addDays, startOfDay, endOfDay, format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const EatUpsKosher = ["Kosher", "Not Kosher", "all"];
const EatUpsHosting = ["organization", "donators", "city", "all"];

const EatUpSkeleton = () => {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 animate-pulse" />
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-2/5" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-4 w-3/4" />
            <div className="flex flex-wrap items-center gap-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-40" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export function EatUpFeed() {
  const [search, setSearch] = useState("");
  const [kosher, setKosher] = useState("all");
  const [hosting, setHosting] = useState("all");
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfDay(new Date()),
    to: addDays(new Date(), 365),
  });

  const { data: eatupsData, isLoading: isEatUpsLoading } = useQuery({
    queryKey: ["eatups"],
    queryFn: fetchEatUps,
    staleTime: 1000 * 60 * 5,
  });

  const filterEatUps = (eatupsData: EatUp[]) => {
    if (!eatupsData) return [];
    return eatupsData.filter((eatup) => {
      const matchesSearch =
        search === "" ||
        eatup.title?.toLowerCase().includes(search.toLowerCase()) ||
        eatup.location?.toLowerCase().includes(search.toLowerCase());
      const matchesKosher =
        kosher === "all" ||
        (kosher === "Kosher" ? eatup.kosher : !eatup.kosher);
      const matchesHosting = hosting === "all" || eatup.hosting === hosting;

      const eatupDate = new Date(eatup.date);
      const matchesDate =
        !date?.from ||
        !date?.to ||
        (eatupDate >= startOfDay(date.from) && eatupDate <= endOfDay(date.to));

      return matchesSearch && matchesKosher && matchesHosting && matchesDate;
    });
  };

  const filteredEatUps = eatupsData ? filterEatUps(eatupsData) : [];

  return (
    <div className="w-full space-y-6">
      <Card className="border-primary/20 w-full">
        <CardContent className="p-6 space-y-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, location, or host..."
              className="pl-10 bg-background/50 border-primary/20 h-11 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <Select value={kosher} onValueChange={setKosher}>
                  <SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-primary/20">
                    <Utensils className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Kosher Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {EatUpsKosher.map((k) => (
                      <SelectItem key={k} value={k}>
                        {k}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={hosting} onValueChange={setHosting}>
                  <SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-primary/20">
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Host Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EatUpsHosting.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h.charAt(0).toUpperCase() + h.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex-1 min-w-0">
                  <DatePickerWithRange
                    date={date}
                    setDate={setDate}
                    className="w-full bg-background/50 border-primary/20"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <div className="grid gap-4 w-full">
        {isEatUpsLoading ? (
          <EatUpSkeleton />
        ) : filteredEatUps.length > 0 ? (
          filteredEatUps.map((eatup) => (
            <DetailsDialog
              key={eatup._id}
              type="EatUp"
              eatup={eatup}
              trigger={
                <Card className="cursor-pointer hover:shadow-lg transition-shadow w-full">
                  <div className="p-4 flex gap-4">
                    <div className="w-[150px] h-[150px] flex-shrink-0">
                      {eatup.media && eatup.media.length > 0 ? (
                        <img
                          src={eatup.media[0]}
                          alt={eatup.title}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-bold text-lg md:text-xl mb-2">
                        <span className="bg-gradient-to-r from-primary/60 to-primary text-transparent bg-clip-text">
                          {eatup.title}
                        </span>
                      </h3>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{eatup.location}</span>
                        {eatup.city && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <Badge
                              variant="outline"
                              className="bg-primary/5 text-primary border-primary/20"
                            >
                              {eatup.city.name}
                            </Badge>
                          </>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-primary" />
                          {format(new Date(eatup.date), "MMMM d, yyyy")}
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-primary" />
                          {eatup.guests?.length || 0}/{eatup.limit || 2} Guests
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              }
            />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No EatUps found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
