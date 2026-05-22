import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { easing } from "@/lib/animations";

interface ImageZoomProps {
  images: string[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

const ImageZoom = ({ images, initialIndex, isOpen, onClose }: ImageZoomProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Scroll to the selected image when modal opens
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      const imageElement = scrollRef.current.children[0]?.children[initialIndex] as HTMLElement;
      if (imageElement) {
        imageElement.scrollIntoView();
      }
    }
  }, [isOpen, initialIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
        >
          {/* Backdrop */}
          <motion.div 
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Close button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: prefersReducedMotion ? 0 : 0.2, duration: 0.3 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-6 right-6 z-10 hover:bg-transparent text-white border-none p-2"
            >
              <X className="h-8 w-8" />
            </Button>
          </motion.div>

          {/* Scrollable image container */}
          <div ref={scrollRef} className="relative w-full h-full overflow-y-auto">
            <div className="space-y-4">
              {images.map((image, index) => (
                <motion.div 
                  key={index} 
                  className="w-full flex justify-center"
                  initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    delay: prefersReducedMotion ? 0 : 0.1 + index * 0.05, 
                    duration: 0.4,
                    ease: easing.editorial,
                  }}
                >
                  <img
                    src={image}
                    alt={`Product view ${index + 1}`}
                    className="w-full max-w-none object-cover"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageZoom;
