import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/api/api";
import { EatUp } from "@/types/EatUps";
import { useNavigate } from "react-router-dom";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/shared/Navbar";
import { EditEatupDialog } from "@/components/myeatups/EditEatupDialog";
import {
  UtensilsCrossed,
  Users,
  Languages as LanguagesIcon,
  MapPin,
  Calendar,
  Building2,
  ImageIcon,
  Pencil,
  Trash2,
  MessageSquare,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";

export default function MyEatUps() {
  const [eatups, setEatUps] = useState<EatUp[]>([]);
  const [selectedEatup, setSelectedEatup] = useState<EatUp | null>(null);
  const userId = sessionStorage.getItem("id");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch all cities for reference
  const { data: cities = [] } = useQuery({
    queryKey: ["cities"],
    queryFn: async () => {
      const response = await api.get("/cities");
      return response.data || [];
    },
  });

  const getCityName = (cityId: string) => {
    const city = cities.find((c: any) => c._id === cityId);
    return city ? city.name : cityId;
  };

  const fetchEatUps = async () => {
    try {
      const response = await api.get("/eatups/my");
      const eatupsData = response.data.eatups || [];
      setEatUps(eatupsData);
    } catch (error) {
      console.error("Error fetching EatUps:", error);
      setEatUps([]);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchEatUps();
    }
  }, [userId]);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/eatups/${id}`);
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      await fetchEatUps();
    } catch (error) {
      console.error("Error deleting EatUp:", error);
    }
  };

  const handleEdit = (eatup: EatUp) => {
    setSelectedEatup(eatup);
  };

  const handleSaveEdit = async () => {
    await fetchEatUps();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if the date is today or tomorrow
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    // For other dates
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex bg-background text-foreground min-h-screen">
      <Navbar modes="home2" isVertical={true} isAccordion={true} />

      <div className="flex-1 p-6 pl-[72px] sm:pl-20 md:pl-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center gap-4 mb-8">
            <h2 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-primary/60 to-primary text-transparent bg-clip-text">
                My EatUps
              </span>
            </h2>
            <Button
              onClick={() => navigate("/new-post")}
              className="bg-gradient-to-r from-primary/80 to-primary hover:opacity-90 transition-opacity h-10 px-4"
              size="lg"
            >
              Create EatUp
            </Button>
          </div>

          {eatups.length === 0 ? (
            <Card className="p-6 text-center">
              <div className="py-12 space-y-4">
                <UtensilsCrossed className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="text-muted-foreground text-lg">
                  You haven't created any EatUps yet.
                </p>
                <Button
                  onClick={() => navigate("/new-post")}
                  variant="outline"
                  className="mt-4"
                >
                  Create Your First EatUp
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              {eatups.map((eatup) => (
                <Card
                  key={eatup._id}
                  className="overflow-hidden border border-border/40 shadow-md hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="flex flex-col md:flex-row h-full">
                    {/* Image Section */}
                    <div className="w-full md:w-1/3 relative bg-muted h-[250px] md:h-full">
                      {eatup.media && eatup.media.length > 0 ? (
                        <>
                          <img
                            src={eatup.media[0]}
                            alt={`${eatup.title} - EatUp event`}
                            className="object-fill inset-0 w-full h-full "
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              target.parentElement
                                ?.querySelector(".fallback-icon")
                                ?.classList.remove("hidden");
                            }}
                          />
                          <div className="fallback-icon hidden absolute inset-0 flex items-center justify-center">
                            <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-6">
                      <div className="space-y-4">
                        {/* Title and Description */}
                        <div>
                          <div className="flex justify-between items-start gap-4 mb-2">
                            <h3 className="text-xl font-semibold">
                              {eatup.title}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                                (eatup.guests?.length || 0) >=
                                (eatup.limit || 0)
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-primary/10 text-primary"
                              }`}
                            >
                              {(eatup.guests?.length || 0) >= (eatup.limit || 0)
                                ? "Fully Booked"
                                : "Open for Guests"}
                            </span>
                          </div>
                          <p className="text-muted-foreground line-clamp-2">
                            {eatup.description}
                          </p>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span className="text-sm">
                              {formatDate(eatup.date)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="text-sm">
                              {eatup.location}
                              {eatup.city && (
                                <span className="text-muted-foreground ml-1">
                                  ({getCityName(eatup.city)})
                                </span>
                              )}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-primary" />
                            <span className="text-sm capitalize">
                              {eatup.hosting}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <LanguagesIcon className="h-4 w-4 text-primary" />
                            <span className="text-sm">
                              {eatup.languages?.join(", ") || "Not specified"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            <span className="text-sm">
                              {eatup.guests?.length || 0}/{eatup.limit} guests
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <UtensilsCrossed className="h-4 w-4 text-primary" />
                            <span className="text-sm">
                              {eatup.kosher ? "Kosher" : "Non-Kosher"}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-4">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() =>
                                    navigate(`/channel/${eatup.channel?._id}`)
                                  }
                                  variant="outline"
                                  size="icon"
                                  className="h-9 w-9"
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-popover text-popover-foreground px-3 py-1.5 text-sm rounded-md">
                                View Channel
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => handleEdit(eatup)}
                                  variant="outline"
                                  size="icon"
                                  className="h-9 w-9"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-popover text-popover-foreground px-3 py-1.5 text-sm rounded-md">
                                Edit EatUp
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => handleDelete(eatup._id)}
                                  variant="outline"
                                  size="icon"
                                  className="h-9 w-9 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-popover text-popover-foreground px-3 py-1.5 text-sm rounded-md">
                                Delete EatUp
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Edit Dialog */}
          {selectedEatup && (
            <EditEatupDialog
              eatup={selectedEatup}
              isOpen={!!selectedEatup}
              onClose={() => setSelectedEatup(null)}
              onSave={handleSaveEdit}
            />
          )}
        </div>
      </div>
    </div>
  );
}
