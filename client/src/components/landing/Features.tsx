import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface FeatureProps {
  title: string;
  description: string;
  image: string;
}

const features: FeatureProps[] = [
  {
    title: "Easy Donation Process",
    description:
      "Simple and secure platform to donate items directly to Lone Soldiers in need. Track your contributions and see their impact.",
    image: "/assets/looking-ahead.png",
  },
  {
    title: "Soldier Needs Feed",
    description:
      "Browse through verified requests from Lone Soldiers and choose how you want to help, whether it's furniture, electronics, or daily essentials.",
    image: "/assets/reflecting.png",
  },
  {
    title: "Community Connection",
    description:
      "Build meaningful connections within the Lone Soldier support community and make a real difference in soldiers' lives.",
    image: "/assets/looking-ahead.png",
  },
];

export const Features = () => {
  return (
    <section id="features" className="container py-24 sm:py-32 space-y-8">
      <h2 className="text-3xl lg:text-4xl font-bold md:text-center">
        Many{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Great Features
        </span>
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map(({ title, description, image }: FeatureProps) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>

            <CardContent>{description}</CardContent>

            <CardFooter>
              <img
                src={image}
                alt="About feature"
                className="w-[200px] lg:w-[300px] mx-auto"
              />
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
};
