import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TestimonialProps {
  image: string;
  name: string;
  userName: string;
  comment: string;
}

const testimonials: TestimonialProps[] = [
  {
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5m509gsAe8RQHmuoRkes24WuNX09QQP2bLA&s",
    name: "Sarah Cohen",
    userName: "@sarah_c",
    comment:
      "Being able to directly help Lone Soldiers through this platform has been incredibly rewarding. The process is seamless and transparent.",
  },
  {
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSksG4mm4xFN-Ufeaf1ZZ8ixWe2k4aZknK1MQ&s",
    name: "David Levy",
    userName: "@david_l",
    comment:
      "As a former Lone Soldier, I know how meaningful these donations are. This platform makes it easy for the community to support current soldiers.",
  },
  {
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwdYb63lfA2fF1ACfL6qoNfU56KjOjQdAPTQ&s",
    name: "Rachel Berg",
    userName: "@rachel_b",
    comment:
      "The ability to see specific needs and donate exactly what soldiers require is fantastic. It creates a real connection between donors and recipients.",
  },
  {
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQF2yaox2cALIq_yyd-9qEyovEsficJr7X9QQ&s",
    name: "Michael Stern",
    userName: "@michael_s",
    comment:
      "I appreciate how the platform connects us directly with Lone Soldiers. It's gratifying to know exactly how our donations are helping.",
  },
  {
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_1bpO0XDD8fbmRvnbnkCoQNFFoH3AqofVTg&s",
    name: "Hannah Gold",
    userName: "@hannah_g",
    comment:
      "The community aspect of this platform is amazing. It's not just about donations - it's about creating a support network for our Lone Soldiers.",
  },
  {
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDpWYsLSeY1sLvwgFNwBeJGjszUfEofDpwJw&s",
    name: "Daniel Roth",
    userName: "@daniel_r",
    comment:
      "As a regular donor, I love seeing the impact of our contributions. The platform makes it easy to stay connected and continue supporting.",
  },
];

export const Testimonials = () => {
  return (
    <section id="testimonials" className="container py-24 sm:py-32">
      <h2 className="text-3xl md:text-4xl font-bold">
        Hear from Our
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          {" "}
          Community{" "}
        </span>
        of Supporters
      </h2>

      <p className="text-xl text-muted-foreground pt-4 pb-8">
        Discover how our platform connects donors with Lone Soldiers and makes a
        real difference in their lives
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 sm:block columns-2  lg:columns-3 lg:gap-6 mx-auto space-y-4 lg:space-y-6">
        {testimonials.map(
          ({ image, name, userName, comment }: TestimonialProps) => (
            <Card
              key={userName}
              className="max-w-md md:break-inside-avoid overflow-hidden"
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Avatar>
                  <AvatarImage alt="" src={image} />
                  <AvatarFallback>OM</AvatarFallback>
                </Avatar>

                <div className="flex flex-col">
                  <CardTitle className="text-lg">{name}</CardTitle>
                  <CardDescription>{userName}</CardDescription>
                </div>
              </CardHeader>

              <CardContent>{comment}</CardContent>
            </Card>
          )
        )}
      </div>
    </section>
  );
};
