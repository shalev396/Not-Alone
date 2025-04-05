import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { DealsFeed } from "@/components/shared/feeds/DealsFeed";

export default function Deals() {
  const navigate = useNavigate();

  return (
    <div className="flex bg-background text-foreground min-h-screen">
      <Navbar modes="home2" isVertical={true} isAccordion={true} />

      <div className="flex-1 p-6 pl-[72px] sm:pl-20 md:pl-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center gap-4 mb-8">
            <h2 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-primary/60 to-primary text-transparent bg-clip-text">
                Deals For You
              </span>
            </h2>
            <Button
              onClick={() => navigate("/new-post")}
              className="bg-gradient-to-r from-primary/80 to-primary hover:opacity-90 transition-opacity h-10 px-4"
              size="lg"
            >
              Create Deal
            </Button>
          </div>

          <DealsFeed />
        </div>
      </div>
    </div>
  );
}
