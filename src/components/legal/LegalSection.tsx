import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface LegalSectionProps {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
}

export const LegalSection = ({ id, title, children, className }: LegalSectionProps) => {
  return (
    <section id={id} className={cn("scroll-mt-24 mb-16 print-avoid-break", className)}>
      <h2 className="text-2xl font-light tracking-tight mb-6 pb-4 border-b border-border print:text-base print:font-medium print:mb-3 print:pb-2">
        {title}
      </h2>
      <div className="prose prose-stone dark:prose-invert max-w-none prose-p:font-light prose-p:leading-relaxed prose-p:text-muted-foreground prose-li:font-light prose-li:text-muted-foreground print:prose-p:text-foreground print:prose-li:text-foreground">
        {children}
      </div>
    </section>
  );
};

interface ImportantCalloutProps {
  children: ReactNode;
  className?: string;
}

export const ImportantCallout = ({ children, className }: ImportantCalloutProps) => {
  return (
    <div className={cn(
      "flex gap-4 p-6 bg-champagne-50 dark:bg-champagne-900/20 border-l-4 border-champagne-500 my-6 print-avoid-break print-callout print:bg-transparent print:border-foreground",
      className
    )}>
      <AlertTriangle className="w-5 h-5 text-champagne-600 flex-shrink-0 mt-0.5 print:hidden" />
      <div className="text-sm text-champagne-800 dark:text-champagne-200 font-light leading-relaxed print:text-foreground">
        {children}
      </div>
    </div>
  );
};

export default LegalSection;
