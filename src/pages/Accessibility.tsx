import { useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Shield, 
  Keyboard, 
  Volume2, 
  CirclePause, 
  Palette, 
  Focus,
  Image as ImageIcon,
  Monitor,
  ZoomIn,
  Mic,
  Users,
  Link as LinkIcon,
  CheckCircle,
  ExternalLink,
  ArrowRight,
  FlaskConical,
  UserCheck,
  Bot
} from "lucide-react";
import ServicePageLayout from "@/components/service/ServicePageLayout";
import ServiceSection from "@/components/service/ServiceSection";
import InfoCard from "@/components/service/InfoCard";
import ActionCTA from "@/components/service/ActionCTA";
import StepFlow from "@/components/service/StepFlow";
import DeclarationBlock from "@/components/accessibility/DeclarationBlock";
import KeyboardShortcuts from "@/components/accessibility/KeyboardShortcuts";
import AccessibleToolsGrid from "@/components/accessibility/AccessibleToolsGrid";
import AccessibilityFeedback from "@/components/accessibility/AccessibilityFeedback";

// Hero value props
const heroValueProps = [
  { icon: Shield, text: "WCAG 2.1 AA" },
  { icon: Keyboard, text: "Keyboard First" },
  { icon: Volume2, text: "Screen Reader Ready" },
  { icon: CirclePause, text: "Motion Respect" }
];

// Access features data - emerald icons for compliance
const accessFeatures = [
  {
    icon: Keyboard,
    title: "KEYBOARD NAVIGATION",
    description: "Every interactive element accessible via Tab, Enter, Escape. Logical flow throughout the entire site."
  },
  {
    icon: Volume2,
    title: "SCREEN READER READY",
    description: "Semantic HTML. ARIA labels. Content announced correctly by all major screen readers."
  },
  {
    icon: Palette,
    title: "COLOR CONTRAST",
    description: "All text meets WCAG AA contrast ratios. Readable in bright light or dark mode."
  },
  {
    icon: Focus,
    title: "FOCUS INDICATORS",
    description: "Visible outlines on all interactive elements. Never hidden or suppressed."
  },
  {
    icon: CirclePause,
    title: "MOTION RESPECT",
    description: "Animations honor prefers-reduced-motion. No forced movement or parallax effects."
  },
  {
    icon: ImageIcon,
    title: "MEANINGFUL IMAGES",
    description: "Alt text on all product and content images. Decorative items properly labeled."
  }
];

// Technology compatibility data - blue icons for compatibility
const techCompatibility = [
  {
    icon: Monitor,
    title: "SCREEN READERS",
    description: "NVDA, JAWS, VoiceOver — tested and fully compatible."
  },
  {
    icon: ZoomIn,
    title: "MAGNIFICATION",
    description: "Screen magnification software supported. Responsive layouts at all zoom levels."
  },
  {
    icon: Mic,
    title: "VOICE CONTROL",
    description: "Speech recognition software compatible for full navigation."
  },
  {
    icon: Keyboard,
    title: "KEYBOARD-ONLY",
    description: "Complete site functionality without requiring a mouse."
  }
];

// Known limitations data - stone icons for WIP
const knownLimitations = [
  {
    icon: Users,
    title: "COMMUNITY CONTENT",
    description: "Customer reviews may lack accessibility. We moderate content and add alternatives where possible."
  },
  {
    icon: LinkIcon,
    title: "THIRD-PARTY TOOLS",
    description: "Payment and analytics partners may have their own limitations. We audit partners for compliance."
  }
];

// How We Test steps
const testingSteps = [
  {
    icon: Bot,
    title: "AUTOMATED SCANS",
    description: "Weekly Lighthouse and axe-core scans on all pages"
  },
  {
    icon: UserCheck,
    title: "MANUAL AUDITS",
    description: "Quarterly testing by human auditors with assistive tech"
  },
  {
    icon: FlaskConical,
    title: "USER TESTING",
    description: "Biannual sessions with community members with disabilities"
  }
];

// Compliance Strip Component
const ComplianceStrip = () => (
  <div className="bg-stone-100 dark:bg-stone-900 p-4 mb-12 flex items-center justify-center gap-3 flex-wrap text-center border border-foreground/20">
    <div className="flex items-center gap-2">
      {/* Pulsing status indicator */}
      <span className="relative inline-flex rounded-full h-2 w-2 bg-foreground" />
      <CheckCircle className="w-4 h-4 text-foreground" strokeWidth={1.5} aria-hidden="true" />
      <span className="text-sm font-medium">WCAG 2.1 AA CONFORMANCE</span>
    </div>
    <span className="text-muted-foreground hidden sm:inline">—</span>
    <span className="text-sm text-muted-foreground">Audited January 2025</span>
    <span className="text-muted-foreground hidden sm:inline">—</span>
    <a 
      href="#" 
      className="text-sm text-champagne-600 hover:text-champagne-700 inline-flex items-center gap-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-champagne-500 focus-visible:ring-offset-2"
      aria-label="View full accessibility conformance report (opens in new tab)"
    >
      View Full Report
      <ExternalLink className="w-3 h-3" aria-hidden="true" />
    </a>
  </div>
);

