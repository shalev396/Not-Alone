import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"; // Certifique-se de usar o componente de acordo com a documentação do Shadcn.
import { rightsData, Right } from "@/data/rightsData";
import { Navbar } from "@/components/shared/Navbar";

const RightsPage: React.FC = () => {
  // Agrupar direitos por categoria
  const groupedRights = rightsData.reduce<Record<string, Right[]>>(
    (acc, right) => {
      if (!acc[right.category]) {
        acc[right.category] = [];
      }
      acc[right.category].push(right);
      return acc;
    },
    {}
  );

  return (
    <div className="flex bg-background text-foreground min-h-screen">
      <Navbar modes="home" isVertical={true} isAccordion={true} />
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-4xl font-bold mb-8 text-center">
            Your{" "}
            <span className="bg-gradient-to-r from-[#F596D3] to-[#D247BF] text-transparent bg-clip-text">
              Rights
            </span>
          </h1>
          {Object.keys(groupedRights).length > 0 ? (
            <Accordion type="multiple" className="w-full max-w-4xl space-y-4">
              {Object.entries(groupedRights).map(([category, rights]) => (
                <AccordionItem
                  key={category}
                  value={`category-${category}`}
                  className="border rounded-lg overflow-hidden"
                >
                  <AccordionTrigger className="bg-card p-4 flex justify-between items-center cursor-pointer hover:bg-accent transition-colors">
                    <span className="font-medium text-lg text-left">
                      {category}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="bg-background p-4 space-y-4">
                    {rights.map((right) => (
                      <div
                        key={right.id}
                        className="border-b pb-2 mb-2 last:border-none last:pb-0 last:mb-0"
                      >
                        <h3 className="font-medium text-lg mb-1">
                          {right.title}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {right.description}
                        </p>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="flex flex-col items-center">
              <Accordion type="single" collapsible className="w-full max-w-md">
                <AccordionItem
                  value="no-rights"
                  className="border rounded-lg overflow-hidden"
                >
                  <AccordionTrigger className="bg-card p-4 text-center">
                    <span className="font-medium text-lg">
                      No Rights Available
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="bg-background p-4 text-muted-foreground text-center">
                    No rights have been registered yet. <br />
                    😔
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}
          <div className="mt-12 text-center text-sm text-muted-foreground max-w-2xl mx-auto border-t border-border pt-4">
            <p>
              <strong>Disclaimer:</strong> While we strive to provide accurate
              and updated information, we cannot guarantee the rights listed
              here are the most current. Please refer to the official IDF
              website for the latest information:{" "}
              <a
                href="https://www.idf.il/%D7%94%D7%A9%D7%99%D7%A8%D7%95%D7%AA-%D7%A9%D7%9C%D7%99/%D7%AA%D7%A0%D7%90%D7%99-%D7%94%D7%A9%D7%99%D7%A8%D7%95%D7%AA-%D7%91%D7%A6%D7%94-%D7%9C/%D7%AA-%D7%A9/rights-of-lone-soldiers-in-mandatory-service/"
                className="text-transparent bg-gradient-to-r from-[#F596D3] to-[#D247BF] bg-clip-text hover:opacity-80 transition-opacity"
                target="_blank"
                rel="noopener noreferrer"
              >
                IDF Official Lone Soldier Rights
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightsPage;
