import { Menu, X } from "lucide-react";
import { ModeToggle } from "@/components/custom-ui/mode-toggle";

interface SideNavLayoutProps {
  accordionOpen: boolean;
  setAccordionOpen: (value: boolean) => void;
  isAccordion: boolean;
  isVertical: boolean;
  renderContent: () => JSX.Element;
}

export const SideNavLayout = ({
  accordionOpen,
  setAccordionOpen,
  isAccordion,
  isVertical,
  renderContent,
}: SideNavLayoutProps) => {
  return (
    <>
      {isAccordion && (
        <button
          className="fixed top-3 left-4 z-50 bg-gradient-to-r from-primary/60 to-primary text-white p-2 rounded-md shadow-md hover:opacity-90 transition-opacity"
          onClick={() => setAccordionOpen(!accordionOpen)}
        >
          {accordionOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      )}
      {isVertical && (
        <aside
          className={`flex flex-col min-h-screen h-full bg-background border-r border-border fixed top-0 z-40 shadow-lg transition-all duration-300 ${
            accordionOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full"
          }`}
        >
          <div className="flex-none p-4 border-b border-border">
            <h1 className="font-bold text-xl text-center flex-1">
              <span className="bg-gradient-to-r from-primary/60 to-primary text-transparent bg-clip-text">
                Not Alone
              </span>
            </h1>
          </div>

          <div className="flex-1 overflow-y-auto p-4">{renderContent()}</div>

          <div className="flex-none p-4 border-t border-border">
            <ModeToggle />
          </div>
        </aside>
      )}

      {accordionOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          onClick={() => setAccordionOpen(false)}
        />
      )}
    </>
  );
};
