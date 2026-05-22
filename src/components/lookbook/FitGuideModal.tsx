import { useEffect } from "react";
import { X, Ruler } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { easing, timing } from "@/lib/animations";
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent } from "@/components/ui/drawer";

interface FitModel {
  id: string;
  name: string;
  gender: string;
  height_cm: number | null;
  height_imperial: string | null;
  size_worn: string;
  weight_kg: number | null;
  chest_cm: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
  photo_url: string;
  fit_notes: string | null;
}

interface FitGuideModalProps {
  model: FitModel;
  onClose: () => void;
}

const FitGuideModal = ({ model, onClose }: FitGuideModalProps) => {
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  // Lock body scroll and trap focus (only for desktop dialog)
  useEffect(() => {
    if (!isMobile) {
      document.body.style.overflow = 'hidden';
    }
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      if (!isMobile) {
        document.body.style.overflow = '';
      }
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose, isMobile]);

  const cmToInches = (cm: number) => (cm / 2.54).toFixed(1);
  const kgToLbs = (kg: number) => Math.round(kg * 2.205);

  const measurements = [
    { label: 'Height', value: model.height_imperial || (model.height_cm ? `${model.height_cm}cm` : null) },
    { label: 'Weight', value: model.weight_kg ? `${kgToLbs(model.weight_kg)} lbs (${model.weight_kg}kg)` : null },
    { label: 'Chest', value: model.chest_cm ? `${cmToInches(model.chest_cm)}" (${model.chest_cm}cm)` : null },
    { label: 'Waist', value: model.waist_cm ? `${cmToInches(model.waist_cm)}" (${model.waist_cm}cm)` : null },
    { label: 'Hips', value: model.hip_cm ? `${cmToInches(model.hip_cm)}" (${model.hip_cm}cm)` : null },
  ].filter(m => m.value);

  const springConfig = { type: "spring" as const, stiffness: 400, damping: 30 };

  // Mobile: Use Drawer pattern
  if (isMobile) {
    return (
      <Drawer open={!!model} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="max-h-[95vh] bg-stone-900 border-t-0 rounded-t-none">
          <div className="overflow-y-auto max-h-[95vh]">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-none flex items-center justify-center text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image */}
            <div className="w-full h-56 xs:h-64 overflow-hidden">
              <img
                src={model.photo_url}
                alt={model.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="p-4 pb-safe">
              {/* Name & Size Badge */}
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-extralight text-white">
                  {model.name}
                </h2>
                <span className="text-[10px] uppercase tracking-wider bg-champagne-600 text-white px-3 py-1.5">
                  Size {model.size_worn}
                </span>
              </div>

              {/* Measurements Table */}
              <div className="mb-6">
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4 flex items-center gap-2">
                  <Ruler className="w-3.5 h-3.5" />
                  Measurements
                </h3>
                <div className="space-y-3">
                  {measurements.map((m) => (
                    <div 
                      key={m.label}
                      className="flex justify-between items-center py-2 border-b border-white/5"
                    >
                      <span className="text-white/50 font-light text-sm">{m.label}</span>
                      <span className="text-white font-light text-sm">{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Size Worn */}
              <div className="mb-6 p-4 bg-stone-800/50 rounded-none border border-white/5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-champagne-500 mb-2">
                  Size Worn in Photo
                </p>
                <p className="text-2xl font-extralight text-white">
                  {model.size_worn}
                </p>
              </div>

              {/* Fit Notes */}
              {model.fit_notes && (
                <div className="mb-6">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-3">
                    Fit Notes
                  </h3>
                  <p className="text-white/70 font-light leading-relaxed text-sm">
                    {model.fit_notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <Link to="/about/size-guide">
                  <Button 
                    variant="outline" 
                    className="w-full border-white/10 text-white hover:bg-white/5 h-12"
                  >
                    View Full Size Chart
                  </Button>
                </Link>
                <Link to={`/category/all?size=${model.size_worn}`}>
                  <Button className="w-full bg-champagne-600 hover:bg-champagne-500 text-white h-12">
                    Shop in Size {model.size_worn}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Original dialog pattern

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fit-model-name"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Backdrop */}
      <motion.div 
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Modal Content */}
      <motion.div 
        className="relative w-full max-w-4xl max-h-[90vh] m-4 bg-stone-900 rounded-none overflow-hidden flex flex-col lg:flex-row shadow-2xl"
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
        transition={springConfig}
      >
        {/* Close Button */}
        <motion.button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-12 h-12 md:w-10 md:h-10 bg-black/50 hover:bg-black/70 rounded-none flex items-center justify-center text-white transition-colors"
          aria-label="Close modal"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={springConfig}
        >
          <X className="w-5 h-5" />
        </motion.button>

        {/* Image Side */}
        <motion.div 
          className="w-full lg:w-1/2 h-64 lg:h-auto overflow-hidden"
          initial={prefersReducedMotion ? {} : { clipPath: "inset(100% 0% 0% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
          transition={{ duration: timing.slow, ease: easing.editorial, delay: 0.1 }}
        >
          <motion.img
            src={model.photo_url}
            alt={model.name}
            className="w-full h-full object-cover"
            initial={prefersReducedMotion ? {} : { scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: timing.cinematic, ease: easing.editorial }}
          />
        </motion.div>

        {/* Info Side */}
        <div className="w-full lg:w-1/2 p-4 md:p-6 lg:p-10 pb-safe overflow-y-auto">
          {/* Name & Size Badge */}
          <motion.div 
            className="flex items-center gap-3 mb-8"
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: timing.slow, ease: easing.editorial, delay: 0.2 }}
          >
            <h2 id="fit-model-name" className="text-2xl lg:text-3xl font-extralight text-white">
              {model.name}
            </h2>
            <span className="text-[10px] uppercase tracking-wider bg-champagne-600 text-white px-3 py-1.5">
              Size {model.size_worn}
            </span>
          </motion.div>

          {/* Measurements Table */}
          <motion.div 
            className="mb-8"
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: timing.slow, ease: easing.editorial, delay: 0.3 }}
          >
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4 flex items-center gap-2">
              <Ruler className="w-3.5 h-3.5" />
              Measurements
            </h3>
            <div className="space-y-3">
              {measurements.map((m, index) => (
                <motion.div 
                  key={m.label}
                  className="flex justify-between items-center py-2 border-b border-white/5"
                  initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    duration: timing.medium, 
                    ease: easing.editorial, 
                    delay: 0.35 + (index * 0.05) 
                  }}
                >
                  <span className="text-white/50 font-light text-sm">{m.label}</span>
                  <span className="text-white font-light text-sm">{m.value}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Size Worn */}
          <motion.div 
            className="mb-8 p-4 bg-stone-800/50 rounded-none border border-white/5"
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: timing.slow, ease: easing.editorial, delay: 0.5 }}
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-champagne-500 mb-2">
              Size Worn in Photo
            </p>
            <p className="text-2xl font-extralight text-white">
              {model.size_worn}
            </p>
          </motion.div>

          {/* Fit Notes */}
          {model.fit_notes && (
            <motion.div 
              className="mb-8"
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: timing.slow, ease: easing.editorial, delay: 0.55 }}
            >
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-3">
                Fit Notes
              </h3>
              <p className="text-white/70 font-light leading-relaxed text-sm">
                {model.fit_notes}
              </p>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div 
            className="space-y-3"
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: timing.slow, ease: easing.editorial, delay: 0.6 }}
          >
            <Link to="/about/size-guide">
              <motion.div
                whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                transition={springConfig}
              >
                <Button 
                  variant="outline" 
                  className="w-full border-white/10 text-white hover:bg-white/5 h-12 md:h-11"
                >
                  View Full Size Chart
                </Button>
              </motion.div>
            </Link>
            <Link to={`/category/all?size=${model.size_worn}`}>
              <motion.div
                whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                transition={springConfig}
              >
                <Button className="w-full bg-champagne-600 hover:bg-champagne-500 text-white h-12 md:h-11">
                  Shop in Size {model.size_worn}
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FitGuideModal;
