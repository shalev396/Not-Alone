import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BusinessForm from "../components/Business/BusinessForm"; // Import the BusinessForm component
import DiscountForm from "../components/Business/DiscountForm"; // Assuming you have a DiscountForm component
import { Navbar } from "@/components/shared/Navbar";
import { api } from "@/api/api"; // Import the api instance
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"; // Import the dialog components from shadcn

interface Business {
  _id: string;
  name: string;
  description: string;
}

interface Discount {
  _id: string;
  name: string;
  discount: string;
  expireDate: string;
}

const BusinessDashboard = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // States to handle opening/closing of the dialogs
  const [isBusinessDialogOpen, setBusinessDialogOpen] = useState(false);
  const [isDiscountDialogOpen, setDiscountDialogOpen] = useState(false);

  // Fetch businesses and discounts from the server
  useEffect(() => {
    const fetchData = async () => {
      try {
        const businessResponse = await api.get("/businesses");
        const discountResponse = await api.get("/discounts");
        setBusinesses(businessResponse.data);
        setDiscounts(discountResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <Navbar isVertical isAccordion modes="home" />

      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-6">
          Business Dashboard
        </h1>

        {/* Display a message if there are no businesses or discounts */}
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            {businesses.length === 0 && (
              <p className="text-center text-red-500">
                No businesses found! Please add a business to get started.
              </p>
            )}
            {discounts.length === 0 && (
              <p className="text-center text-red-500">
                No discounts found! You can add a discount for your business.
              </p>
            )}

            <nav className="mb-4">
              {/* DialogTrigger for opening business form */}
              <Dialog
                open={isBusinessDialogOpen}
                onOpenChange={setBusinessDialogOpen}
              >
                <DialogTrigger asChild>
                  <button className="bg-green-500 text-white px-4 py-2 rounded ml-2">
                    Add Business
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Business</DialogTitle>
                    <DialogDescription>
                      Fill in the details to create a new business.
                    </DialogDescription>
                  </DialogHeader>

                  <BusinessForm
                    onFinish={() => {
                      setBusinessDialogOpen(false); // Close the dialog after submission
                    }}
                  />
                </DialogContent>
              </Dialog>

              {/* DialogTrigger for opening discount form */}
              <Dialog
                open={isDiscountDialogOpen}
                onOpenChange={setDiscountDialogOpen}
              >
                {/* <DialogTrigger asChild>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded ml-2">
                    Add Discount
                  </button>
                </DialogTrigger> */}
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Discount</DialogTitle>
                    <DialogDescription>
                      Fill in the details to create a new discount for your
                      business.
                    </DialogDescription>
                  </DialogHeader>
                  <DiscountForm
                    onSubmit={() => {
                      setDiscountDialogOpen(false); // Close the dialog after submission
                    }}
                  />
                </DialogContent>
              </Dialog>
            </nav>

            {/* Display the list of businesses */}
            <div className="business-list">
              <h2 className="text-2xl font-semibold mb-4"> Your Businesses</h2>
              {businesses.length > 0 ? (
                <ul className="space-y-4">
                  {businesses.map((business) => (
                    <li
                      key={business._id}
                      className="border border-blue-500 p-4 rounded-lg"
                    >
                      <h3 className="font-semibold text-xl">{business.name}</h3>
                      <p>{business.description}</p>
                      <div className="flex items-center space-x-4 border border-500 p-2 rounded">
                        <Link
                          to={`/business/${business._id}`}
                          className="text-blue-500 hover:underline"
                        >
                          View Details
                        </Link>
                        <Dialog
                          open={isDiscountDialogOpen}
                          onOpenChange={setDiscountDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <button className="text-blue-500 hover:underline">
                              Add Discount
                            </button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Create Discount</DialogTitle>
                              <DialogDescription>
                                Fill in the details to create a new discount for
                                your business.
                              </DialogDescription>
                            </DialogHeader>
                            <DiscountForm
                              onSubmit={(discount) => {
                                console.log(discount);
                                setDiscountDialogOpen(false); // Close the dialog after submission
                              }}
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No businesses to display.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BusinessDashboard;
