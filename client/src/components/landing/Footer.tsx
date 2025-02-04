import { buttonVariants } from "@/components/ui/button";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Footer = () => {
  const navigate = useNavigate();

  const legalLinks = [
    { text: "Privacy Policy", path: "/privacypolicy" },
    { text: "Terms of Service", path: "/termsofservice" },
    { text: "Contact Us", path: "/#" },
    { text: "Licenses", path: "/licenses" },
  ];

  return (
    <footer className="border-t">
      <div className="container py-12 md:py-24 flex flex-col lg:flex-row gap-8 justify-between">
        <div className="lg:w-1/3">
          <h3 className="text-xl font-bold mb-4">Not Alone Support</h3>
          <p className="text-muted-foreground mb-4">
            Connecting communities worldwide with IDF Lone Soldiers through
            meaningful donations and support.
          </p>
          <div className="flex gap-4">
            <a
              // href="https://www.facebook.com/lonesoldier"
              target="_blank"
              rel="noreferrer noopener"
              className={buttonVariants({ variant: "ghost", size: "icon" })}
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              // href="https://www.instagram.com/lonesoldier"
              target="_blank"
              rel="noreferrer noopener"
              className={buttonVariants({ variant: "ghost", size: "icon" })}
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              // href="https://www.linkedin.com/company/lonesoldier"
              target="_blank"
              rel="noreferrer noopener"
              className={buttonVariants({ variant: "ghost", size: "icon" })}
            >
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="lg:w-1/4">
          <h3 className="font-bold mb-4">Legal</h3>
          <ul className="space-y-3 text-muted-foreground">
            {legalLinks.map((link) => (
              <li key={link.path}>
                {link.text === "Contact Us" ? (
                  <a href="tel:0544809493">Call us at (+972)54-480-9493</a>
                ) : (
                  <a
                    onClick={() => navigate(link.path)}
                    style={{ cursor: "pointer" }}
                  >
                    {link.text}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t">
        <div className="container py-6 text-center text-muted-foreground">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span>©2024</span>
              <a
                className="text-primary hover:underline"
                property="dct:title"
                rel="cc:attributionURL"
                href="https://notalonesoldier.com"
              >
                Not Alone
              </a>
              <span>•</span>
              <span>All Rights Reserved</span>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm flex-wrap">
              <span>Created by</span>
              <a
                className="text-primary hover:underline"
                rel="cc:attributionURL dct:creator"
                property="cc:attributionName"
                href="https://github.com/shalev396"
              >
                Shalev Ben Moshe
              </a>
              <span>•</span>
              <a
                className="text-primary hover:underline"
                rel="cc:attributionURL dct:creator"
                href="https://github.com/liavbenshimon"
              >
                Liav Ben Shimon
              </a>
              <span>•</span>
              <a
                className="text-primary hover:underline"
                rel="cc:attributionURL dct:creator"
                href="https://github.com/NathKilin"
              >
                Nathan Kilinski
              </a>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm">
              <span>Based on a template by</span>
              <a
                className="text-primary hover:underline"
                href="https://github.com/leoMirandaa"
                target="_blank"
                rel="noopener noreferrer"
              >
                Leopoldo Miranda
              </a>
              <span>
                (
                <a
                  className="text-primary hover:underline"
                  onClick={() => navigate("/licenses")}
                  style={{ cursor: "pointer" }}
                >
                  MIT License
                </a>
                )
              </span>
            </div>

            {/* <div className="flex flex-col items-center gap-2 text-sm mt-2">
              <div className="flex items-center justify-center gap-2">
                <span>Application licensed under</span>
                <a
                  href="https://creativecommons.org/licenses/by-nc-nd/4.0/?ref=chooser-v1"
                  target="_blank"
                  rel="license noopener noreferrer"
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                >
                  CC BY-NC-ND 4.0
                  <div className="flex items-center">
                    <img
                      className="h-[22px] ml-1"
                      src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1"
                      alt="CC"
                    />
                    <img
                      className="h-[22px] ml-1"
                      src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1"
                      alt="BY"
                    />
                    <img
                      className="h-[22px] ml-1"
                      src="https://mirrors.creativecommons.org/presskit/icons/nc.svg?ref=chooser-v1"
                      alt="NC"
                    />
                    <img
                      className="h-[22px] ml-1"
                      src="https://mirrors.creativecommons.org/presskit/icons/nd.svg?ref=chooser-v1"
                      alt="ND"
                    />
                  </div>
                </a>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </footer>
  );
};
