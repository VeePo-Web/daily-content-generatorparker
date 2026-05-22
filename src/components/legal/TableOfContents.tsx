import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Link2, ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export interface TOCSection {
  id: string;
  title: string;
}

interface TableOfContentsProps {
  sections: TOCSection[];
  title?: string;
}

const TableOfContents = ({ sections, title = "Contents" }: TableOfContentsProps) => {
  const [activeSection, setActiveSection] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
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

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsOpen(false);
    }
  };

  const copyLink = (id: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url);
  };

  // Desktop version
  const DesktopTOC = () => (
    <nav className="hidden lg:block sticky top-24 mb-12">
      <h3 className="text-xs font-medium tracking-widest text-muted-foreground mb-4">
        {title.toUpperCase()}
      </h3>
      <ul className="space-y-1">
        {sections.map((section) => (
          <li key={section.id} className="group flex items-center">
            <button
              onClick={() => scrollToSection(section.id)}
              className={cn(
                "flex-1 text-left text-sm py-1.5 transition-colors font-light",
                activeSection === section.id
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
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
    </nav>
  );

  // Mobile version
  const MobileTOC = () => (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="lg:hidden mb-8">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-stone-100 dark:bg-stone-900">
        <span className="text-sm font-medium">{title}</span>
        <ChevronDown 
          className={cn(
            "w-4 h-4 transition-transform",
            isOpen && "rotate-180"
          )} 
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="bg-stone-50 dark:bg-stone-900/50">
        <ul className="p-4 space-y-2">
          {sections.map((section) => (
            <li key={section.id}>
              <button
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  "text-sm py-1 transition-colors font-light",
                  activeSection === section.id
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {section.title}
              </button>
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );

  return (
    <>
      <MobileTOC />
      <DesktopTOC />
    </>
  );
};

export default TableOfContents;
