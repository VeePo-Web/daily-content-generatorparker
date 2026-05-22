import { ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ProductFAQProps {
  commonQuestions?: { question: string; answer: string }[] | null;
  fitType?: string | null;
  fabricComposition?: string | null;
  careInstructions?: string | null;
}

const ProductFAQ = ({ commonQuestions, fitType, fabricComposition, careInstructions }: ProductFAQProps) => {
  // Generate default FAQs based on product data
  const defaultFAQs = [
    {
      question: "What size should I order?",
      answer: fitType === "relaxed" 
        ? "This item has a relaxed fit. If you prefer a closer fit, consider sizing down. Otherwise, order your usual size for the intended relaxed look."
        : fitType === "slim"
          ? "This item has a slim fit. If you prefer more room, consider sizing up. Otherwise, order your usual size for the intended tailored look."
          : "This item is true to size. We recommend ordering your usual size. Check our size guide for detailed measurements.",
    },
    {
      question: "How does the fabric feel?",
      answer: fabricComposition 
        ? `Made from ${fabricComposition.toLowerCase()}, this piece offers a premium hand-feel that's both durable and premium. It's been pre-washed for a broken-in feel.`
        : "Our signature cotton blend offers a durable, breathable feel that gets even better with each wash. Built to last.",
    },
    {
      question: "Will this shrink?",
      answer: careInstructions?.toLowerCase().includes("cold")
        ? "Pre-shrunk for minimal shrinkage. Follow the care instructions (wash cold, tumble dry low) to maintain the perfect fit."
        : "Minimal shrinkage when following care instructions. We recommend washing cold and tumble drying on low heat.",
    },
    {
      question: "How long will shipping take?",
      answer: "Standard shipping typically takes 5-7 business days. Express shipping (2-3 business days) is available at checkout. Orders placed before 2pm EST ship same day.",
    },
  ];

  // Merge custom questions with defaults
  const faqs = commonQuestions && commonQuestions.length > 0 
    ? [...commonQuestions, ...defaultFAQs.slice(commonQuestions.length)]
    : defaultFAQs;

  return (
    <div className="mt-6 border-t border-border pt-4">
      <p className="text-xs font-light text-muted-foreground uppercase tracking-wider mb-3">
        Common Questions
      </p>
      <Accordion type="single" collapsible className="w-full">
        {faqs.slice(0, 4).map((faq, index) => (
          <AccordionItem key={index} value={`faq-${index}`} className="border-b border-border/50">
            <AccordionTrigger className="py-3 text-sm font-light text-foreground hover:no-underline hover:text-muted-foreground [&[data-state=open]>svg]:rotate-180">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="pb-3 text-sm font-light text-muted-foreground leading-relaxed">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default ProductFAQ;
