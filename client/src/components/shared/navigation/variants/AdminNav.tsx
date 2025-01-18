import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AdminRouteSection, RouteProps } from "../types";
import { SideNavLayout } from "../layouts/SideNavLayout";
import { ChannelsDrawer } from "../ChannelsDrawer";

interface AdminNavProps {
  routeList: AdminRouteSection[];
  channelsLinks: RouteProps[];
  navigate: (path: string) => void;
  accordionOpen: boolean;
  setAccordionOpen: (value: boolean) => void;
  isAccordion: boolean;
  isVertical: boolean;
}

export const AdminNav = ({
  routeList,
  channelsLinks,
  navigate,
  accordionOpen,
  setAccordionOpen,
  isAccordion,
  isVertical,
}: AdminNavProps) => {
  const renderAdminNav = () => (
    <nav className="flex flex-col gap-4">
      <ChannelsDrawer channelsLinks={channelsLinks} navigate={navigate} />
      <Accordion type="single" collapsible className="w-full">
        {routeList.map((item) => {
          if (item.section && item.routes) {
            return (
              <AccordionItem value={item.section} key={item.section}>
                <AccordionTrigger className="text-lg font-semibold">
                  {item.section}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-2 pl-4">
                    {item.routes.map((route) => (
                      <a
                        key={route.label}
                        onClick={() => route.href && navigate(route.href)}
                        className="text-foreground/80 hover:text-foreground hover:bg-accent/50 rounded-md p-2 transition-colors cursor-pointer"
                      >
                        {route.label}
                      </a>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          } else if (item.href && item.label) {
            return (
              <button
                key={item.label}
                onClick={() => item.href && navigate(item.href)}
                className="flex flex-1 items-center justify-between py-4 text-lg font-semibold transition-all hover:underline [&[data-state=open]>svg]:rotate-180"
              >
                {item.label}
              </button>
            );
          }
          return null;
        })}
      </Accordion>
    </nav>
  );

  return (
    <SideNavLayout
      accordionOpen={accordionOpen}
      setAccordionOpen={setAccordionOpen}
      isAccordion={isAccordion}
      isVertical={isVertical}
      renderContent={renderAdminNav}
    />
  );
};
