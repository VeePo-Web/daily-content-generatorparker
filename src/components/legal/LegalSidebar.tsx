import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  HelpCircle, 
  Truck, 
  RotateCcw, 
  FileText, 
  Shield, 
  Accessibility,
  Link2
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export interface TOCSection {
  id: string;
  title: string;
}

interface LegalSidebarProps {
  tocSections?: TOCSection[];
}

const legalPages = [
  { name: "FAQ", path: "/faq", icon: HelpCircle },
  { name: "Shipping", path: "/shipping", icon: Truck },
  { name: "Returns & Exchanges", path: "/returns", icon: RotateCcw },
  { name: "Terms of Service", path: "/terms-of-service", icon: FileText },
  { name: "Privacy Policy", path: "/privacy-policy", icon: Shield },
  { name: "Accessibility", path: "/accessibility", icon: Accessibility as typeof HelpCircle },
];

const LegalSidebar = ({ tocSections }: LegalSidebarProps) => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<string>("");

  // IntersectionObserver for active section tracking
  useEffect(() => {
    if (!tocSections || tocSections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0% -80% 0%" }
    );

    tocSections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [tocSections]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const copyLink = (id: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url);
  };

  return (
    <nav className="sticky top-28">
      {/* Site-wide legal navigation */}
      <h3 className="text-xs font-medium tracking-widest text-muted-foreground mb-6">
        HELP & LEGAL
      </h3>
      <ul className="space-y-1">
        {legalPages.map((page) => {
          const isActive = location.pathname === page.path;
          const Icon = page.icon;
          
          return (
            <li key={page.path}>
              <Link
                to={page.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm font-light transition-colors rounded-none border-l-2",
                  isActive 
                    ? "border-champagne-500 bg-champagne-500/5 text-foreground" 
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-stone-300"
                )}
              >
                <Icon className="w-4 h-4" strokeWidth={1.5} />
                {page.name}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Page-specific TOC */}
      {tocSections && tocSections.length > 0 && (
        <>
          <Separator className="my-8" />
          <h3 className="text-xs font-medium tracking-widest text-muted-foreground mb-4">
            ON THIS PAGE
          </h3>
          <ul className="space-y-1">
            {tocSections.map((section) => (
              <li key={section.id} className="group flex items-center">
                <button
                  onClick={() => scrollToSection(section.id)}
                  className={cn(
                    "flex-1 text-left text-sm py-1.5 px-3 transition-colors font-light border-l-2",
                    activeSection === section.id
                      ? "text-foreground border-champagne-500 bg-champagne-500/5"
                      : "text-muted-foreground hover:text-foreground border-transparent hover:border-stone-300"
                  )}
                >
                  {section.title}
                </button>
                <button
                  onClick={() => copyLink(section.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground transition-all"
                  aria-label={`Copy link to ${section.title}`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Contact Card */}
      <div className="mt-12 p-6 bg-stone-100 dark:bg-stone-900">
        <h4 className="text-sm font-medium mb-2">Need Help?</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Our team is here for you.
        </p>
        <a 
          href="mailto:hello@lineofjudah.com"
          className="text-sm text-champagne-600 hover:text-champagne-700 transition-colors"
        >
          hello@lineofjudah.com
        </a>
      </div>
    </nav>
  );
};

export default LegalSidebar;
