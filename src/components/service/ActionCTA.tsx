import { ReactNode, useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { fadeIn } from "@/lib/animations";

interface FooterLink {
  text: string;
  href: string;
  isExternal?: boolean;
}

interface ActionCTAProps {
  title: string;
  subtitle?: string;
  className?: string;
  alignment?: 'center' | 'left';
  showInput?: boolean;
  inputPlaceholder?: string;
  inputType?: 'text' | 'email';
  buttonText: string;
  onSubmit?: (value: string) => void;
  children?: ReactNode;
  footerLinks?: FooterLink[];
  footerText?: string;
}

const ActionCTA = ({
  title,
  subtitle,
  className,
  alignment = 'center',
  showInput = false,
  inputPlaceholder = "Enter value...",
  inputType = 'text',
  buttonText,
  onSubmit,
  children,
  footerLinks,
  footerText
}: ActionCTAProps) => {
  const [inputValue, setInputValue] = useState('');
  const prefersReducedMotion = useReducedMotion();
  const isCenter = alignment === 'center';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit?.(inputValue);
  };

  return (
    <motion.div
      className={cn(
        "bg-stone-900 text-white p-8 md:p-12",
        className
      )}
      initial={prefersReducedMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeIn}
    >
      <div className={cn(isCenter && "text-center")}>
        {/* Title - Mobile typography refinement */}
        <h2 className="text-xl xs:text-2xl md:text-3xl font-light mb-4">
          {title}
        </h2>
        
        {/* Subtitle */}
        {subtitle && (
          <p className={cn(
            "text-white/70 font-light mb-8",
            isCenter && "max-w-md mx-auto"
          )}>
            {subtitle}
          </p>
        )}
        
        {/* Custom Children or Default Form */}
        {children ? (
          <div className={cn(isCenter && "flex justify-center")}>
            {children}
          </div>
        ) : (
          <form 
            onSubmit={handleSubmit}
            className={cn(
              "flex flex-col sm:flex-row gap-4",
              isCenter && "max-w-md mx-auto"
            )}
          >
            {showInput && (
              <Input
                type={inputType}
                placeholder={inputPlaceholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 px-4 py-3 h-auto bg-white text-stone-900 border-0 placeholder:text-stone-400 text-sm rounded-none focus-visible:ring-champagne-500"
              />
            )}
            <Button 
              type="submit"
              className="bg-champagne-500 hover:bg-champagne-600 text-white px-8 min-h-[48px] py-3 md:h-auto rounded-none"
            >
              {buttonText}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        )}
        
        {/* Footer */}
        {(footerLinks || footerText) && (
          <p className="mt-6 text-sm text-white/50 font-light">
            {footerText}{' '}
            {footerLinks?.map((link, index) => (
              <span key={index}>
                {index > 0 && ' or '}
                {link.isExternal ? (
                  <a 
                    href={link.href}
                    className="text-champagne-400 hover:underline inline-flex items-center min-h-[44px] px-1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.text}
                  </a>
                ) : (
                  <Link 
                    to={link.href}
                    className="text-champagne-400 hover:underline inline-flex items-center min-h-[44px] px-1"
                  >
                    {link.text}
                  </Link>
                )}
              </span>
            ))}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default ActionCTA;
