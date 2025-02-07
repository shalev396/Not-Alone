import { Navbar } from "@/components/shared/Navbar";
import ContributePostCard from "@/components/contribute/ContributeFeed";

export default function ContributePage() {
  return (
    <div className="flex bg-background text-foreground min-h-screen">
      {/* Navbar Vertical com Accordion na HomePage */}

      {/* isVertical={true} isAccordion={true} */}
      <Navbar modes="home2" isVertical={true} isAccordion={true} />

      {/* Feed */}
      <div className="flex-1 p-6 pl-[72px] sm:pl-20 md:pl-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-4 mb-8">
            <h2 className="text-3xl font-bold text-center md:text-left">
              <span className="bg-gradient-to-r from-primary/60 to-primary text-transparent bg-clip-text">
                Support Requests
              </span>
            </h2>
            <p className="text-muted-foreground text-center md:text-right">
              Help our Lone Soldiers by fulfilling their requests
            </p>
          </div>

          <ContributePostCard />
        </div>
      </div>
    </div>
  );
}
