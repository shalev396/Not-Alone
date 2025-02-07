import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Donation } from "@/types/Donation";

interface DonationDialogProps {
  donation: Donation | null;
  trigger?: React.ReactNode;
}

export function DonationDialog({ donation, trigger }: DonationDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <div className="p-4 flex gap-4">
              <div className="w-[150px] h-[150px]">
                {donation?.media && donation.media.length > 0 ? (
                  <img
                    src={donation.media[0]}
                    alt="Donation"
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
                    No Image
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg md:text-xl">
                  {donation?.description}
                </h3>
                <p className="text-muted-foreground text-sm md:text-base">
                  {donation?.createdAt &&
                    new Date(donation.createdAt).toLocaleDateString()}
                </p>
                <p className="mb-4 text-muted-foreground leading-relaxed">
                  {donation?.category}
                </p>
              </div>
            </div>
          </Card>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Donation Details</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {donation?.media && donation.media.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              {donation.media.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Donation ${index + 1}`}
                  className="w-full h-[200px] object-cover rounded-lg"
                />
              ))}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">Description</h4>
              <p>{donation?.description}</p>
            </div>
            <div>
              <h4 className="font-semibold">Category</h4>
              <p>{donation?.category}</p>
            </div>
            <div>
              <h4 className="font-semibold">Posted On</h4>
              <p>
                {donation?.createdAt &&
                  new Date(donation.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
