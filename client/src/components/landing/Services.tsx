import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MagnifierIcon,
  WalletIcon,
  ChartIcon,
} from "@/components/landing/Icons";
import cubeLeg from "../../assets/cube-leg.png";

interface ServiceProps {
  title: string;
  description: string;
  icon: JSX.Element;
}

const serviceList: ServiceProps[] = [
  {
    title: "Direct Donations",
    description:
      "Connect directly with Lone Soldiers and donate essential items they need for their service and daily life.",
    icon: <ChartIcon />,
  },
  {
    title: "Community Support",
    description:
      "Join a network of supporters and volunteers helping to make a difference in Lone Soldiers' lives through various initiatives.",
    icon: <WalletIcon />,
  },
  {
    title: "Resource Matching",
    description:
      "Our smart matching system connects donors with Lone Soldiers based on specific needs and availability.",
    icon: <MagnifierIcon />,
  },
];

export const Services = () => {
  return (
    <section id="services" className="container py-24 sm:py-32">
      <div className="grid lg:grid-cols-[1fr,1fr] gap-8 place-items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold">
            <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
              Client-Centric{" "}
            </span>
            Services
          </h2>

          <p className="text-muted-foreground text-xl mt-4 mb-8">
            Empowering donors to make a direct impact in the lives of Lone
            Soldiers through our comprehensive support services.
          </p>

          <div className="flex flex-col gap-8">
            {serviceList.map(({ icon, title, description }: ServiceProps) => (
              <Card key={title}>
                <CardHeader className="space-y-1 flex md:flex-row justify-start items-start gap-4">
                  <div className="mt-1 bg-primary/20 p-1 rounded-2xl">
                    {icon}
                  </div>
                  <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription className="text-md mt-2">
                      {description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        <img
          src={cubeLeg}
          className="w-[300px] md:w-[500px] lg:w-[600px] object-contain"
          alt="About services"
        />
      </div>
    </section>
  );
};
