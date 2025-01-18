import { Navbar } from "@/components/shared/Navbar";
import Queue from "@/components/admin/Queue";

export default function AdminQueue() {
  return (
    <div className="flex bg-background text-foreground min-h-screen">
      <Navbar modes="home" isVertical={true} isAccordion={true} />
      <div className="flex-1 mx-10">
        <Queue />
      </div>
    </div>
  );
}
