import { useEffect } from "react";
import { Mail, Package, Truck, CreditCard, Shield, CheckCircle, RotateCcw, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { ServicePageLayout, ServiceSection, InfoCard, ActionCTA, StepFlow } from "@/components/service";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const returnSteps = [
  {
    icon: Mail,
    title: "CONTACT US",
    description: "Email us with your order number and the reason for return.",
  },
  {
    icon: Package,
    title: "PACK ITEM",
    description: "Pack the item securely. Original packaging preferred but not required.",
  },
  {
    icon: Truck,
    title: "SHIP BACK",
    description: "We'll email you a prepaid shipping label (US orders).",
  },
  {
    icon: CreditCard,
    title: "REFUND",
    description: "Refund processed within 5-7 business days of receipt.",
  },
];

const heroValueProps = [
  { icon: Shield, text: "30-Day Window" },
  { icon: Package, text: "Free Return Shipping (US)" },
  { icon: CheckCircle, text: "Full Refund Guarantee" },
  { icon: RotateCcw, text: "Easy Exchanges" },
];

const quickQuestions = [
  {
    icon: Clock,
    title: "How Long Do I Have?",
    description: "30 days from delivery for returns. 15 days for damage claims.",
    variant: "default" as const,
  },
  {
    icon: Package,
    title: "Need Original Packaging?",
    description: "Preferred but not mandatory. Just pack your item securely for transit.",
    variant: "default" as const,
  },
  {
    icon: CreditCard,
    title: "When Does the Refund Hit?",
    description: "5-7 business days after we receive your return. Original payment method only.",
    variant: "accent" as const,
  },
  {
    icon: CheckCircle,
    title: "Is Return Shipping Free?",
    description: "For US orders, yes. Prepaid label included. International customers cover return shipping.",
    variant: "default" as const,
  },
];

const ReturnsExchanges = () => {
  useEffect(() => {
    document.title = "Returns & Exchanges - Line of Judah";
  }, []);

  const handleReturnSubmit = (orderNumber: string) => {
    
    // TODO: Implement return flow
  };

  return (
    <ServicePageLayout
      title="Simple Returns. No Hassle."
      subtitle="Something not right? We'll make it right. Contact us within 30 days of delivery."
      eyebrow="RETURNS & EXCHANGES"
      heroAlignment="center"
      heroValueProps={heroValueProps}
    >
      {/* StepFlow Section */}
      <div className="p-8 md:p-12 bg-stone-50 dark:bg-stone-900/30 mb-16 -mx-6 lg:mx-0">
        <h2 className="text-sm font-medium tracking-widest text-center mb-10 uppercase">
          How Returns Work
        </h2>
        <StepFlow steps={returnSteps} />
      </div>

      {/* Policy Details */}
      <ServiceSection id="policy" title="Return Policy Details">
        <Accordion type="single" collapsible className="space-y-2">
          <AccordionItem value="eligible" className="border border-border px-6">
            <AccordionTrigger className="text-left font-light py-5 hover:no-underline">
              Eligible for Return
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
              <ul className="space-y-2">
                <li>• Items purchased within the last 30 days</li>
                <li>• Unworn items with original tags attached</li>
                <li>• Items in original packaging (if applicable)</li>
                <li>• Items free from odors, stains, or damage</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="not-eligible" className="border border-border px-6">
            <AccordionTrigger className="text-left font-light py-5 hover:no-underline">
              Non-Returnable Items
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
              <ul className="space-y-2">
                <li>• Final sale items (marked as such at purchase)</li>
                <li>• Custom or personalized pieces</li>
                <li>• Items without original tags</li>
                <li>• Items showing signs of wear</li>
                <li>• Gift cards</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="international" className="border border-border px-6">
            <AccordionTrigger className="text-left font-light py-5 hover:no-underline">
              International Orders
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
              <p className="mb-4">
                International customers can return items within 30 days. Return shipping costs are the customer's responsibility—we recommend using a tracked shipping method for your protection.
              </p>
              <p>
                Duties and taxes paid at original purchase are non-refundable. Refunds are processed in the original currency.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="exchanges" className="border border-border px-6">
            <AccordionTrigger className="text-left font-light py-5 hover:no-underline">
              Size Exchanges
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
              <p className="mb-4">
                Need a different size or color? We've got you covered:
              </p>
              <ol className="space-y-2">
                <li>1. Start your return online and select "Exchange"</li>
                <li>2. Choose your preferred size or color</li>
                <li>3. We'll ship your new item as soon as we receive the return</li>
                <li>4. Free shipping on all exchanges (US only)</li>
              </ol>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="damaged" className="border border-border px-6">
            <AccordionTrigger className="text-left font-light py-5 hover:no-underline">
              Damaged or Defective Items
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
              <p className="mb-4">
                Received something damaged or defective? We'll make it right:
              </p>
              <ul className="space-y-2">
                <li>• Contact us within 15 days of delivery</li>
                <li>• Include clear photos showing the damage or defect</li>
                <li>• Photos must show the shipping label and packaging</li>
                <li>• We'll send a replacement or full refund at no cost to you</li>
                <li>• No need to return the damaged item</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ServiceSection>

      {/* Quick Questions */}
      <ServiceSection id="faq" title="Quick Answers" showDivider={false}>
        <div className="grid gap-6 md:grid-cols-2">
          {quickQuestions.map((question) => (
            <InfoCard
              key={question.title}
              icon={question.icon}
              title={question.title}
              description={question.description}
              variant={question.variant}
            />
          ))}
        </div>
      </ServiceSection>

      {/* CTA */}
      <ActionCTA
        title="Start Your Return"
        subtitle="Enter your order number and we'll email you a prepaid return label."
        alignment="center"
        showInput
        inputPlaceholder="Order number (e.g., #LOJ-12345)"
        buttonText="SUBMIT REQUEST"
        onSubmit={handleReturnSubmit}
        footerText="Questions?"
        footerLinks={[
          { text: "Check our FAQ", href: "/faq" },
          { text: "returns@lineofjudah.com", href: "mailto:returns@lineofjudah.com", isExternal: true },
        ]}
      />
    </ServicePageLayout>
  );
};

export default ReturnsExchanges;
