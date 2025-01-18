import { Navbar } from "@/components/shared/Navbar";
import ContributePostCard from "@/components/contribute/ContributeFeed";

export default function ContributePage() {
  return (
    <div className="flex bg-background text-foreground min-h-screen">
      {/* Navbar Vertical com Accordion na HomePage */}

      {/* isVertical={true} isAccordion={true} */}
      <Navbar modes="home2" isVertical={true} isAccordion={true} />

      {/* Feed */}
      <div className="flex-1 mx-10">
        <ContributePostCard />
      </div>
    </div>
  );
}
