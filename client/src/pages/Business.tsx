import { api } from "@/api/api";
import { useEffect, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface IBusiness {
  _id: string;
  name: string;
  slogan: string;
  status: "pending" | "approved" | "denied";
}

interface IDiscount {
  _id: string;
  title: string;
  description: string;
  amount: number; // Discount percentage
  businessId: string;
}

const BusinessPage = () => {
  const [businesses, setBusinesses] = useState<IBusiness[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<IBusiness | null>(
    null
  );
  const [discounts, setDiscounts] = useState<IDiscount[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await api.get("/businesses");
        setBusinesses(response.data);
      } catch (error) {
        console.error("Error fetching businesses:", error);
      }
    };

    fetchBusinesses();
  }, []);

  const handleCreateBusiness = async () => {
    const name = prompt("Enter business name:");
    const slogan = prompt("Enter business slogan:");

    if (!name || !slogan) return;

    try {
      const response = await api.post("/businesses", { name, slogan });
      setBusinesses([...businesses, response.data]);
    } catch (error) {
      console.error("Error creating business:", error);
    }
  };

  const handleDeleteBusiness = async (id: string) => {
    try {
      await api.delete(`/businesses/${id}`);
      setBusinesses(businesses.filter((b) => b._id !== id));
    } catch (error) {
      console.error("Error deleting business:", error);
    }
  };

  const handleViewDiscounts = async (business: IBusiness) => {
    try {
      const response = await api.get(`/businesses/${business._id}/discounts`);
      setDiscounts(response.data);
      setSelectedBusiness(business);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Error fetching discounts:", error);
    }
  };

  const handleAddDiscount = async () => {
    if (!selectedBusiness) return;

    const title = prompt("Enter discount title:");
    const description = prompt("Enter discount description:");
    const amount = parseFloat(prompt("Enter discount percentage:") || "0");

    if (!title || !description || isNaN(amount)) return;

    try {
      const response = await api.post(
        `/businesses/${selectedBusiness._id}/discounts`,
        {
          title,
          description,
          amount,
        }
      );
      setDiscounts([...discounts, response.data]);
    } catch (error) {
      console.error("Error adding discount:", error);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-semibold mb-6 text-gray-900">
        Business Page
      </h1>
      <Button onClick={handleCreateBusiness} className="mb-4">
        Create Business
      </Button>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {businesses.map((business) => (
          <div
            key={business._id}
            className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700"
          >
            <h2 className="text-2xl font-semibold text-green-500">
              {business.name}
            </h2>
            <p className="text-gray-300 mt-2">{business.slogan}</p>
            <p
              className={`mt-2 ${
                business.status === "approved"
                  ? "text-green-400"
                  : "text-red-500"
              }`}
            >
              {business.status.toUpperCase()}
            </p>
            <Button
              onClick={() => handleViewDiscounts(business)}
              className="mt-4 mr-2"
            >
              View Discounts
            </Button>
            <Button
              onClick={() => handleDeleteBusiness(business._id)}
              className="mt-4"
              variant="destructive"
            >
              Delete Business
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">
            Discounts for {selectedBusiness?.name}
          </h2>
          <ul>
            {discounts.map((discount) => (
              <li key={discount._id} className="mb-2">
                <h3 className="text-lg font-medium text-gray-800">
                  {discount.title} ({discount.amount}%)
                </h3>
                <p className="text-gray-600">{discount.description}</p>
              </li>
            ))}
          </ul>
          <Button onClick={handleAddDiscount} className="mt-4">
            Add Discount
          </Button>
        </div>
      </Dialog>
    </div>
  );
};

export default BusinessPage;
