import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { staggerContainer, staggerItem } from "@/lib/animations";

interface Step {
  number?: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

interface StepFlowProps {
  steps: Step[];
  className?: string;
  variant?: 'default' | 'compact';
  showConnectors?: boolean;
}

const StepFlow = ({
  steps,
  className,
  variant = 'default',
  showConnectors = true
}: StepFlowProps) => {
  const prefersReducedMotion = useReducedMotion();

  const getStepNumber = (index: number, providedNumber?: string) => {
    return providedNumber || String(index + 1).padStart(2, '0');
  };

  return (
    <motion.div
      className={cn("relative", className)}
      initial={prefersReducedMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={staggerContainer}
    >
      {/* Desktop Layout */}
      <div className="hidden md:flex items-start justify-between relative">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === steps.length - 1;
          
          return (
            <motion.div 
              key={index}
              className="flex-1 flex flex-col items-center text-center relative"
              variants={staggerItem}
            >
              {/* Connector Line */}
              {showConnectors && !isLast && (
                <div 
                  className="absolute top-10 left-[calc(50%+40px)] right-[calc(-50%+40px)] border-t border-dashed border-stone-300 dark:border-stone-700"
                  aria-hidden="true"
                />
              )}
              
              {/* Icon Box */}
              <div className={cn(
                "relative flex items-center justify-center border-2 border-stone-900 dark:border-stone-100 bg-background",
                variant === 'default' ? "w-20 h-20" : "w-16 h-16"
              )}>
                {/* Number Badge */}
                <span className="absolute -top-3 -left-3 bg-champagne-500 text-white text-xs font-medium px-2 py-0.5">
                  {getStepNumber(index, step.number)}
                </span>
                <Icon 
                  className={cn(
                    "text-stone-900 dark:text-stone-100",
                    variant === 'default' ? "w-8 h-8" : "w-6 h-6"
                  )} 
                  strokeWidth={1.5} 
                />
              </div>
              
              {/* Title */}
              <h3 className={cn(
                "font-medium tracking-widest uppercase",
                variant === 'default' ? "text-sm mt-6 mb-2" : "text-xs mt-4 mb-1"
              )}>
                {step.title}
              </h3>
              
              {/* Description */}
              <p className={cn(
                "text-muted-foreground font-light mx-auto",
                variant === 'default' 
                  ? "text-sm max-w-[160px]" 
                  : "text-xs max-w-[120px]"
              )}>
                {step.description}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden space-y-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === steps.length - 1;
          
          return (
            <motion.div 
              key={index}
              className="relative"
              variants={staggerItem}
            >
              <div className="flex gap-6">
                {/* Icon Column */}
                <div className="flex flex-col items-center">
                  {/* Icon Box */}
                  <div className="relative flex items-center justify-center w-16 h-16 border-2 border-stone-900 dark:border-stone-100 bg-background">
                    <span className="absolute -top-2 -left-2 bg-champagne-500 text-white text-xs font-medium px-1.5 py-0.5">
                      {getStepNumber(index, step.number)}
                    </span>
                    <Icon className="w-6 h-6 text-stone-900 dark:text-stone-100" strokeWidth={1.5} />
                  </div>
                  
                  {/* Vertical Connector */}
                  {showConnectors && !isLast && (
                    <div 
                      className="flex-1 w-px min-h-6 border-l border-dashed border-stone-300 dark:border-stone-700 mt-2"
                      aria-hidden="true"
                    />
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 pt-2">
                  <h3 className="text-sm font-medium tracking-widest uppercase mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-light">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default StepFlow;
