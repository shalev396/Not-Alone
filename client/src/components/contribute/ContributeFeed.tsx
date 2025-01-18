import { useState, useEffect } from "react";
import { api } from "@/api/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface DonationRequest {
  _id: string;
  user: User;
  service: "Regular" | "Reserves";
  itemType: string;
  itemDescription?: string;
  quantity: number;
  urgency: "Immediate" | "Specific Date";
  geographicArea?: string;
  notes?: string;
  agreeToShareDetails: boolean;
  status: "approved" | "deny" | "in process";
  createdAt: string;
}

const ContributePostCard: React.FC = () => {
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRequest, setSelectedRequest] =
    useState<DonationRequest | null>(null);
  console.log(selectedRequest);

  const [open, setOpen] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await api.get<DonationRequest[]>("/requests");
        setRequests(response.data);
      } catch (err) {
        setRequests([]);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  if (loading) return <p>Loading requests...</p>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-center my-6">
        <span className="bg-gradient-to-r from-[#F596D3] to-[#D247BF] text-transparent bg-clip-text">
          Donation Requests
        </span>
      </h1>
      {requests.length === 0 ? (
        <p className="text-center">No requests found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {requests.map((req) => (
            <Card key={req._id} className="w-full border border-gray-200">
              <CardHeader>
                <CardTitle>
                  {req.user.firstName} {req.user.lastName}
                </CardTitle>
                <CardDescription>
                  Request to contribute for {req.itemType}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  <strong>Item Type:</strong> {req.itemType}
                </p>
                <p>
                  <strong>Description:</strong>{" "}
                  {req.itemDescription || "No description provided."}
                </p>
                <p>
                  <strong>Quantity:</strong> {req.quantity}
                </p>
                <p>
                  <strong>Urgency:</strong> {req.urgency}
                </p>
                <p>
                  <strong>Geographic Area:</strong>{" "}
                  {req.geographicArea || "Not specified"}
                </p>
                <p>
                  <strong>Comments:</strong>{" "}
                  {req.notes || "No additional comments."}
                </p>
                <p>
                  <strong>Created At:</strong>{" "}
                  {new Date(req.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <p className="text-sm text-muted-foreground">
                  Status: {req.status || "Pending"}
                </p>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full md:w-auto bg-gradient-to-r from-[#F596D3] to-[#D247BF] hover:opacity-90 transition-opacity"
                      onClick={() => {
                        setSelectedRequest(req);
                        setShowMessage(false);
                        setOpen(true);
                      }}
                    >
                      Start Donating
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="bg-card text-card-foreground p-6 max-w-lg mx-auto rounded-lg overflow-y-auto max-h-[80vh]">
                    {!showMessage ? (
                      <>
                        <h3 className="text-xl font-bold mb-4">
                          Payment Method
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          Add a new payment method to your account.
                        </p>

                        {/* Payment Form */}
                        <form
                          className="space-y-4"
                          onSubmit={(e) => {
                            e.preventDefault();
                            setShowMessage(true); // Show the sorry message
                          }}
                        >
                          <div className="flex space-x-2">
                            <Button variant="outline" className="w-full">
                              Card
                            </Button>
                            <Button variant="outline" className="w-full">
                              Paypal
                            </Button>
                            <Button variant="outline" className="w-full">
                              Apple
                            </Button>
                          </div>

                          <input
                            type="text"
                            placeholder="Name"
                            className="block w-full rounded-md border border-gray-300 py-2 px-4 text-sm focus:ring focus:ring-primary"
                          />
                          <input
                            type="text"
                            placeholder="City"
                            className="block w-full rounded-md border border-gray-300 py-2 px-4 text-sm focus:ring focus:ring-primary"
                          />
                          <input
                            type="text"
                            placeholder="Card number"
                            className="block w-full rounded-md border border-gray-300 py-2 px-4 text-sm focus:ring focus:ring-primary"
                          />

                          <div className="flex space-x-2">
                            <select className="block w-1/3 rounded-md border border-gray-300 py-2 px-4 text-gray-600 focus:ring focus:ring-primary">
                              <option>Month</option>
                            </select>
                            <select className="block w-1/3 rounded-md border border-gray-300 py-2 px-4 text-gray-600 focus:ring focus:ring-primary">
                              <option>Year</option>
                            </select>
                            <input
                              type="text"
                              placeholder="CVC"
                              className="block w-1/3 rounded-md border border-gray-300 py-2 px-4 text-sm focus:ring focus:ring-primary"
                            />
                          </div>

                          <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-[#F596D3] to-[#D247BF] hover:opacity-90 transition-opacity"
                          >
                            Continue
                          </Button>
                        </form>
                      </>
                    ) : (
                      <div className="text-center space-y-4">
                        <div className="text-6xl">😢</div>
                        <h3 className="text-xl font-bold">We’re sorry!</h3>
                        <p className="text-muted-foreground">
                          We are not accepting monetary donations at the moment.
                          Please check back later!
                        </p>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContributePostCard;
