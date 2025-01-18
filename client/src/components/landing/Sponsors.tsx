interface SponsorProps {
  url: string;
  title: string;
}

const sponsors: SponsorProps[] = [
  {
    title: "iitc",
    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiYPc56Gm6ejEvQnSqa18FftiUjtVLSdgDLw&s",
  },
  {
    title: "cyber-pro",
    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsTTJSme7yuPkb3djw-M8yJTJqmskZV2k4-A&s",
  },
  {
    title: "habibi",
    url: "https://chabibi-yavne.org.il/wp-content/uploads/2021/02/%D7%9C%D7%95%D7%92%D7%95-%D7%A2%D7%9E%D7%95%D7%AA%D7%94-%D7%97%D7%93%D7%A9.jpg",
  },
  {
    title: "brothers for life",
    url: "https://www.achimlachaim.org/wp-content/uploads/2018/11/%D7%9C%D7%95%D7%92%D7%95-%D7%AA%D7%9E%D7%95%D7%A0%D7%94-1000x792.jpg",
  },
  {
    title: "power for soldier",
    url: "https://associations.co.il/wp-content/uploads/2022/04/%D7%A2%D7%95%D7%A6%D7%9E%D7%94-%D7%9C%D7%97%D7%99%D7%99%D7%9C.png",
  },
  {
    title: "IDF",
    url: "https://techidf.co.il/wp-content/uploads/2023/01/%D7%9C%D7%95%D7%92%D7%95-%D7%A6%D7%94%D7%9C-%D7%A2%D7%93%D7%9B%D7%A0%D7%99-1920x1793.jpeg",
  },
];

export const Sponsors = () => {
  return (
    <section id="sponsors" className="container pt-24 sm:py-32">
      <h2 className="text-center text-5xl lg:text-xl font-bold mb-8 text-primary">
        Supporters
      </h2>

      <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
        {sponsors.map(({ url, title }: SponsorProps) => (
          <div
            key={title}
            className="flex items-center gap-1 text-muted-foreground/60"
          >
            <img
              src={url}
              alt={title}
              className="max-w-10 max-h-10 rounded-full mx-4"
            />
            {/* <span>{url}</span> */}
            <h3 className="text-xl  font-bold">{title}</h3>
          </div>
        ))}
      </div>
    </section>
  );
};
