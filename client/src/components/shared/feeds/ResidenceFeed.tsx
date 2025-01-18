import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchResidences } from "@/tenstack/query";
import { Residence } from "@/types/Residence";
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
const residencesType = ["Rent", "Roommates", "all"];
const residencesShelter = ["Sheltered", "Unsheltered", "all"];

const ResidenceSkeleton = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-6 bg-muted/50 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-4 w-full" />
          <div className="flex gap-3">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
};

export function ResidenceFeed() {
  const [search, setSearch] = useState("");
  const [zone, setZone] = useState("all");
  const [type, setType] = useState("all");
  const [shelter, setShelter] = useState("all");

  const { data: residencesData, isLoading: isResidencesLoading } = useQuery({
    queryKey: ["residences"],
    queryFn: fetchResidences,
    staleTime: 1000 * 60 * 5,
  });

  const filterResidences = (residences: Residence[]) => {
    if (!residences) return [];

    return residences.filter((residence) => {
      if (!residence) return false;

      const matchesSearch = residence.description
        ? residence.description.toLowerCase().includes(search.toLowerCase())
        : true;
      const matchesZone = zone === "all" || residence.zone === zone;
      const matchesType = type === "all" || residence.type === type;
      const matchesShelter =
        shelter === "all" ||
        (shelter === "Sheltered" ? residence.shalter : !residence.shalter);

      return matchesSearch && matchesZone && matchesType && matchesShelter;
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted/50 p-4 rounded-lg space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search residences..."
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
          <Select onValueChange={setType}>
            <SelectTrigger className="w-full md:w-[180px] bg-background">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {residencesType.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={setShelter}>
            <SelectTrigger className="w-full md:w-[180px] bg-background">
              <SelectValue placeholder="Shelter" />
            </SelectTrigger>
            <SelectContent>
              {residencesShelter.map((shelter) => (
                <SelectItem key={shelter} value={shelter}>
                  {shelter}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isResidencesLoading ? (
        <ResidenceSkeleton />
      ) : residencesData && residencesData.length > 0 ? (
        filterResidences(residencesData).map((residence: Residence) => (
          <div key={residence._id} className="text-center py-4">
            Residences feature is currently disabled
          </div>
        ))
      ) : (
        <div className="text-center py-4">No residences found</div>
      )}
    </div>
  );
}
