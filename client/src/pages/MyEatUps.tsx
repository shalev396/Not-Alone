import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/api/api";
import { EatUp } from "@/types/EatUps";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/shared/Navbar";

export default function MyEatUps() {
  const [eatups, setEatUps] = useState<EatUp[]>([]);
  const userId = sessionStorage.getItem("id");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const fetchEatUps = async () => {
    try {
      const response = await api.get("/eatups");
      const eatupsData = response.data;

      const userEatups = eatupsData.filter(
        (item: EatUp) => item.owner === userId || item.authorId === userId
      );
      setEatUps(userEatups);
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
      // Invalidate and refetch channels after deletion
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      await fetchEatUps();
    } catch (error) {
      console.error("Error deleting EatUp:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="flex h-screen">
      <Navbar isVertical isAccordion modes="home" />

      <div className="flex-1 overflow-auto">
        <div className="flex-1 p-6 pl-20 md:pl-6 bg-background">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-[#F596D3] to-[#D247BF] text-transparent bg-clip-text">
                  My EatUps
                </span>
              </h2>
              <Button
                onClick={() => navigate("/new-post")}
                className="bg-gradient-to-r from-[#F596D3] to-[#D247BF] hover:opacity-90 transition-opacity"
              >
                Create New EatUp
              </Button>
            </div>

            {eatups.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">
                  You haven't created any EatUps yet.
                </p>
              </Card>
            ) : (
              eatups.map((eatup) => (
                <Card
                  key={eatup._id}
                  className="p-6 mb-6 drop-shadow-xl shadow-black/10 dark:shadow-white/10"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/3">
                      {eatup.media && eatup.media.length > 0 ? (
                        <img
                          src={eatup.media[0]}
                          alt="EatUp"
                          className="object-cover rounded-md w-full h-[200px]"
                        />
                      ) : (
                        <div className="bg-muted h-[200px] rounded-md flex items-center justify-center">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          {eatup.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {eatup.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Location</p>
                          <p className="text-muted-foreground">
                            {eatup.location} ({eatup.zone})
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Date & Time</p>
                          <p className="text-muted-foreground">
                            {formatDate(eatup.date)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Hosting Type</p>
                          <p className="text-muted-foreground">
                            {eatup.hosting}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Kosher</p>
                          <p className="text-muted-foreground">
                            {eatup.kosher ? "Yes" : "No"}
                          </p>
                        </div>
                      </div>

                      {eatup.limit && (
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">Guests:</p>
                          <span
                            className={`${
                              (eatup.guests?.length || 0) >= eatup.limit
                                ? "text-destructive"
                                : "text-primary"
                            }`}
                          >
                            {eatup.guests?.length || 0}/{eatup.limit}
                          </span>
                          {(eatup.guests?.length || 0) >= eatup.limit && (
                            <span className="text-sm text-destructive">
                              (Fully Booked)
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex gap-4 pt-4">
                        <Button
                          onClick={() =>
                            navigate(`/channel/${eatup.channel?._id}`)
                          }
                          variant="outline"
                          className="hover:bg-[#F596D3]/10"
                        >
                          View Channel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(eatup._id)}
                        >
                          Delete EatUp
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
