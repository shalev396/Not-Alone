import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { rightsData, Right } from "@/data/rightsData";
import { Navbar } from "@/components/shared/Navbar";
import { Card } from "@/components/ui/card";

const RightsPage: React.FC = () => {
  // Group rights by category
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
      <div className="flex-1 p-6 pl-[72px] sm:pl-20 md:pl-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-center">
              <span className="bg-gradient-to-r from-primary/60 to-primary text-transparent bg-clip-text">
                Your Rights as a Lone Soldier
              </span>
            </h1>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto">
              Understanding your rights is crucial. Below you'll find a
              comprehensive guide to the benefits and support available to you.
            </p>

            <Card className="p-6">
              {Object.keys(groupedRights).length > 0 ? (
                <Accordion type="multiple" className="space-y-4">
                  {Object.entries(groupedRights).map(([category, rights]) => (
                    <AccordionItem
                      key={category}
                      value={`category-${category}`}
                      className="border rounded-lg overflow-hidden"
                    >
                      <AccordionTrigger className="bg-card px-4 py-3 hover:bg-accent/50 transition-colors">
                        <span className="font-semibold text-lg bg-gradient-to-r from-primary/80 to-primary text-transparent bg-clip-text">
                          {category}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="bg-background px-4 py-3 space-y-4">
                        {rights.map((right) => (
                          <div
                            key={right.id}
                            className="border-b border-border pb-4 last:border-0 last:pb-0"
                          >
                            <h3 className="font-medium text-lg mb-2">
                              {right.title}
                            </h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              {right.description}
                            </p>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No rights information available at the moment.
                  </p>
                </div>
              )}
            </Card>

            <div className="mt-8 text-sm text-muted-foreground">
              <Card className="p-4 bg-card/50">
                <p className="text-center space-y-2">
                  <span className="font-semibold block text-base mb-2">
                    Important Notice
                  </span>
                  While we strive to provide accurate and up-to-date
                  information, please refer to the official IDF website for the
                  most current details:{" "}
                  <a
                    href="https://www.idf.il/%D7%94%D7%A9%D7%99%D7%A8%D7%95%D7%AA-%D7%A9%D7%9C%D7%99/%D7%AA%D7%A0%D7%90%D7%99-%D7%94%D7%A9%D7%99%D7%A8%D7%95%D7%AA-%D7%91%D7%A6%D7%94-%D7%9C/%D7%AA-%D7%A9/rights-of-lone-soldiers-in-mandatory-service/"
                    className="inline-block bg-gradient-to-r from-primary/60 to-primary text-transparent bg-clip-text hover:opacity-80 transition-opacity font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    IDF Lone Soldiers Rights & Benefits
                  </a>
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightsPage;
