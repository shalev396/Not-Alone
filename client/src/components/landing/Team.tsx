import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Facebook, Instagram, Linkedin } from "lucide-react";

interface TeamProps {
  imageUrl: string;
  name: string;
  position: string;
  description: string;
  socialNetworks: SociaNetworkslProps[];
}

interface SociaNetworkslProps {
  name: string;
  url: string;
}

const teamList: TeamProps[] = [
  {
    imageUrl: "/natanphoto.jpg",
    name: "Nathan Kilinski",
    position: "FullStack Developer",
    description:
      "Leading our efforts to build strong connections between donors and Lone Soldiers.",
    socialNetworks: [
      {
        name: "Linkedin",
        url: "https://www.linkedin.com/in/nathan-kilinski-b4a933325/",
      },
      // {
      //   name: "Facebook",
      //   url: "#",
      // },
    ],
  },
  {
    imageUrl: "https://avatars.githubusercontent.com/u/164013914?v=4",
    name: "Liav Ben Shimon",
    position: "FullStack Developer",
    description:
      "Coordinating with Lone Soldiers to understand and address their needs effectively.",
    socialNetworks: [
      {
        name: "Linkedin",
        url: "https://www.linkedin.com/in/liav-ben-shimon/",
      },
      // {
      //   name: "Instagram",
      //   url: "#",
      // },
    ],
  },
  {
    imageUrl: "https://avatars.githubusercontent.com/u/60286095?v=4",
    name: "Shalev Ben Moshe",
    position: "FullStack Developer",
    description:
      "Ensuring smooth connections between donors and soldiers for maximum impact.",
    socialNetworks: [
      {
        name: "Linkedin",
        url: "https://www.linkedin.com/in/shalev-ben-moshe-08a8a3176/",
      },
      // {
      //   name: "Github",
      //   url: "https://github.com/shalev396",
      // },
    ],
  },
];

export const Team = () => {
  const socialIcon = (iconName: string) => {
    switch (iconName) {
      case "Linkedin":
        return <Linkedin size="20" />;

      case "Facebook":
        return <Facebook size="20" />;

      case "Instagram":
        return <Instagram size="20" />;
    }
  };

  return (
    <section id="team" className="container py-24 sm:py-32">
      <h2 className="text-3xl md:text-4xl font-bold">
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Meet Our{" "}
        </span>
        Support Team
      </h2>

      <p className="mt-4 mb-10 text-xl text-muted-foreground">
        Dedicated professionals working to connect donors with Lone Soldiers and
        make a difference
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-10">
        {teamList.map(
          ({
            imageUrl,
            name,
            position,
            description,
            socialNetworks,
          }: TeamProps) => (
            <Card
              key={name}
              className="bg-muted/50 relative mt-8 flex flex-col justify-center items-center"
            >
              <CardHeader className="mt-8 flex justify-center items-center pb-2">
                <img
                  src={imageUrl}
                  alt={`${name} ${position}`}
                  className="absolute -top-12 rounded-full w-24 h-24 aspect-square object-cover"
                />
                <CardTitle className="text-center">{name}</CardTitle>
                <CardDescription className="text-primary">
                  {position}
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center pb-2">
                <p>{description}</p>
              </CardContent>

              <CardFooter>
                {socialNetworks.map(({ name, url }: SociaNetworkslProps) => (
                  <div key={name}>
                    <a
                      rel="noreferrer noopener"
                      href={url}
                      target="_blank"
                      className={buttonVariants({
                        variant: "ghost",
                        size: "sm",
                      })}
                    >
                      <span className="sr-only">{name} icon</span>
                      {socialIcon(name)}
                    </a>
                  </div>
                ))}
              </CardFooter>
            </Card>
          )
        )}
      </div>
    </section>
  );
};
