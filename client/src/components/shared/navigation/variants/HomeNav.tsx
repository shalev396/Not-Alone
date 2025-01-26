import { RouteProps } from "../types";
import { SideNavLayout } from "../layouts/SideNavLayout";
import { ChannelsDrawer } from "../ChannelsDrawer";

interface HomeNavProps {
  routeList: RouteProps[];
  channelsLinks: RouteProps[];
  navigate: (path: string) => void;
  accordionOpen: boolean;
  setAccordionOpen: (value: boolean) => void;
  isAccordion: boolean;
  isVertical: boolean;
}

export const HomeNav = ({
  routeList,
  channelsLinks,
  navigate,
  accordionOpen,
  setAccordionOpen,
  isAccordion,
  isVertical,
}: HomeNavProps) => {
  const renderContent = () => (
    <nav className="flex flex-col gap-4">
      <ChannelsDrawer channelsLinks={channelsLinks} navigate={navigate} />
      {routeList.map((route) => (
        <a
          key={route.label}
          onClick={() => navigate(route.href)}
          className={`text-foreground/80 hover:text-foreground hover:bg-accent/50 rounded-md p-2 transition-colors cursor-pointer ${
            route.href === "/logout"
              ? "mt-auto text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
              : ""
          }`}
        >
          {route.label}
        </a>
      ))}
    </nav>
  );

  return (
    <SideNavLayout
      accordionOpen={accordionOpen}
      setAccordionOpen={setAccordionOpen}
      isAccordion={isAccordion}
      isVertical={isVertical}
      renderContent={renderContent}
    />
  );
};
