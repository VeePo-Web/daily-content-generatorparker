import { useEffect } from "react";
import { Link } from "react-router-dom";
import LegalPageLayout from "@/components/legal/LegalPageLayout";
import { LegalSection, ImportantCallout } from "@/components/legal/LegalSection";

const tocSections = [
  { id: "agreement", title: "Agreement to Terms" },
  { id: "license", title: "Use License" },
  { id: "products", title: "Product Information" },
  { id: "orders", title: "Orders & Payment" },
  { id: "shipping", title: "Shipping & Delivery" },
  { id: "returns", title: "Returns & Exchanges" },
  { id: "warranty", title: "Warranty & Care" },
  { id: "intellectual", title: "Intellectual Property" },
  { id: "liability", title: "Limitation of Liability" },
  { id: "privacy", title: "Privacy" },
  { id: "governing", title: "Governing Law" },
  { id: "changes", title: "Changes to Terms" },
  { id: "contact", title: "Contact" }
];

const TermsOfService = () => {
  useEffect(() => {
    document.title = "Terms of Service - Line of Judah";
  }, []);

  return (
    <LegalPageLayout
      title="Terms of Service"
      subtitle="Please read these terms carefully before using our website or services."
      lastUpdated="January 15, 2024"
      tocSections={tocSections}
    >

      <LegalSection id="agreement" title="Agreement to Terms">
        <p>
          By accessing and using the Line of Judah LLC website and services, you accept 
          and agree to be bound by the terms and provision of this agreement. These Terms 
          of Service govern your use of our website, products, and services.
        </p>
      </LegalSection>

      <LegalSection id="license" title="Use License">
        <p>
          Permission is granted to temporarily download one copy of the materials on Line of Judah 
          LLC's website for personal, non-commercial transitory viewing only. This 
          is the grant of a license, not a transfer of title, and under this license you may not:
        </p>
        <ul className="mt-4 space-y-1">
          <li>Modify or copy the materials</li>
          <li>Use the materials for any commercial purpose or for any public display</li>
          <li>Attempt to reverse engineer any software contained on the website</li>
          <li>Remove any copyright or other proprietary notations from the materials</li>
        </ul>
      </LegalSection>

      <LegalSection id="products" title="Product Information and Availability">
        <p>
          We strive to provide accurate product information, including descriptions, pricing, 
          and availability. However, we do not warrant that product descriptions or other 
          content is accurate, complete, reliable, or error-free. We reserve the right to 
          modify or discontinue products without prior notice.
        </p>
      </LegalSection>

      <LegalSection id="orders" title="Orders and Payment">
        <h4 className="text-lg font-light text-foreground mb-2 mt-4">Order Acceptance</h4>
        <p>
          All orders are subject to acceptance and availability. We reserve the right to 
          refuse or cancel any order for any reason, including but not limited to product 
          availability, errors in product information, or suspected fraud.
        </p>
        
        <h4 className="text-lg font-light text-foreground mb-2 mt-6">Payment Terms</h4>
        <p>
          Payment is due at the time of purchase. We accept major credit cards and other 
          payment methods as displayed during checkout. All prices are in USD unless 
          otherwise specified.
        </p>
      </LegalSection>

      <LegalSection id="shipping" title="Shipping and Delivery">
        <p>
          We will make every effort to ship orders within the timeframes specified. However, 
          delivery dates are estimates and we are not responsible for delays caused by 
          shipping carriers or circumstances beyond our control.
        </p>
        <p className="mt-4">
          Risk of loss and title for products pass to you upon delivery to the carrier. We 
          are not responsible for lost, stolen, or damaged packages once they have been 
          delivered to the address provided.
        </p>
      </LegalSection>

      <LegalSection id="returns" title="Returns and Exchanges">
        <p>
          We want you to be completely satisfied with your purchase. Returns and exchanges 
          are accepted within 30 days of delivery, subject to the following conditions:
        </p>
        <ul className="mt-4 space-y-1">
          <li>Items must be in original condition with tags attached</li>
          <li>Custom or personalized items are final sale</li>
          <li>Return shipping costs are the responsibility of the customer</li>
          <li>Refunds will be processed to the original payment method</li>
        </ul>
      </LegalSection>

      <LegalSection id="warranty" title="Warranty and Care">
        <p>
          Our apparel comes with a limited warranty against manufacturing defects. This 
          warranty does not cover damage from normal wear, improper care, or accidents. 
          Proper care instructions are provided with each purchase and on our website.
        </p>
      </LegalSection>

      <LegalSection id="intellectual" title="Intellectual Property">
        <p>
          All content on this website, including but not limited to text, graphics, logos, 
          images, and software, is the property of Line of Judah LLC and is protected by 
          copyright, trademark, and other intellectual property laws. Unauthorized use is 
          prohibited.
        </p>
      </LegalSection>

      <LegalSection id="liability" title="Limitation of Liability">
        <ImportantCallout>
          In no event shall Line of Judah LLC or its suppliers be liable for any damages 
          arising out of the use or inability to use the materials on our website or 
          products, even if we have been notified of the possibility of such damage.
        </ImportantCallout>
        <p className="mt-4">
          This includes, without limitation, damages for loss of data or profit, or due to 
          business interruption. Some jurisdictions do not allow limitations on implied 
          warranties or exclusions of liability for incidental damages, so these limitations 
          may not apply to you.
        </p>
      </LegalSection>

      <LegalSection id="privacy" title="Privacy Policy">
        <p>
          Your privacy is important to us. Please review our{" "}
           <Link to="/privacy-policy" className="text-champagne-600 hover:text-champagne-700 transition-colors">
            Privacy Policy
          </Link>
          , which also governs your use of our website and services, to understand our 
          practices regarding your personal information.
        </p>
      </LegalSection>

      <LegalSection id="governing" title="Governing Law">
        <p>
          These terms and conditions are governed by and construed in accordance with the 
          laws of Alberta, Canada, and you irrevocably submit to the exclusive jurisdiction 
          of the courts in that province or location.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="Changes to Terms">
        <p>
          We reserve the right to revise these Terms of Service at any time without notice. 
          By using this website, you are agreeing to be bound by the current version of 
          these Terms of Service.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact Information">
        <p>
          If you have any questions about these Terms of Service, please contact us at:
        </p>
        <div className="mt-4 space-y-1">
          <p className="text-foreground">Email: legal@lineofjudah.com</p>
          <p className="text-foreground">Website: lineofjudah.com</p>
        </div>
      </LegalSection>
    </LegalPageLayout>
  );
};

export default TermsOfService;
