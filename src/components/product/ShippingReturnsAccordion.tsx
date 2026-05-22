import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Truck, RotateCcw, Package } from "lucide-react";

const ShippingReturnsAccordion = () => {
  return (
    <div className="mt-6 border-t border-border">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="shipping" className="border-b border-border">
          <AccordionTrigger className="py-4 text-sm font-light text-foreground hover:no-underline hover:text-muted-foreground">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4" strokeWidth={1.5} />
              Shipping Information
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-3">
            <div className="space-y-2 text-sm font-light text-muted-foreground">
              <div className="flex justify-between">
                <span>Standard Shipping</span>
                <span className="text-foreground">5-7 business days</span>
              </div>
              <div className="flex justify-between">
                <span>Express Shipping</span>
                <span className="text-foreground">2-3 business days</span>
              </div>
              <div className="flex justify-between">
                <span>Free Shipping</span>
                <span className="text-foreground">Orders over $99</span>
              </div>
            </div>
            <p className="text-xs font-light text-muted-foreground pt-2">
              Orders placed before 2pm EST Monday-Friday ship same day.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="returns" className="border-b border-border">
          <AccordionTrigger className="py-4 text-sm font-light text-foreground hover:no-underline hover:text-muted-foreground">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" strokeWidth={1.5} />
              Returns & Exchanges
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4 space-y-3">
            <ul className="space-y-2 text-sm font-light text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-foreground">•</span>
                30-day return window for unworn items
              </li>
              <li className="flex items-start gap-2">
                <span className="text-foreground">•</span>
                Free returns on US orders
              </li>
              <li className="flex items-start gap-2">
                <span className="text-foreground">•</span>
                Exchanges available for different sizes
              </li>
              <li className="flex items-start gap-2">
                <span className="text-foreground">•</span>
                Refunds processed within 5-7 business days
              </li>
            </ul>
            <p className="text-xs font-light text-muted-foreground pt-2">
              Need help? Contact us at support@lineofjudah.com
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="packaging" className="border-b-0">
          <AccordionTrigger className="py-4 text-sm font-light text-foreground hover:no-underline hover:text-muted-foreground">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" strokeWidth={1.5} />
              Packaging & Sustainability
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <p className="text-sm font-light text-muted-foreground">
              All orders ship in 100% recycled and recyclable packaging. We use minimal, 
              plastic-free materials because our faith calls us to steward the earth well.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default ShippingReturnsAccordion;
