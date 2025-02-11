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
import { Card } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

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
  const [isBusinessDialogOpen, setBusinessDialogOpen] = useState(false);

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
        <div className="flex items-center justify-between mx-auto max-w-5xl w-full px-2 mb-8">
          <h1 className="text-3xl font-bold ">Business Dashboard</h1>
          <Dialog
            open={isBusinessDialogOpen}
            onOpenChange={setBusinessDialogOpen}
          >
            <DialogTrigger asChild>
              <button className="bg-green-500 text-white px-4 py-2 rounded ml-2">
                Create Your First Business
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Business</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new business.
                </DialogDescription>
              </DialogHeader>
              <BusinessForm onFinish={() => setBusinessDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            {businesses.length === 0 && (
              <Card className="p-6 text-center mx-auto max-w-5xl">
                <div className="rounded-xl bg-card text-card-foreground p-6 text-center">
                  <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <p className="text-muted-foreground text-lg">
                    You haven't created any Business yet.
                  </p>
                  <Dialog
                    open={isBusinessDialogOpen}
                    onOpenChange={setBusinessDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <button className="bg-green-500 text-white px-4 py-2 rounded ml-2">
                        Create Your First Business
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
                        onFinish={() => setBusinessDialogOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </Card>
            )}
            {discounts.length === 0 && (
              <p className="text-center text-red-500">
                No discounts found! You can add a discount for your business.
              </p>
            )}
            {businesses.length > 0 && (
              <div className="business-list">
                <ul className="flex flex-wrap gap-4 justify-center">
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
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BusinessesDashboard;
