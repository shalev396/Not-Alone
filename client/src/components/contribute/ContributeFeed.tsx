import { useState, useEffect } from "react";
import { api } from "@/api/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Request {
  _id: string;
  service: "Regular" | "Reserves";
  item: string;
  itemDescription: string;
  quantity: number;
  zone: "north" | "center" | "south";
  city: string;
  cityDetails: {
    name: string;
    zone: string;
  };
  status: "approved" | "deny" | "in process";
  author: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  createdAt: string;
  paid: boolean;
  paidBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const ContributePostCard: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get("/requests", {
          params: { status: "approved", paid: false },
        });
        setRequests(response.data.requests);
      } catch (error: any) {
        setError(error.response?.data?.message || "Failed to fetch requests");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        <span className="bg-gradient-to-r from-[#F596D3] to-[#D247BF] text-transparent bg-clip-text">
          Support Our Soldiers
        </span>
      </h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {requests.length === 0 && !loading ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">
            No approved requests available at the moment.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request) => (
            <Card key={request._id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl font-semibold">
                    {request.item}
                  </CardTitle>
                  <Badge variant="outline">{request.service}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Requested on {formatDate(request.createdAt)}
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="space-y-3">
                  <p className="text-sm">
                    <span className="font-semibold">Description:</span>{" "}
                    {request.itemDescription}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Quantity:</span>{" "}
                    {request.quantity}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Location:</span>{" "}
                    {request.cityDetails.name} ({request.zone})
                  </p>
                  <div className="text-sm">
                    <span className="font-semibold">Soldier:</span>
                    <p className="ml-4">
                      {request.author.firstName} {request.author.lastName}
                    </p>
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full mt-4 bg-gradient-to-r from-[#F596D3] to-[#D247BF] hover:opacity-90 transition-opacity"
                      onClick={() => {
                        setShowMessage(false);
                      }}
                    >
                      Support This Request
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="bg-card text-card-foreground p-6 max-w-lg mx-auto rounded-lg overflow-y-auto max-h-[80vh]">
                    {!showMessage ? (
                      <>
                        <h3 className="text-xl font-bold mb-4">
                          Support Options
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          Choose how you would like to support this request:
                        </p>

                        <div className="space-y-4">
                          <Button
                            variant="outline"
                            className="w-full text-left flex items-center justify-between py-6"
                            onClick={() => setShowMessage(true)}
                          >
                            <div>
                              <div className="font-semibold">
                                Direct Donation
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Donate the requested items directly
                              </div>
                            </div>
                            <span>→</span>
                          </Button>

                          <Button
                            variant="outline"
                            className="w-full text-left flex items-center justify-between py-6"
                            onClick={() => setShowMessage(true)}
                          >
                            <div>
                              <div className="font-semibold">
                                Financial Support
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Contribute financially to this request
                              </div>
                            </div>
                            <span>→</span>
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center space-y-4">
                        <div className="text-6xl">🤝</div>
                        <h3 className="text-xl font-bold">
                          Thank you for your interest!
                        </h3>
                        <p className="text-muted-foreground">
                          We are currently working on implementing this feature.
                          Please check back soon!
                        </p>

                        <DialogClose asChild>
                          <Button className="mt-4" variant="outline">
                            Close
                          </Button>
                        </DialogClose>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContributePostCard;
