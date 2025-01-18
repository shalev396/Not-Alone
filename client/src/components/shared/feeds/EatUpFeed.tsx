import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchEatUps } from "@/tenstack/query";
import { EatUp } from "@/types/EatUps";
import { DetailsDialog } from "../DetailsDialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "../DatePickerWithRange";
import { addDays } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const zones = ["North", "Center", "South", "all"];
const EatUpsKosher = ["Kosher", "Not Kosher", "all"];
const EatUpsHosting = ["Family", "Organization", "all"];

const EatUpSkeleton = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-6 bg-muted/50 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-1/3" />
            <Skeleton className="h-7 w-32" />
          </div>
          <Skeleton className="h-4 w-full" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
};

export function EatUpFeed() {
  const [search, setSearch] = useState("");
  const [zone, setZone] = useState("all");
  const [kosher, setKosher] = useState("all");
  const [hosting, setHosting] = useState("all");
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -365),
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
      const matchesSearch = eatup.title
        ? eatup.title.toLowerCase().includes(search.toLowerCase())
        : true;
      const matchesZone = zone === "all" || eatup.zone === zone;
      const matchesKosher =
        kosher === "all" ||
        (kosher === "Kosher" ? eatup.kosher : !eatup.kosher);
      const matchesHosting = hosting === "all" || eatup.hosting === hosting;

      const eatupDate = new Date(eatup.date);
      const matchesDate =
        !date?.from ||
        !date?.to ||
        (eatupDate.getTime() >= date.from.getTime() &&
          eatupDate.getTime() <= date.to.getTime());

      return (
        matchesSearch &&
        matchesZone &&
        matchesKosher &&
        matchesHosting &&
        matchesDate
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 p-4 rounded-lg space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search eat-ups..."
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
          <Select onValueChange={setKosher}>
            <SelectTrigger className="w-full md:w-[180px] bg-background">
              <SelectValue placeholder="Kosher" />
            </SelectTrigger>
            <SelectContent>
              {EatUpsKosher.map((k) => (
                <SelectItem key={k} value={k}>
                  {k}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={setHosting}>
            <SelectTrigger className="w-full md:w-[180px] bg-background">
              <SelectValue placeholder="Hosting" />
            </SelectTrigger>
            <SelectContent>
              {EatUpsHosting.map((h) => (
                <SelectItem key={h} value={h}>
                  {h}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DatePickerWithRange date={date} setDate={setDate} />
        </div>
      </div>

      {isEatUpsLoading ? (
        <EatUpSkeleton />
      ) : eatupsData && Array.isArray(eatupsData) ? (
        filterEatUps(eatupsData).map((eatup: EatUp) => (
          <DetailsDialog key={eatup._id} eatup={eatup} type="EatUp" />
        ))
      ) : (
        <div className="text-center py-4">No eat-ups found</div>
      )}
    </div>
  );
}
