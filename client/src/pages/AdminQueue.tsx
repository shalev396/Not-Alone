import { Navbar } from "@/components/shared/Navbar";
import Queue from "@/components/admin/Queue";

export default function AdminQueue() {
  return (
    <div className="flex min-h-screen bg-background">
      <Navbar modes="home2" isVertical={true} isAccordion={true} />
      <main className="flex-1">
        <div className="p-4 pl-[72px] md:p-6">
          <div className="mx-auto w-full max-w-[1200px]">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">
                <span className="bg-gradient-to-r from-primary/60 to-primary bg-clip-text text-transparent">
                  Users Queue
                </span>
              </h1>
            </div>
            <Queue />
          </div>
        </div>
      </main>
    </div>
  );
}