const Accessibility = () => {
  useEffect(() => {
    document.title = "Accessibility - Line of Judah";
  }, []);

  const handleContactClick = () => {
    window.location.href = 'mailto:accessibility@lineofjudah.com?subject=Accessibility%20Inquiry';
  };

  return (
    <ServicePageLayout
      title="Accessible to Everyone."
      subtitle="We're committed to making our site usable for all visitors. WCAG 2.1 AA compliant."
      eyebrow="ACCESSIBILITY"
      heroAlignment="center"
      heroValueProps={heroValueProps}
    >
      {/* Skip to main content link for keyboard users */}
      <a 
        href="#main-accessibility-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-background focus:px-4 focus:py-2 focus:border focus:border-foreground"
      >
        Skip to main content
      </a>

      <ComplianceStrip />

      {/* Declaration Block - Editorial Hook */}
      <DeclarationBlock
        quote="Access to our products should never be limited by ability or technology."
        attribution="— Our Commitment"
      />

      <div id="main-accessibility-content">
        {/* Our Commitment */}
        <ServiceSection id="commitment" title="Our Commitment">
          <p className="text-muted-foreground font-light leading-relaxed">
            Line of Judah is committed to ensuring digital accessibility for everyone. We believe 
            that access to our products should never be limited by ability or technology. Our site 
            is built with accessibility as a foundation, not an afterthought.
          </p>
          <p className="text-muted-foreground font-light leading-relaxed mt-4">
            We continuously work to improve the accessibility of our website and mobile experience, 
            following the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA as our standard.
          </p>
        </ServiceSection>

        {/* Accessibility Features */}
        <ServiceSection id="features" title="Accessibility Features">
          <p className="text-muted-foreground font-light mb-6">
            Built-in accessibility from the ground up:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accessFeatures.map((feature) => (
              <InfoCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                iconColor="stone"
              />
            ))}
          </div>
        </ServiceSection>

        {/* How We Test */}
        <ServiceSection id="testing" title="How We Test">
          <p className="text-muted-foreground font-light mb-8">
            Accessibility is an ongoing commitment, not a one-time checkbox:
          </p>
          <StepFlow steps={testingSteps} variant="compact" />
        </ServiceSection>

        {/* Assistive Technology Support */}
        <ServiceSection id="technology" title="Assistive Technology Support">
          <p className="text-muted-foreground font-light mb-6">
            Compatible with major assistive technologies:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {techCompatibility.map((tech) => (
              <InfoCard
                key={tech.title}
                icon={tech.icon}
                title={tech.title}
                description={tech.description}
                iconColor="blue"
              />
            ))}
          </div>
        </ServiceSection>

        {/* Known Limitations */}
        <ServiceSection id="limitations" title="Known Limitations">
          <p className="text-muted-foreground font-light mb-6">
            Areas we're actively improving:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {knownLimitations.map((limitation) => (
              <InfoCard
                key={limitation.title}
                icon={limitation.icon}
                title={limitation.title}
                description={limitation.description}
                variant="muted"
                iconColor="stone"
              />
            ))}
          </div>
        </ServiceSection>

        {/* Accessible Shopping Tools */}
        <ServiceSection id="tools" title="Accessible Shopping Tools">
          <p className="text-muted-foreground font-light mb-6">
            Tools designed for inclusive shopping:
          </p>
          <AccessibleToolsGrid />
        </ServiceSection>

        {/* Keyboard Shortcuts Reference */}
        <ServiceSection id="shortcuts" title="Keyboard Navigation">
          <KeyboardShortcuts />
        </ServiceSection>

        {/* Report a Barrier */}
        <ServiceSection id="feedback" title="Report an Accessibility Issue">
          <p className="text-muted-foreground font-light mb-6">
            Encountered an obstacle? Let us know. We respond within 48 hours.
          </p>
          <AccessibilityFeedback />
        </ServiceSection>

        {/* Try-On Room CTA */}
        <div className="mb-16">
          <InfoCard
            icon={Monitor}
            title="Accessible Try-On Experience"
            description={
              <div className="space-y-3">
                <p>Our virtual try-on room is keyboard navigable and screen reader compatible.</p>
                {/* Try-On Room link hidden until feature is ready */}
              </div>
            }
            variant="accent"
          />
        </div>
      </div>

      {/* Contact CTA */}
      <ActionCTA
        title="Contact Our Accessibility Team"
        subtitle="For immediate assistance with accessibility concerns, we respond within 2 business days."
        buttonText="EMAIL ACCESSIBILITY TEAM"
        onSubmit={handleContactClick}
        footerText="Or contact us directly:"
        footerLinks={[
          { text: "accessibility@lineofjudah.com", href: "mailto:accessibility@lineofjudah.com?subject=Accessibility%20Inquiry", isExternal: true },
          { text: "+1 (212) 555-0123", href: "tel:+12125550123", isExternal: true }
        ]}
      />
    </ServicePageLayout>
  );
};

export default Accessibility;
