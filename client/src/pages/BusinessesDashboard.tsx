import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BusinessForm from "../components/Business/BusinessForm";

import { Navbar } from "@/components/shared/Navbar";
import { api } from "@/api/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Business {
  _id: string;
  name: string;
  media: string[];
}

interface Discount {
  _id: string;
  name: string;
  discount: string;
  expireDate: string;
}

const defaultImage =
  "https://www.vocaleurope.eu/wp-content/uploads/no-image.jpg";

const BusinessesDashboard = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // States to handle opening/closing of the dialogs
  const [isBusinessDialogOpen, setBusinessDialogOpen] = useState(false);

  // Fetch businesses and discounts from the server
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [businessResponse, discountResponse] = await Promise.all([
          api.get("/businesses"),
          api.get("/discounts"),
        ]);
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

      <div className="p-6">
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
            </nav>

            {/* Display the list of businesses */}
            <div className="business-list">
              <h2 className="text-2xl font-semibold mb-4"> Your Businesses</h2>
              {businesses.length > 0 ? (
                <ul className="flex flex-wrap gap-4">
                  {businesses.map((business) => (
                    <Link key={business._id} to={`/business/${business._id}`}>
                      <li
                        className="border items-start hover:scale-[1.02] transition-all duration-300 shadow-lg justify-start overflow-hidden bg-white group relative border-white p-4 rounded-lg flex size-[260px] gap-4"
                        style={{
                          backgroundImage: `url(${
                            business.media[0] || defaultImage
                          })`,
                          backgroundSize: "contain",
                          backgroundPosition: "center",
                          backgroundRepeat: "no-repeat",
                        }}
                      >
                        <div className="bg-white rounded-lg px-2 py-1">
                          <h3 className="font-semibold text-x text-black">
                            {business.name}
                          </h3>
                        </div>
                      </li>
                    </Link>
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

export default BusinessesDashboard;
