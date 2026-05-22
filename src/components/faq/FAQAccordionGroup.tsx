import { FAQItem } from "@/pages/FAQ";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQAccordionGroupProps {
  items: FAQItem[];
  searchQuery?: string;
}

const highlightText = (text: string, query: string) => {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${query})`, "gi");
  const parts = text.split(regex);
  
  return parts.map((part, i) => 
    regex.test(part) ? (
      <mark key={i} className="bg-champagne-200 dark:bg-champagne-800 px-0.5 rounded">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

const FAQAccordionGroup = ({ items, searchQuery = "" }: FAQAccordionGroupProps) => {
  return (
    <Accordion type="single" collapsible className="space-y-3 md:space-y-2">
      {items.map((item) => (
        <AccordionItem 
          key={item.id}
          id={item.id}
          value={item.id}
          className="border border-border px-6 data-[state=open]:bg-stone-900/50 active:bg-stone-900/30"
        >
          <AccordionTrigger className="text-left font-light py-6 md:py-5 hover:no-underline gap-4">
            <span className="pr-6 md:pr-4">
              {highlightText(item.question, searchQuery)}
            </span>
          </AccordionTrigger>
          <AccordionContent className="text-base md:text-sm text-muted-foreground font-light leading-relaxed pb-6">
            {highlightText(item.answer, searchQuery)}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default FAQAccordionGroup;
