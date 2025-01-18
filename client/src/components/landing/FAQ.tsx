import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqList = [
  {
    question: "How can I start donating to Lone Soldiers?",
    answer:
      "Getting started is easy! Simply create an account, browse through verified soldier requests, and choose how you'd like to help. You can donate items directly or contribute to specific needs.",
  },
  {
    question: "How do you verify Lone Soldiers' needs?",
    answer:
      "We work directly with IDF units and Lone Soldier support organizations to verify all requests. Each soldier's status and needs are authenticated before being posted on our platform.",
  },
  {
    question: "Can I donate from outside Israel?",
    answer:
      "Yes! Our platform supports international donations. You can either contribute items that will be sourced locally in Israel or coordinate shipping through our logistics network.",
  },
  {
    question: "How do I know my donation reached the soldier?",
    answer:
      "Our platform provides real-time tracking of your donation. You'll receive updates when your contribution is received and can see the impact through soldier feedback and thank-you notes.",
  },
  {
    question: "What types of donations are most needed?",
    answer:
      "Common needs include furniture for apartments, electronics for communication with family, household items, and personal care products. Soldiers can specify their exact needs through our platform.",
  },
];

export const FAQ = () => {
  return (
    <section id="faq" className="container py-24 sm:py-32">
      <h2 className="text-3xl md:text-4xl font-bold mb-4">
        Frequently Asked
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          {" "}
          Questions{" "}
        </span>
      </h2>

      <Accordion type="single" collapsible className="w-full">
        {faqList.map(({ question, answer }, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger>{question}</AccordionTrigger>
            <AccordionContent>{answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};
