import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { buttonVariants } from "@/components/ui/button";
import { ModeToggle } from "@/components/custom-ui/mode-toggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { RouteProps } from "../types";
import { useState } from "react";
import { AuthButtons } from "../AuthButtons";

interface LandingNavProps {
  routeList: RouteProps[];
  user: any;
  navigate: (path: string) => void;
}

export const LandingNav = ({ routeList, user, navigate }: LandingNavProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky border-b-[1px] top-0 z-40 w-full bg-white dark:border-b-slate-700 dark:bg-background">
      <NavigationMenu className="mx-auto">
        <NavigationMenuList className="container h-14 px-4 w-screen flex justify-between">
          <NavigationMenuItem className="font-bold flex">
            <a
              href="/"
              className="ml-2 font-bold text-xl flex"
              rel="noreferrer noopener"
            >
              {/* <LogoIcon /> */}
              <img src="./icon.svg" alt="Logo" className="w-[30px] h-[30px]" />
              Not Alone
            </a>
          </NavigationMenuItem>

          {/* Mobile Navigation */}
          <span className="flex md:hidden">
            <ModeToggle />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger className="px-2">
                <Menu
                  className="flex md:hidden h-5 w-5"
                  onClick={() => setIsOpen(true)}
                >
                  <span className="sr-only">Menu Icon</span>
                </Menu>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle className="font-bold text-xl">
                    Not Alone
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col justify-center items-center gap-2 mt-4">
                  {routeList.map(({ href, label }) => (
                    <a
                      key={label}
                      href={href}
                      onClick={() => setIsOpen(false)}
                      className={buttonVariants({ variant: "ghost" })}
                      rel="noreferrer noopener"
                    >
                      {label}
                    </a>
                  ))}
                  <AuthButtons user={user} navigate={navigate} />
                </nav>
              </SheetContent>
            </Sheet>
          </span>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-2">
            {routeList.map((route, i) => (
              <a
                key={i}
                href={route.href}
                className={`text-[17px] ${buttonVariants({
                  variant: "ghost",
                })}`}
                rel="noreferrer noopener"
              >
                {route.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex gap-2">
            <AuthButtons user={user} navigate={navigate} />
            <ModeToggle />
          </div>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
};
