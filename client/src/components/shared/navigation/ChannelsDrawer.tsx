import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { RouteProps } from "./types";

interface ChannelsDrawerProps {
  channelsLinks: RouteProps[];
  navigate: (path: string) => void;
}

export const ChannelsDrawer = ({
  channelsLinks,
  navigate,
}: ChannelsDrawerProps) => {
  const hasChannels = channelsLinks.length > 0;

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="channels">
        <AccordionTrigger
          className={cn(
            "text-lg font-semibold",
            !hasChannels && "text-gray-400 cursor-not-allowed"
          )}
          disabled={!hasChannels}
        >
          Chats {!hasChannels && "" /*"No channels available"*/}
        </AccordionTrigger>
        {hasChannels && (
          <AccordionContent>
            <div className="flex flex-col gap-2 pl-4">
              {channelsLinks.map((channel) => (
                <a
                  key={channel.label}
                  onClick={() => navigate(channel.href)}
                  className="text-foreground/80 hover:text-foreground hover:bg-accent/50 rounded-md p-2 transition-colors cursor-pointer"
                >
                  {channel.label}
                </a>
              ))}
            </div>
          </AccordionContent>
        )}
      </AccordionItem>
    </Accordion>
  );
};
