import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { fadeUp } from "@/lib/animations";

interface ServiceSectionProps {
  id?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  showDivider?: boolean;
  size?: 'default' | 'compact';
}

const ServiceSection = ({
  id,
  title,
  subtitle,
  children,
  className,
  showDivider = true,
  size = 'default'
}: ServiceSectionProps) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.section
      id={id}
      className={cn(
        "scroll-mt-28 md:scroll-mt-24",
        size === 'default' ? "mb-12 md:mb-16" : "mb-8 md:mb-10",
        className
      )}
      initial={prefersReducedMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeUp}
    >
      <h2 
        className={cn(
          "text-2xl font-light tracking-tight mb-6",
          showDivider && "pb-4 border-b border-border"
        )}
      >
        {title}
      </h2>
      
      {subtitle && (
        <p className="text-sm text-muted-foreground font-light -mt-2 mb-6">
          {subtitle}
        </p>
      )}
      
      <div className="prose prose-stone dark:prose-invert prose-p:font-light prose-p:text-muted-foreground prose-headings:font-light max-w-none">
        {children}
      </div>
    </motion.section>
  );
};

export default ServiceSection;
