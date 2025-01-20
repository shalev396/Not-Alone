import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EatUp } from "@/types/EatUps";
import { useState, useEffect } from "react";
import { api } from "@/api/api";
import { useQueryClient } from "@tanstack/react-query";

interface EatUpDialogProps {
  eatup: EatUp | null;
}

export function EatUpDialog({ eatup }: EatUpDialogProps) {
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
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <div className="p-4 flex gap-4">
            <div className="w-[150px] h-[150px]">
              {eatup?.media && eatup.media.length > 0 ? (
                <img
                  src={eatup.media[0]}
                  alt="EatUp"
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
                  No Image
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg md:text-xl">{eatup?.title}</h3>
              <p className="text-muted-foreground text-sm md:text-base">
                {eatup?.date && new Date(eatup.date).toLocaleDateString()}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Kosher: {eatup?.kosher ? "Yes" : "No"}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Hosting: {eatup?.hosting || "Not specified"}
              </p>
              {eatup?.limit && (
                <p className="text-muted-foreground leading-relaxed">
                  Guests:{" "}
                  <span
                    className={
                      guestCount >= (eatup.limit || 0)
                        ? "text-destructive"
                        : "text-primary"
                    }
                  >
                    {guestCount}/{eatup.limit}
                  </span>
                </p>
              )}
            </div>
          </div>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-[800px]">
        <DialogHeader>
          <DialogTitle>EatUp Details</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          {eatup?.media && eatup.media.length > 0 && (
            <img
              src={eatup.media[0]}
              alt="EatUp"
              className="w-full max-h-[300px] object-cover rounded-lg"
            />
          )}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-lg">{eatup?.title}</h4>
              <p className="text-muted-foreground">
                {eatup?.date && new Date(eatup.date).toLocaleDateString()}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium">Kosher</h5>
                <p>{eatup?.kosher ? "Yes" : "No"}</p>
              </div>
              <div>
                <h5 className="font-medium">Hosting</h5>
                <p>{eatup?.hosting || "Not specified"}</p>
              </div>
              {eatup?.limit && (
                <div>
                  <h5 className="font-medium">Guest Capacity</h5>
                  <p
                    className={
                      guestCount >= (eatup.limit || 0)
                        ? "text-destructive"
                        : "text-primary"
                    }
                  >
                    {guestCount}/{eatup.limit}
                  </p>
                </div>
              )}
            </div>
            <Button
              onClick={handleSubscribe}
              disabled={isLoading || isLimitReached}
              className="w-full"
            >
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
