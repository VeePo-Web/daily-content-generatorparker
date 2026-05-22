import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const shippingFAQs = [
  {
    question: "When does my order ship?",
    answer: "Each item is made to order. Production takes 2-5 business days, after which your order ships immediately. You'll receive tracking as soon as it's on its way."
  },
  {
    question: "How can I track my order?",
    answer: "Once your order ships, you'll receive a confirmation email with your tracking number and direct carrier link. You can also check status anytime from your account dashboard."
  },
  {
    question: "Can I change my shipping address after ordering?",
    answer: "If your order hasn't entered production yet, contact our support team immediately at orders@lineofjudah.com. Once production has started, we cannot modify the delivery address."
  },
  {
    question: "What if my package is lost or damaged?",
    answer: "All shipments are fully insured. If your package is lost or arrives damaged, contact us within 15 days of delivery with clear photos showing the damage and the shipping label/packaging. We'll send a replacement or issue a full refund—no hassle."
  },
  {
    question: "Do you offer gift packaging?",
    answer: "Every order ships in premium branded packaging at no extra charge. If you'd like a personalized gift message included, add it during checkout."
  },
  {
    question: "What carriers do you use?",
    answer: "Domestic orders ship via USPS or FedEx depending on location. International orders ship via DHL or similar carriers with full tracking and customs documentation included."
  }
];

const ShippingFAQ = () => {
  return (
    <Accordion type="single" collapsible className="w-full">
      {shippingFAQs.map((faq, index) => (
        <AccordionItem 
          key={index} 
          value={`item-${index}`}
          className="border-b border-border"
        >
          <AccordionTrigger className="text-left font-light hover:no-underline py-4">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground font-light pb-4">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default ShippingFAQ;
