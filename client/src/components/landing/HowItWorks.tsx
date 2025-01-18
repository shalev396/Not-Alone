import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MedalIcon,
  MapIcon,
  PlaneIcon,
  GiftIcon,
} from "@/components/landing/Icons";

interface FeatureProps {
  icon: JSX.Element;
  title: string;
  description: string;
}

const features: FeatureProps[] = [
  {
    icon: <MedalIcon />,
    title: "Register as a Donor",
    description:
      "Create your account and join our community of supporters dedicated to helping Lone Soldiers thrive during their service.",
  },
  {
    icon: <MapIcon />,
    title: "Browse Soldier Needs",
    description:
      "Explore verified requests from Lone Soldiers and find opportunities to provide essential items and support.",
  },
  {
    icon: <PlaneIcon />,
    title: "Make a Donation",
    description:
      "Choose how you want to help - whether it's furniture, electronics, or daily essentials. Coordinate delivery directly through our platform.",
  },
  {
    icon: <GiftIcon />,
    title: "Track Your Impact",
    description:
      "Follow your contributions and see the direct impact you're making in Lone Soldiers' lives through our transparent tracking system.",
  },
];

export const HowItWorks = () => {
  return (
    <section id="howItWorks" className="container text-center py-24 sm:py-32">
      <h2 className="text-3xl md:text-4xl font-bold ">
        How to{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Support{" "}
        </span>
        Lone Soldiers
      </h2>
      <p className="md:w-3/4 mx-auto mt-4 mb-8 text-xl text-muted-foreground">
        Join our community and make a difference in the lives of Lone Soldiers
        through these simple steps
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map(({ icon, title, description }: FeatureProps) => (
          <Card key={title} className="bg-muted/50">
            <CardHeader>
              <CardTitle className="grid gap-4 place-items-center">
                {icon}
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent>{description}</CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
