import { useState } from "react";
import { useParams } from "react-router-dom";

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
import DiscountForm from "@/components/Business/DiscountForm";
import { useQuery } from "@tanstack/react-query";

const BusinessPage = () => {
  const { businessId } = useParams();
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);

  const businessQuery = useQuery({
    queryKey: ["businessId", businessId],
    queryFn: async () => {
      const response = await api.get(`/businesses/${businessId}`);
      return response.data;
    },
  });

  console.log(businessQuery.data);

  if (businessQuery.error) {
    // TODO: handle error
    return <div>error ...</div>;
  }

  if (businessQuery.isLoading) {
    // TODO: handle loading
    return <div>loading ...</div>;
  }

  return (
    <div>
      <Navbar isVertical isAccordion modes="home" />

      <div className="p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Business Page</h1>
        <nav>
          <Dialog
            open={discountDialogOpen}
            onOpenChange={setDiscountDialogOpen}
          >
            <DialogTrigger asChild>
              <button className="text-green-500 hover:underline">
                Add Discount
              </button>
            </DialogTrigger>
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

        <div className="w-full">12321</div>
      </div>
    </div>
  );
};

export default BusinessPage;
