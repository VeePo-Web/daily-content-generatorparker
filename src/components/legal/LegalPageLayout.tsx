import { ReactNode, useState } from "react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import LegalSidebar, { TOCSection } from "./LegalSidebar";
import PrintButton from "./PrintButton";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface LegalPageLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  showSidebar?: boolean;
  tocSections?: TOCSection[];
}

const LegalPageLayout = ({ 
  children, 
  title, 
  subtitle,
  lastUpdated,
  showSidebar = true,
  tocSections
}: LegalPageLayoutProps) => {
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsMobileTocOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Print-only Document Header */}
      <div className="print-only print-header hidden">
        <div className="print-header-title">{title}</div>
        <div className="print-header-meta">
          Line of Judah LLC {lastUpdated && `| Last Updated: ${lastUpdated}`}
        </div>
      </div>
      
      {/* Hero Section - pt-[var(--header-height)] for header offset + additional padding */}
      <section className="bg-stone-900 text-white pt-[calc(var(--header-height)+2rem)] pb-16 px-6 print:bg-transparent print:text-foreground print:pt-0 print:pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <div className="flex items-center justify-between gap-4 mb-4">
              {lastUpdated && (
                <span className="inline-block text-xs font-medium tracking-widest text-champagne-500 print:text-muted-foreground">
                  LAST UPDATED: {lastUpdated.toUpperCase()}
                </span>
              )}
              <PrintButton />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-4 print:text-3xl print:mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-lg text-white/70 font-light leading-relaxed print:text-foreground/70 print:text-base">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        {showSidebar ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block lg:col-span-1">
              <LegalSidebar tocSections={tocSections} />
            </aside>
            
            {/* Content Area */}
            <div className="lg:col-span-3">
              {/* Mobile TOC - Above content, not overlapping */}
              {tocSections && tocSections.length > 0 && (
                <Collapsible 
                  open={isMobileTocOpen} 
                  onOpenChange={setIsMobileTocOpen} 
                  className="lg:hidden mb-8"
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-stone-900 border border-stone-800">
                    <span className="text-xs font-medium tracking-widest">ON THIS PAGE</span>
                    <ChevronDown 
                      className={cn(
                        "w-4 h-4 transition-transform",
                        isMobileTocOpen && "rotate-180"
                      )} 
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="bg-stone-900/50 border border-t-0 border-stone-800">
                    <ul className="p-4 space-y-2">
                      {tocSections.map((section) => (
                        <li key={section.id}>
                          <button
                            onClick={() => scrollToSection(section.id)}
                            className="text-sm py-1 transition-colors font-light text-muted-foreground hover:text-foreground"
                          >
                            {section.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              )}
              
              {children}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        )}
      </main>

      <Footer />
      
      {/* Print-only Document Footer */}
      <div className="print-only print-footer hidden">
        lineofjudah.com | hello@lineofjudah.com
      </div>
    </div>
  );
};

export default LegalPageLayout;
