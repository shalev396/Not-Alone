import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
  import { Badge } from "@/components/ui/badge";
  import { Discount } from "@/types/Discount";
  import { format } from "date-fns";
  import {
    Calendar,
    ScrollText,
    User,
    Tag,
  } from "lucide-react";
  
  interface DealDialogProps {
    deal: Discount;
    trigger?: React.ReactNode;
  }
  export function DealDialog({ deal, trigger }: DealDialogProps) {
    console.log("Rendering deal:", deal.title);
    return (
<Dialog>
<DialogTrigger asChild>
  {trigger || (
    <button className="p-4 border rounded hover:shadow">View Deal</button>
  )}
</DialogTrigger>
        <DialogContent className="max-w-[600px] w-[95vw] overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">
              <span className="bg-gradient-to-r from-primary/60 to-primary text-transparent bg-clip-text font-bold">
                {deal.title}
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-6">
            {deal.media && deal.media.length > 0 && (
              <div className="flex justify-center mx-auto max-w-lg">
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                  <img
                    src={deal.media[0]}
                    alt={deal.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      target.parentElement?.classList.add("bg-muted");
                    }}
                  />
                </div>
              </div>
            )}
  
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-5 w-5 text-primary" />
                <p>{format(new Date(deal.createdAt), "MMMM d, yyyy")}</p>
              </div>
  
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-5 w-5 text-primary" />
                <p>{deal.owner?.firstName} {deal.owner?.lastName}</p>
              </div>
  
              <div className="flex items-center gap-2 text-muted-foreground">
                <Tag className="h-5 w-5 text-primary" />
                <Badge
                  variant="outline"
                  className="bg-primary/5 text-primary border-primary/20"
                >
                  {deal.category}
                </Badge>
              </div>
  
              {deal.description && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ScrollText className="h-5 w-5 text-primary" />
                    <h5 className="font-medium">Description</h5>
                  </div>
                  <p className="text-muted-foreground whitespace-pre-wrap pl-7">
                    {deal.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  