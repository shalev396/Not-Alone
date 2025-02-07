import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EatUp } from "@/types/EatUps";
import { useState, useEffect } from "react";
import { api } from "@/api/api";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  MapPin,
  Calendar,
  Utensils,
  Users,
  User,
  Building2,
  ScrollText,
  Languages,
} from "lucide-react";

interface EatUpDialogProps {
  eatup: EatUp | null;
  trigger?: React.ReactNode;
}

export function EatUpDialog({ eatup, trigger }: EatUpDialogProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [guestCount, setGuestCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const queryClient = useQueryClient();

  const handleSubscribe = async () => {
    if (!eatup?._id) return;

    setIsLoading(true);
    try {
      console.log("Attempting to toggle subscription for EatUp:", eatup._id);
      const endpoint = isSubscribed ? "unsubscribe" : "subscribe";
      const response = await api.post(`/eatups/${eatup._id}/${endpoint}`);
      console.log("Subscription response:", response.data);

      if (response.data) {
        setIsSubscribed(!isSubscribed);
        setGuestCount(response.data.guests?.length || 0);
        queryClient.invalidateQueries({ queryKey: ["channels"] });

        if (eatup.limit && response.data.guests?.length >= eatup.limit) {
          setIsLimitReached(true);
        } else {
          setIsLimitReached(false);
        }
      }
    } catch (error: any) {
      console.error("Subscription error:", error);
      console.error("Error response:", error.response);

      if (error.response?.status === 404) {
        alert(error.response.data.message || "EatUp not found");
      } else if (error.response?.status === 400) {
        alert(error.response.data.message);
        if (error.response.data.message === "Guest limit reached") {
          setIsLimitReached(true);
        }
      } else {
        alert("Error toggling subscription. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (eatup) {
      const currentUserId = sessionStorage.getItem("id");
      console.log("Current user ID:", currentUserId);
      console.log("EatUp guests:", eatup.guests);
      const subscribed = eatup.guests?.includes(currentUserId || "") || false;
      console.log("Is subscribed:", subscribed);
      setIsSubscribed(subscribed);
      setGuestCount(eatup.guests?.length || 0);

      if (eatup.limit && (eatup.guests?.length || 0) >= eatup.limit) {
        setIsLimitReached(true);
      } else {
        setIsLimitReached(false);
      }
    }
  }, [eatup]);

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-[800px] w-[95vw] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">
            <span className="bg-gradient-to-r from-primary/60 to-primary text-transparent bg-clip-text font-bold">
              {eatup?.title}
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          {eatup?.media && eatup.media.length > 0 && (
            <div className="flex justify-center mx-auto max-w-2xl">
              <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                <img
                  src={eatup.media[0]}
                  alt={`${eatup.title}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
          )}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-5 w-5 text-primary" />
              <p>
                {eatup?.date && format(new Date(eatup.date), "MMMM d, yyyy")}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h5 className="font-medium">Location</h5>
                </div>
                <p className="text-muted-foreground pl-7">{eatup?.location}</p>
                {eatup?.city && (
                  <div className="pl-7 flex items-center gap-2 mt-1">
                    <Badge
                      variant="outline"
                      className="bg-primary/5 text-primary border-primary/20"
                    >
                      {eatup.city.name}
                    </Badge>
                    <span className="text-muted-foreground text-sm">
                      ({eatup.city.zone} zone)
                    </span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h5 className="font-medium">Hosting</h5>
                </div>
                <p className="text-muted-foreground pl-7">
                  {eatup?.hosting || "Not specified"}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-primary" />
                  <h5 className="font-medium">Kosher</h5>
                </div>
                <p className="text-muted-foreground pl-7">
                  {eatup?.kosher ? "Yes" : "No"}
                </p>
              </div>
              {eatup?.limit && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <h5 className="font-medium">Guest Capacity</h5>
                  </div>
                  <p
                    className={`pl-7 ${
                      guestCount >= (eatup.limit || 0)
                        ? "text-destructive"
                        : "text-primary"
                    }`}
                  >
                    {guestCount}/{eatup.limit}
                  </p>
                </div>
              )}
            </div>
            {eatup?.description && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ScrollText className="h-5 w-5 text-primary" />
                  <h5 className="font-medium">Description</h5>
                </div>
                <p className="text-muted-foreground whitespace-pre-wrap pl-7">
                  {eatup.description}
                </p>
              </div>
            )}
            {eatup?.languages && eatup.languages.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Languages className="h-5 w-5 text-primary" />
                  <h5 className="font-medium">Languages</h5>
                </div>
                <div className="flex flex-wrap gap-2 pl-7">
                  {eatup.languages.map((language, index) => (
                    <span
                      key={index}
                      className="bg-primary/10 text-primary text-sm px-2 py-1 rounded-md"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <Button
              onClick={handleSubscribe}
              disabled={isLoading || isLimitReached}
              className="w-full mt-6"
            >
              <User className="h-4 w-4 mr-2" />
              {isLoading
                ? "Processing..."
                : isSubscribed
                ? "Unsubscribe"
                : "Subscribe"}
            </Button>
            {isLimitReached && (
              <p className="text-destructive text-sm text-center">
                Guest limit reached
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
