import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Ruler, Volume2, Keyboard, ArrowRight } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { staggerContainer, staggerItem } from "@/lib/animations";

interface Tool {
  icon: React.ElementType;
  title: string;
  description: string;
  link: string | null;
  linkText: string;
}

const tools: Tool[] = [
  {
    icon: Ruler,
    title: "AI FIT FINDER",
    description: "Get personalized size recommendations based on your measurements. Works with screen readers.",
    link: null,
    linkText: "COMING SOON"
  },
  {
    icon: Volume2,
    title: "SIZE GUIDE",
    description: "Detailed measurement tables with clear column headers for assistive technology.",
    link: "/size-guide",
    linkText: "VIEW SIZE GUIDE"
  },
  {
    icon: Keyboard,
    title: "KEYBOARD FIRST",
    description: "Every feature accessible via keyboard. Tab through, Enter to select, Escape to close.",
    link: "#shortcuts",
    linkText: "VIEW SHORTCUTS"
  }
];

const AccessibleToolsGrid = () => {
  const prefersReducedMotion = useReducedMotion();

  const handleShortcutsClick = (e: React.MouseEvent, link: string) => {
    if (link === "#shortcuts") {
      e.preventDefault();
      const shortcutsSection = document.querySelector('[aria-controls="keyboard-shortcuts-content"]');
      if (shortcutsSection) {
        (shortcutsSection as HTMLButtonElement).click();
        shortcutsSection.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
      }
    }
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={staggerContainer}
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isInternalLink = tool.link !== null && tool.link.startsWith('/');

        const content = (
          <motion.div
            variants={staggerItem}
            className="group relative p-6 bg-stone-50 dark:bg-stone-900/50 border border-foreground/5 hover:border-champagne-500/30 transition-colors duration-200"
          >
            {/* Icon */}
            <div className="mb-4">
              <Icon 
                className="w-6 h-6 text-champagne-500" 
                strokeWidth={1.5} 
                aria-hidden="true" 
              />
            </div>
            
            {/* Title */}
            <h3 className="font-medium text-sm tracking-wide mb-2">
              {tool.title}
            </h3>
            
            {/* Description */}
            <p className="text-sm text-muted-foreground font-light leading-relaxed mb-4">
              {tool.description}
            </p>
            
            {/* Link */}
            <span className="inline-flex items-center gap-2 text-xs font-medium text-champagne-600 group-hover:text-champagne-700 transition-colors">
              {tool.linkText}
              <ArrowRight 
                className="w-3 h-3 transition-transform group-hover:translate-x-0.5" 
                strokeWidth={1.5}
                aria-hidden="true" 
              />
            </span>
          </motion.div>
        );

        if (tool.link === null) {
          return <div key={tool.title} className="opacity-60 cursor-default">{content}</div>;
        }

        if (isInternalLink) {
          return (
            <Link
              key={tool.title}
              to={tool.link}
              className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-champagne-500 focus-visible:ring-offset-2"
            >
              {content}
            </Link>
          );
        }

        return (
          <button
            key={tool.title}
            onClick={(e) => handleShortcutsClick(e, tool.link!)}
            className="block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-champagne-500 focus-visible:ring-offset-2"
          >
            {content}
          </button>
        );
      })}
    </motion.div>
  );
};

export default AccessibleToolsGrid;
