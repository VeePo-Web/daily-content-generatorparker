import { useEffect } from "react";
import LegalPageLayout from "@/components/legal/LegalPageLayout";
import { LegalSection } from "@/components/legal/LegalSection";
import DataSummaryCard from "@/components/legal/DataSummaryCard";

const tocSections = [
  { id: "introduction", title: "Introduction" },
  { id: "collect", title: "Information We Collect" },
  { id: "use", title: "How We Use Your Information" },
  { id: "sharing", title: "Information Sharing" },
  { id: "security", title: "Data Security" },
  { id: "rights", title: "Your Rights" },
  { id: "cookies", title: "Cookies & Tracking" },
  { id: "changes", title: "Policy Changes" },
  { id: "contact", title: "Contact" }
];

const PrivacyPolicy = () => {
  useEffect(() => {
    document.title = "Privacy Policy - Line of Judah";
  }, []);

  return (
    <LegalPageLayout
      title="Privacy Policy"
      subtitle="Your privacy is important to us. This policy explains how we collect, use, and protect your personal information."
      lastUpdated="January 15, 2024"
      tocSections={tocSections}
    >
      {/* Data Summary Card */}
      <DataSummaryCard />

      <LegalSection id="introduction" title="Introduction">
        <p>
          At Line of Judah LLC ("we," "our," or "us"), we respect your privacy and are 
          committed to protecting your personal data. This Privacy Policy explains how we 
          collect, use, disclose, and safeguard your information when you visit our website, 
          make a purchase, or interact with our services.
        </p>
      </LegalSection>

      <LegalSection id="collect" title="Information We Collect">
        <h4 className="text-lg font-light text-foreground mb-2 mt-4">Personal Information</h4>
        <p>
          We may collect personal information that you provide directly to us, including:
        </p>
        <ul className="mt-2 space-y-1">
          <li>Name, email address, and contact information</li>
          <li>Billing and shipping addresses</li>
          <li>Payment information (processed securely through third-party providers)</li>
          <li>Account preferences and communication settings</li>
        </ul>
        
        <h4 className="text-lg font-light text-foreground mb-2 mt-6">Usage Information</h4>
        <p>
          We automatically collect certain information about your device and usage patterns, 
          including IP address, browser type, pages visited, and interaction data to improve 
          our services and user experience.
        </p>
      </LegalSection>

      <LegalSection id="use" title="How We Use Your Information">
        <p>
          We use the information we collect for various purposes, including:
        </p>
        <ul className="mt-4 space-y-1">
          <li>Processing and fulfilling your orders</li>
          <li>Providing customer support and responding to inquiries</li>
          <li>Sending promotional communications (with your consent)</li>
          <li>Improving our website functionality and user experience</li>
          <li>Preventing fraud and ensuring security</li>
          <li>Complying with legal obligations</li>
        </ul>
      </LegalSection>

      <LegalSection id="sharing" title="Information Sharing and Disclosure">
        <p>
          We do not sell, trade, or rent your personal information to third parties. We may 
          share your information only in the following circumstances:
        </p>
        <ul className="mt-4 space-y-1">
          <li>With service providers who assist us in operating our business</li>
          <li>When required by law or to protect our rights</li>
          <li>In connection with a business transaction (merger, acquisition, etc.)</li>
          <li>With your explicit consent</li>
        </ul>
      </LegalSection>

      <LegalSection id="security" title="Data Security">
        <p>
          We implement appropriate technical and organizational measures to protect your 
          personal information against unauthorized access, alteration, disclosure, or 
          destruction. However, no method of transmission over the internet or electronic 
          storage is 100% secure.
        </p>
      </LegalSection>

      <LegalSection id="rights" title="Your Rights and Choices">
        <p>
          Depending on your location, you may have certain rights regarding your personal information:
        </p>
        <ul className="mt-4 space-y-1">
          <li><strong>Access</strong> — Request a copy of your personal information</li>
          <li><strong>Correction</strong> — Update inaccurate or incomplete information</li>
          <li><strong>Deletion</strong> — Request removal of your personal information</li>
          <li><strong>Objection</strong> — Object to or restrict processing</li>
          <li><strong>Portability</strong> — Receive your data in a portable format</li>
          <li><strong>Withdrawal</strong> — Withdraw consent where applicable</li>
        </ul>
        <p className="mt-4">
          To exercise any of these rights, please contact us at privacy@lineofjudah.com.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="Cookies and Tracking">
        <p>
          We use cookies and similar tracking technologies to enhance your browsing 
          experience, analyze website traffic, and personalize content. You can control 
          cookie settings through your browser preferences, though this may affect website 
          functionality.
        </p>
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-foreground">Types of cookies we use:</h4>
          <ul className="space-y-1">
            <li><strong>Essential</strong> — Required for basic site functionality</li>
            <li><strong>Analytics</strong> — Help us understand site usage</li>
            <li><strong>Preferences</strong> — Remember your settings and choices</li>
            <li><strong>Marketing</strong> — Used to deliver relevant advertisements</li>
          </ul>
        </div>
      </LegalSection>

      <LegalSection id="changes" title="Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any 
          significant changes by posting the new policy on our website and updating the 
          "Last updated" date above.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact Us">
        <p>
          If you have any questions about this Privacy Policy or our privacy practices, 
          please contact us at:
        </p>
        <div className="mt-4 space-y-1">
          <p className="text-foreground">Email: privacy@lineofjudah.com</p>
          <p className="text-foreground">Phone: +1 (212) 555-0123</p>
          <p className="text-foreground">Address: 123 Madison Avenue, New York, NY 10016</p>
        </div>
      </LegalSection>
    </LegalPageLayout>
  );
};

export default PrivacyPolicy;
