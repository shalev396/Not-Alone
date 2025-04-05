import { Discount } from "@/types/Discount";
import { DealDialog } from "../dialogs/DealDialog";
import { Card } from "@/components/ui/card";


export function DealCard({ deal }: { deal: Discount }) {
    return (
      <DealDialog
        deal={deal}
        trigger={
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <div className="p-4">
              <div className="w-full h-[180px] rounded-md overflow-hidden bg-muted mb-4">
                {deal.media?.length > 0 ? (
                  <img
                    src={deal.media[0]}
                    alt={deal.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No Image
                  </div>
                )}
              </div>
              <h3 className="font-bold text-lg line-clamp-1 mb-1">
                <span className="bg-gradient-to-r from-primary/60 to-primary text-transparent bg-clip-text">
                  {deal.title}
                </span>
              </h3>
              <div className="text-sm text-muted-foreground line-clamp-1">
                {deal.owner?.firstName} {deal.owner?.lastName}
              </div>
              <div className="mt-2">
              </div>
            </div>
          </Card>
        }
      />
    );
  }
  