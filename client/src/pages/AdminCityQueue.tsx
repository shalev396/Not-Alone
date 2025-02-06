import { useState } from "react";
import { api } from "@/api/api";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/shared/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Building2,
  MapPin,
  FileText,
  Image as ImageIcon,
  Calendar,
  Loader2,
} from "lucide-react";

interface City {
  _id: string;
  name: string;
  zone: string;
  bio: string;
  media: string[];
  approvalStatus: "pending" | "approved" | "denied";
  createdAt: string;
}

export default function AdminCityQueue() {
  const [denialReason, setDenialReason] = useState("");
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    data: cities = [],
    isLoading,
    refetch,
  } = useQuery<City[]>({
    queryKey: ["pending-cities"],
    queryFn: async () => {
      const response = await api.get("/cities/pending");
      return response.data;
    },
  });

  const handleApprove = async (cityId: string) => {
    try {
      await api.post(`/cities/${cityId}/approve`);
      refetch();
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to approve city");
    }
  };

  const handleDeny = async (cityId: string) => {
    if (!denialReason) {
      setError("Please provide a reason for denial");
      return;
    }

    try {
      await api.post(`/cities/${cityId}/deny`, { reason: denialReason });
      setDenialReason("");
      setSelectedCity(null);
      refetch();
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to deny city");
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Navbar modes="home2" isVertical={true} isAccordion={true} />
      <main className="flex-1">
        <div className="p-4 pl-[72px] md:p-6">
          <div className="mx-auto w-full max-w-[1200px]">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">
                <span className="bg-gradient-to-r from-primary/60 to-primary bg-clip-text text-transparent">
                  Cities Queue
                </span>
              </h1>
              <Badge variant="outline" className="h-7 px-3">
                {cities.length} Pending{" "}
                {cities.length === 1 ? "City" : "Cities"}
              </Badge>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : cities.length === 0 ? (
              <Card className="p-6">
                <CardContent className="flex items-center justify-center min-h-[100px]">
                  <p className="text-muted-foreground">
                    No pending cities to approve
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {cities.map((city) => (
                  <Card key={city._id} className="flex flex-col">
                    <CardHeader className="bg-muted/50">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            <CardTitle className="text-xl">
                              {city.name}
                            </CardTitle>
                          </div>
                          <CardDescription className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {city.zone.charAt(0).toUpperCase() +
                              city.zone.slice(1)}{" "}
                            Zone
                          </CardDescription>
                        </div>
                        <Badge
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Calendar className="h-4 w-4" />
                          {new Date(city.createdAt).toLocaleDateString()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 pt-6 space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <FileText className="h-4 w-4 text-primary" />
                          About
                        </div>
                        <p className="text-muted-foreground text-sm line-clamp-3">
                          {city.bio}
                        </p>
                      </div>

                      {city.media && city.media.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <ImageIcon className="h-4 w-4 text-primary" />
                            Photos
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {city.media.slice(0, 2).map((url, index) => (
                              <img
                                key={index}
                                src={url}
                                alt={`City ${index + 1}`}
                                className="w-full aspect-square object-cover rounded-lg border"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedCity === city._id ? (
                        <div className="space-y-4">
                          <Textarea
                            placeholder="Enter reason for denial"
                            value={denialReason}
                            onChange={(e) => setDenialReason(e.target.value)}
                            className="min-h-[80px]"
                          />
                          <div className="flex justify-end gap-3">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedCity(null);
                                setDenialReason("");
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleDeny(city._id)}
                              disabled={!denialReason.trim()}
                            >
                              Confirm Denial
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-3 pt-2">
                          <Button
                            variant="destructive"
                            onClick={() => setSelectedCity(city._id)}
                          >
                            Deny
                          </Button>
                          <Button
                            className="bg-gradient-to-r from-primary/80 to-primary hover:opacity-90 transition-opacity"
                            onClick={() => handleApprove(city._id)}
                          >
                            Approve
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
