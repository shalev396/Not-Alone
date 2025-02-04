import { Button } from "@/components/ui/button";
import { HeroCards } from "./HeroCards";
import { PaymentDialog } from "./PaymentDialog";

export const Hero = () => {
  return (
    <section className="container grid lg:grid-cols-2 place-items-center py-20 md:py-32 gap-10">
      <div className="text-center lg:text-start space-y-6">
        <main className="text-5xl md:text-6xl font-bold">
          <h1 className="inline">
            <span className="inline bg-gradient-to-r from-[#F596D3]  to-[#D247BF] text-transparent bg-clip-text">
              Not Alone
            </span>{" "}
            a Platform
          </h1>{" "}
          for{" "}
          <h2 className="inline">
            <span className="inline bg-gradient-to-r from-[#61DAFB] via-[#1fc0f1] to-[#03a3d7] text-transparent bg-clip-text">
              Lone Soldiers
            </span>{" "}
            of the IDF
          </h2>
        </main>

        <p className="text-xl text-muted-foreground md:w-10/12 mx-auto lg:mx-0">
          Connect with and support IDF Lone Soldiers through donations,
          resources, and community engagement.
        </p>

        <div className="space-y-4 md:space-y-0 md:space-x-4">
          <PaymentDialog
            triggerClassName="w-full md:w-1/3"
            triggerText="Start Donating"
          />

          <Button
            variant="outline"
            className="w-full md:w-1/3"
            onClick={() => {
              location.href = "#about";
            }}
          >
            Learn More
          </Button>
        </div>
      </div>

      {/* Hero cards sections */}
      <div className="z-10">
        <HeroCards />
      </div>

      {/* Shadow effect */}
      <div className="shadow"></div>
    </section>
  );
};
