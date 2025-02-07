import { useState, useEffect } from "react";
import { api } from "@/api/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

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
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [open, setOpen] = useState(false);
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

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading requests...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (requests.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold text-muted-foreground">
            No Requests Available
          </h3>
          <p className="text-muted-foreground">
            There are currently no approved requests that need support.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
      {requests.map((request) => (
        <Card key={request._id} className="flex flex-col h-full">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex justify-between items-start gap-4 mb-2">
              <CardTitle className="text-lg sm:text-xl">
                <span className="bg-gradient-to-r from-primary/80 to-primary text-transparent bg-clip-text">
                  {request.item}
                </span>
              </CardTitle>
              <Badge variant="outline" className="capitalize shrink-0">
                {request.service}
              </Badge>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Requested on {formatDate(request.createdAt)}
            </div>
          </CardHeader>

          <CardContent className="flex-1">
            <div className="space-y-3 sm:space-y-4">
              <div>
                <h4 className="font-medium text-sm sm:text-base mb-1">
                  Description
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {request.itemDescription}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <h4 className="font-medium text-sm sm:text-base mb-1">
                    Quantity
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {request.quantity}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-sm sm:text-base mb-1">
                    Location
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {request.cityDetails.name} ({request.zone})
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm sm:text-base mb-1">
                  Requested By
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {request.author.firstName} {request.author.lastName}
                </p>
              </div>

              <Dialog
                open={open && selectedRequest?._id === request._id}
                onOpenChange={setOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    className="w-full bg-gradient-to-r from-primary/80 to-primary hover:opacity-90 transition-opacity text-sm sm:text-base h-9 sm:h-10"
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowMessage(false);
                      setOpen(true);
                    }}
                  >
                    Support This Request
                  </Button>
                </DialogTrigger>

                <DialogContent className="bg-card text-card-foreground p-3 sm:p-6 w-[90vw] sm:max-w-lg mx-auto rounded-lg border shadow-lg">
                  {!showMessage ? (
                    <>
                      <div className="space-y-3 sm:space-y-4">
                        <h3 className="text-lg sm:text-2xl font-bold text-center">
                          <span className="bg-gradient-to-r from-primary/80 to-primary text-transparent bg-clip-text">
                            Support Options
                          </span>
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground text-center mb-3 sm:mb-6">
                          Choose how you would like to support{" "}
                          <span className="font-medium text-foreground">
                            {selectedRequest?.author.firstName}
                          </span>
                          's request for{" "}
                          <span className="font-medium text-foreground">
                            {selectedRequest?.item}
                          </span>
                        </p>

                        <div className="grid gap-2 sm:gap-4">
                          <Button
                            variant="outline"
                            className="w-full p-2 sm:p-4 h-auto text-left flex items-center justify-between hover:bg-primary/5 border-primary/20"
                            onClick={() => setShowMessage(true)}
                          >
                            <div className="space-y-0.5">
                              <div className="font-semibold text-sm sm:text-lg">
                                Direct Support
                              </div>
                              <div className="text-xs text-muted-foreground pr-2">
                                Provide the requested items directly
                              </div>
                            </div>
                            <span className="text-primary text-base sm:text-lg shrink-0 ml-2">
                              →
                            </span>
                          </Button>

                          <Button
                            variant="outline"
                            className="w-full p-2 sm:p-4 h-auto text-left flex items-center justify-between hover:bg-primary/5 border-primary/20"
                            onClick={() => setShowMessage(true)}
                          >
                            <div className="space-y-0.5">
                              <div className="font-semibold text-sm sm:text-lg">
                                Financial Support
                              </div>
                              <div className="text-xs text-muted-foreground pr-2">
                                Contribute financially to this request
                              </div>
                            </div>
                            <span className="text-primary text-base sm:text-lg shrink-0 ml-2">
                              →
                            </span>
                          </Button>
                        </div>

                        <div className="mt-3 sm:mt-6 p-2 sm:p-4 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground">
                            Your support directly helps Lone Soldiers focus on
                            their service. All support is verified and tracked.
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center space-y-2 sm:space-y-4">
                      <div className="text-3xl sm:text-6xl mb-2">🤝</div>
                      <h3 className="text-lg sm:text-2xl font-bold">
                        <span className="bg-gradient-to-r from-primary/80 to-primary text-transparent bg-clip-text">
                          Thank you for your interest!
                        </span>
                      </h3>
                      <p className="text-xs sm:text-base text-muted-foreground">
                        We are currently working on implementing this feature.
                        Please check back soon!
                      </p>
                      <Button
                        className="mt-2 sm:mt-4"
                        variant="outline"
                        onClick={() => {
                          setOpen(false);
                          setShowMessage(false);
                        }}
                      >
                        Close
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ContributePostCard;
