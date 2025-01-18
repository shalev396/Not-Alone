import { buttonVariants } from "@/components/ui/button";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Footer = () => {
  const navigate = useNavigate();

  const legalLinks = [
    { text: "Privacy Policy", path: "/termofservice" },
    { text: "Terms of Service", path: "/terms" },
    { text: "Contact Us", path: "/contact" },
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
          © {new Date().getFullYear()} Not Alone Support. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
