import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface EmailTypoSuggestionProps {
  /** The suggested corrected email */
  suggestion: string;
  /** Whether to show the suggestion */
  show: boolean;
  /** Called when user accepts the suggestion */
  onAccept: () => void;
  /** Called when user dismisses the suggestion */
  onDismiss: () => void;
  /** Visual variant */
  variant?: 'default' | 'compact';
  /** Additional class name */
  className?: string;
}

export function EmailTypoSuggestion({
  suggestion,
  show,
  onAccept,
  onDismiss,
  variant = 'default',
  className = '',
}: EmailTypoSuggestionProps) {
  const prefersReducedMotion = useReducedMotion();

  const variants = {
    hidden: {
      opacity: 0,
      height: 0,
      marginTop: 0,
    },
    visible: {
      opacity: 1,
      height: 'auto',
      marginTop: 8,
    },
  };

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={variants}
          transition={transition}
          className={`overflow-hidden ${className}`}
          role="alert"
          aria-live="polite"
        >
          <div className={`
            flex items-start gap-2 p-3 rounded-sm
            bg-champagne-500/10 border border-champagne-500/30
            ${variant === 'compact' ? 'text-xs' : 'text-sm'}
          `}>
            <Lightbulb className={`
              text-champagne-600 flex-shrink-0 mt-0.5
              ${variant === 'compact' ? 'h-3 w-3' : 'h-4 w-4'}
            `} />
            
            <div className="flex-1 min-w-0">
              <p className="text-champagne-700 dark:text-champagne-300">
                Did you mean{' '}
                <span className="font-medium">{suggestion}</span>?
              </p>
              
              <div className={`flex items-center gap-2 ${variant === 'compact' ? 'mt-1.5' : 'mt-2'}`}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onAccept}
                  className={`
                    h-auto py-1 px-2 text-champagne-700 hover:text-champagne-800 
                    hover:bg-champagne-500/20 dark:text-champagne-300 dark:hover:text-champagne-200
                    ${variant === 'compact' ? 'text-xs' : 'text-sm'}
                  `}
                >
                  <Check className={`mr-1 ${variant === 'compact' ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                  Yes, fix it
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onDismiss}
                  className={`
                    h-auto py-1 px-2 text-muted-foreground hover:text-foreground
                    ${variant === 'compact' ? 'text-xs' : 'text-sm'}
                  `}
                >
                  <X className={`mr-1 ${variant === 'compact' ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                  No, keep it
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default EmailTypoSuggestion;
