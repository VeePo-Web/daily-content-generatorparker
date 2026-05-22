import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Keyboard, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface Shortcut {
  keys: string[];
  action: string;
}

const shortcuts: Shortcut[] = [
  { keys: ["Tab"], action: "Move to next interactive element" },
  { keys: ["Shift", "Tab"], action: "Move to previous element" },
  { keys: ["Enter"], action: "Activate button or link" },
  { keys: ["Space"], action: "Toggle checkbox, open dropdown" },
  { keys: ["Escape"], action: "Close modal, menu, or overlay" },
  { keys: ["↑", "↓"], action: "Navigate within menus and lists" },
  { keys: ["Home"], action: "Jump to first item in list" },
  { keys: ["End"], action: "Jump to last item in list" }
];

const KeyboardShortcuts = () => {
  const [isOpen, setIsOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="border border-foreground/10 bg-stone-50/50 dark:bg-stone-900/30">
      {/* Toggle Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 md:p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-champagne-500 focus-visible:ring-offset-2"
        aria-expanded={isOpen}
        aria-controls="keyboard-shortcuts-content"
      >
        <div className="flex items-center gap-3">
          <Keyboard className="w-5 h-5 text-blue-500" strokeWidth={1.5} aria-hidden="true" />
          <span className="font-medium text-sm tracking-wide">KEYBOARD NAVIGATION REFERENCE</span>
        </div>
        <ChevronDown 
          className={cn(
            "w-5 h-5 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </button>

      {/* Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="keyboard-shortcuts-content"
            initial={prefersReducedMotion ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={prefersReducedMotion ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 md:px-6 pb-6 border-t border-foreground/5">
              <div className="pt-4 space-y-0">
                {shortcuts.map((shortcut, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "flex items-center justify-between py-3",
                      index !== shortcuts.length - 1 && "border-b border-foreground/5"
                    )}
                  >
                    {/* Keys */}
                    <div className="flex items-center gap-1.5">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex}>
                          <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-background border border-foreground/10 rounded text-xs font-mono text-muted-foreground">
                            {key}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="mx-1 text-muted-foreground text-xs">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                    
                    {/* Action */}
                    <span className="text-sm text-muted-foreground font-light text-right">
                      {shortcut.action}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KeyboardShortcuts;
