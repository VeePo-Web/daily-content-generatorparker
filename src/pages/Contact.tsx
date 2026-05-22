import { Clock, Calendar, Zap, MessageCircle, Mail, Phone, MessageSquare, Instagram, ExternalLink, Package, Ruler, RotateCcw, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import ServicePageLayout from "@/components/service/ServicePageLayout";
import ServiceSection from "@/components/service/ServiceSection";
import InfoCard from "@/components/service/InfoCard";
import ActionCTA from "@/components/service/ActionCTA";
import DeclarationBlock from "@/components/accessibility/DeclarationBlock";
import ResponseCommitment from "@/components/contact/ResponseCommitment";
import OperatingHours from "@/components/contact/OperatingHours";
import ContactForm from "@/components/contact/ContactForm";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";

const heroValueProps = [
  { icon: Clock, text: "24h Response" },
  { icon: Calendar, text: "Mon–Sat Coverage" },
  { icon: Zap, text: "Order Priority" },
  { icon: MessageCircle, text: "Multi-Channel" },
];

const contactChannels = [
  {
    title: "EMAIL",
    description: "Best for detailed inquiries. Attach images, order info, or anything that helps us help you faster.",
    icon: Mail,
    iconColor: "emerald" as const,
    action: {
      label: "hello@lineofjudah.com",
      href: "mailto:hello@lineofjudah.com",
    },
  },
  {
    title: "PHONE",
    description: "Speak directly with our team. Best for urgent order issues or complex questions.",
    icon: Phone,
    iconColor: "blue" as const,
    action: {
      label: "+1 (212) 555-0123",
      href: "tel:+12125550123",
    },
  },
  {
    title: "LIVE CHAT",
    description: "Real-time support during business hours. Perfect for quick questions.",
    icon: MessageSquare,
    iconColor: "emerald" as const,
    action: {
      label: "Start Chat",
      onClick: true,
    },
  },
  {
    title: "SOCIAL",
    description: "DM us on Instagram for style advice, product questions, or just to connect.",
    icon: Instagram,
    iconColor: "blue" as const,
    action: {
      label: "@lineofjudah",
      href: "https://instagram.com/lineofjudah",
      external: true,
    },
  },
];

const priorityHotlines = [
  {
    subject: "Order Status",
    email: "orders@lineofjudah.com",
    response: "4-8 hours",
  },
  {
    subject: "Returns & Exchanges",
    email: "returns@lineofjudah.com",
    response: "24 hours",
  },
  {
    subject: "Size & Fit Help",
    email: "fit@lineofjudah.com",
    response: "12 hours",
  },
  {
    subject: "Accessibility",
    email: "accessibility@lineofjudah.com",
    response: "24 hours",
  },
  {
    subject: "Partnership / Press",
    email: "press@lineofjudah.com",
    response: "48-72 hours",
  },
];

const selfServiceTools = [
  {
    icon: Package,
    title: "ORDER TRACKING",
    description: "Check real-time status of your shipment and get tracking updates.",
    link: "/account/orders",
  },
  {
    icon: Ruler,
    title: "SIZE GUIDE",
    description: "Detailed measurements and fit notes for every product.",
    link: "/about/size-guide",
  },
  {
    icon: RotateCcw,
    title: "RETURNS PORTAL",
    description: "Start a return or exchange in under 2 minutes.",
    link: "/returns",
  },
  {
    icon: HelpCircle,
    title: "FAQ",
    description: "Answers to the questions we hear most often.",
    link: "/faq",
  },
];

const quickFAQs = [
  {
    id: "shipping",
    question: "What are your shipping options and timeframes?",
    answer: "Standard (5-9 business days, FREE over $99), Express (2-3 business days, $15), Overnight (next business day, $35). Designed in Calgary, shipped across Canada and beyond. All orders include tracking and insurance.",
  },
  {
    id: "returns",
    question: "What's your return and exchange policy?",
    answer: "30-day satisfaction guarantee on unworn items with original tags attached. Free return shipping on US orders. Custom pieces and items marked Final Sale are non-returnable. Exchanges processed within 3-5 business days of receiving your return.",
  },
  {
    id: "sizing",
    question: "How do I find my size?",
    answer: "Check our Size Guide for detailed measurements on every product. Each item includes model info (height, size worn). For personalized recommendations, use our AI Fit Finder in the Try-On Room or email fit@lineofjudah.com.",
  },
  {
    id: "tracking",
    question: "Can I track my order?",
    answer: "Yes. Tracking activates within 24-48 hours of order confirmation. You'll receive an email with tracking link, or check Account → Orders anytime. We ship via USPS, UPS, and FedEx depending on destination.",
  },
  {
    id: "gifting",
    question: "Do you offer gift wrapping?",
    answer: "We don't offer gift wrapping currently, but all orders ship in premium branded packaging suitable for gifting. Gift receipts are available at checkout—just check the box.",
  },
  {
    id: "ambassador",
    question: "How do I become an Ambassador?",
    answer: "Apply at our Ambassador page. We review applications monthly and look for community members who share our values and create authentic content. Ambassadors get early access, exclusive discounts, and commission on referrals.",
  },
];

const Contact = () => {
  const { toast } = useToast();
  
  const handleChatClick = () => {
    toast({
      title: "Live Chat",
      description: "Live chat is available Mon-Fri 9am-6pm ET. Check back during business hours.",
    });
  };
  
  return (
    <ServicePageLayout
      title="We're Here When You Need Us."
      subtitle="Questions answered within 24 hours. Order issues prioritized same-day."
      eyebrow="CUSTOMER SUPPORT"
      heroValueProps={heroValueProps}
      heroAlignment="center"
      showSidebar={true}
      showNewsletter={true}
    >
      {/* Response Commitment Strip */}
      <ResponseCommitment />
      
      {/* Declaration */}
      <div className="mt-12">
        <DeclarationBlock
          quote="Every message is read by a real person. We believe you deserve better than automated responses."
          attribution="— Our Promise"
        />
      </div>
      
      {/* Communication Channels */}
      <ServiceSection
        id="channels"
        title="Communication Channels"
        subtitle="Choose your preferred method. All roads lead to the same dedicated team."
        className="mt-16"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contactChannels.map((channel) => (
            <InfoCard
              key={channel.title}
              title={channel.title}
              description={channel.description}
              icon={channel.icon}
              iconColor={channel.iconColor}
            >
              {channel.action.onClick ? (
                <button
                  onClick={handleChatClick}
                   className="inline-flex items-center gap-2 text-sm font-medium text-champagne-600 hover:text-champagne-700 transition-colors mt-4"
                >
                  {channel.action.label}
                </button>
              ) : channel.action.external ? (
                <a
                  href={channel.action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                   className="inline-flex items-center gap-2 text-sm font-medium text-champagne-600 hover:text-champagne-700 transition-colors mt-4"
                >
                  {channel.action.label}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <a
                  href={channel.action.href}
                  className="inline-flex items-center gap-2 text-sm font-medium text-champagne-600 hover:text-champagne-700 transition-colors mt-4"
                >
                  {channel.action.label}
                </a>
              )}
            </InfoCard>
          ))}
        </div>
      </ServiceSection>
      
      {/* Priority Hotlines */}
      <ServiceSection
        id="priority-hotlines"
        title="Priority Hotlines"
        subtitle="For specialized support, email directly with pre-formatted subject lines for faster routing."
        className="mt-16"
      >
        <div className="border border-border divide-y divide-border">
          {priorityHotlines.map((hotline) => (
            <div 
              key={hotline.subject}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="mb-2 sm:mb-0">
                <h4 className="font-medium">{hotline.subject}</h4>
                <a 
                  href={`mailto:${hotline.email}?subject=${encodeURIComponent(hotline.subject)}`}
                  className="text-sm text-champagne-600 hover:text-champagne-700 transition-colors"
                >
                  {hotline.email}
                </a>
              </div>
              <div className="text-sm text-muted-foreground">
                Response: <span className="text-foreground font-medium">{hotline.response}</span>
              </div>
            </div>
          ))}
        </div>
      </ServiceSection>
      
      {/* Self-Service Tools */}
      <ServiceSection
        id="self-service"
        title="Self-Service Tools"
        subtitle="Handle common tasks yourself—faster than waiting for a response."
        className="mt-16"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {selfServiceTools.map((tool) => (
            <Link key={tool.title} to={tool.link} className="block group">
              <InfoCard
                title={tool.title}
                description={tool.description}
                icon={tool.icon}
                iconColor="emerald"
              >
                <span className="inline-flex items-center gap-1 text-sm font-medium text-champagne-600 group-hover:text-champagne-700 transition-colors mt-4">
                  Open Tool
                  <ExternalLink className="w-3 h-3" />
                </span>
              </InfoCard>
            </Link>
          ))}
        </div>
      </ServiceSection>
      
      {/* Common Questions FAQ */}
      <ServiceSection
        id="common-questions"
        title="Common Questions"
        subtitle="Answers to the questions we hear most often."
        className="mt-16"
      >
        <Accordion type="single" collapsible className="space-y-3">
          {quickFAQs.map((faq) => (
            <AccordionItem 
              key={faq.id} 
              value={faq.id} 
              className="border border-border px-6 bg-background hover:bg-muted/30 transition-colors"
            >
              <AccordionTrigger className="text-left hover:no-underline py-4">
                <span className="font-medium">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-6 text-center">
          <Link 
            to="/faq" 
            className="inline-flex items-center gap-2 text-sm font-medium text-champagne-600 hover:text-champagne-700 transition-colors"
          >
            View All FAQs
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </ServiceSection>
      
      {/* Operating Hours */}
      <ServiceSection
        id="hours"
        title="Operating Hours"
        subtitle="When each channel is staffed and ready."
        className="mt-16"
      >
        <div className="border border-border">
          <OperatingHours />
        </div>
      </ServiceSection>
      
      {/* Contact Form */}
      <ServiceSection
        id="form"
        title="Send a Message"
        subtitle="Fill out the form below and we'll route your message to the right team member."
        className="mt-16"
      >
        <div className="max-w-2xl">
          <ContactForm />
        </div>
      </ServiceSection>
      
      {/* Our Office */}
      <ServiceSection
        id="office"
        title="Our Office"
        subtitle="Where we work."
        className="mt-16"
      >
        <div className="p-6 bg-muted/50 border border-border">
          <address className="not-italic space-y-1 text-sm">
            <p className="font-medium">Line of Judah, Inc.</p>
            <p className="text-muted-foreground">123 Faith Street, Suite 400</p>
            <p className="text-muted-foreground">Los Angeles, CA 90001</p>
            <p className="text-muted-foreground">United States</p>
          </address>
          <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
            This is not a retail location. For product pickups or returns, please contact us first.
          </p>
        </div>
      </ServiceSection>
      
      {/* Urgent CTA */}
      <div className="mt-16">
        <ActionCTA
          title="Need Immediate Assistance?"
          subtitle="For time-sensitive order issues, call our hotline directly."
          buttonText="Call Now"
          alignment="center"
          footerLinks={[
            { text: "+1 (212) 555-0123", href: "tel:+12125550123" },
            { text: "Mon-Sat 9am-6pm ET", href: "#hours" },
          ]}
        />
      </div>
    </ServicePageLayout>
  );
};

export default Contact;