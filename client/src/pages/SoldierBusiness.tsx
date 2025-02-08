import { api } from "@/api/api";
import { useEffect, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/shared/Navbar";

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

const SoldierBusinessPage = () => {
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
        const approvedBusinesses = response.data.filter(
          (b: IBusiness) => b.status === "approved"
        );
        setBusinesses(approvedBusinesses);
      } catch (error) {
        console.error("Error fetching businesses:", error);
      }
    };

    fetchBusinesses();
  }, []);

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

  return (
    <div className="flex bg-background text-foreground min-h-screen">
      <Navbar modes="home2" isVertical={true} isAccordion={true} />

      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-semibold mb-6 text-[#37AA9C]">
          Approved Businesses
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {businesses.map((business) => (
            <div
              key={business._id}
              className="bg-[#1A1A1B] p-6 rounded-lg shadow-lg hover:bg-[#333F44]"
            >
              <h2 className="text-2xl font-semibold text-[#37AA9C]">
                {business.name}
              </h2>
              <p className="text-[#94F3E4] mt-2">{business.slogan}</p>
              <Button
                onClick={() => handleViewDiscounts(business)}
                className="mt-4 bg-[#37AA9C] text-[#1A1A1B] hover:bg-[#94F3E4]"
              >
                View Discounts
              </Button>
            </div>
          ))}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <div className="p-6 bg-[#333F44] rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-[#94F3E4]">
              Discounts for {selectedBusiness?.name}
            </h2>
            <ul>
              {discounts.map((discount) => (
                <li key={discount._id} className="mb-2">
                  <h3 className="text-lg font-medium text-[#37AA9C]">
                    {discount.title} ({discount.amount}%)
                  </h3>
                  <p className="text-[#D9D9D9]">{discount.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </Dialog>
      </div>
    </div>
  );
};

export default SoldierBusinessPage;
