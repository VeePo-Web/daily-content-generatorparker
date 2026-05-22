import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import FitGuideModal from "./FitGuideModal";
import TextReveal from "@/components/motion/TextReveal";
import ScrollReveal from "@/components/motion/ScrollReveal";
import StaggerContainer from "@/components/motion/StaggerContainer";
import { easing, timing } from "@/lib/animations";

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

const FitGuideSection = () => {
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('male');
  const [selectedModel, setSelectedModel] = useState<FitModel | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const { data: models = [], isLoading } = useQuery({
    queryKey: ['fit-guide-models'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fit_guide_models')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as FitModel[];
    }
  });

  const filteredModels = models.filter(m => m.gender === selectedGender);

  // Mock models for demo if no data
  const demoModels: FitModel[] = [
    {
      id: '1',
      name: 'Marcus',
      gender: 'male',
      height_cm: 188,
      height_imperial: "6'2\"",
      size_worn: 'L',
      weight_kg: 84,
      chest_cm: 107,
      waist_cm: 86,
      hip_cm: 102,
      photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      fit_notes: 'Marcus wears size L for a relaxed fit. For a slimmer look, size down to M.'
    },
    {
      id: '2',
      name: 'David',
      gender: 'male',
      height_cm: 175,
      height_imperial: "5'9\"",
      size_worn: 'M',
      weight_kg: 72,
      chest_cm: 97,
      waist_cm: 81,
      hip_cm: 96,
      photo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800',
      fit_notes: 'David wears size M for a true-to-size fit.'
    },
    {
      id: '3',
      name: 'Isaiah',
      gender: 'male',
      height_cm: 183,
      height_imperial: "6'0\"",
      size_worn: 'XL',
      weight_kg: 95,
      chest_cm: 117,
      waist_cm: 96,
      hip_cm: 109,
      photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800',
      fit_notes: 'Isaiah wears XL for layered looks.'
    },
    {
      id: '4',
      name: 'Elijah',
      gender: 'male',
      height_cm: 170,
      height_imperial: "5'7\"",
      size_worn: 'S',
      weight_kg: 65,
      chest_cm: 91,
      waist_cm: 76,
      hip_cm: 91,
      photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800',
      fit_notes: 'Elijah wears S for a fitted look.'
    },
    {
      id: '5',
      name: 'Sarah',
      gender: 'female',
      height_cm: 170,
      height_imperial: "5'7\"",
      size_worn: 'M',
      weight_kg: 61,
      chest_cm: 89,
      waist_cm: 71,
      hip_cm: 97,
      photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
      fit_notes: 'Sarah wears M for a relaxed feminine fit.'
    },
    {
      id: '6',
      name: 'Miriam',
      gender: 'female',
      height_cm: 165,
      height_imperial: "5'5\"",
      size_worn: 'S',
      weight_kg: 54,
      chest_cm: 84,
      waist_cm: 66,
      hip_cm: 91,
      photo_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800',
      fit_notes: 'Miriam wears S for a true-to-size fit.'
    },
    {
      id: '7',
      name: 'Ruth',
      gender: 'female',
      height_cm: 175,
      height_imperial: "5'9\"",
      size_worn: 'L',
      weight_kg: 70,
      chest_cm: 94,
      waist_cm: 76,
      hip_cm: 102,
      photo_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800',
      fit_notes: 'Ruth wears L for oversized styling.'
    },
    {
      id: '8',
      name: 'Esther',
      gender: 'female',
      height_cm: 160,
      height_imperial: "5'3\"",
      size_worn: 'XS',
      weight_kg: 50,
      chest_cm: 81,
      waist_cm: 63,
      hip_cm: 86,
      photo_url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800',
      fit_notes: 'Esther wears XS for a fitted silhouette.'
    }
  ];

  const displayModels = filteredModels.length > 0 ? filteredModels : demoModels.filter(m => m.gender === selectedGender);

  const springConfig = { type: "spring" as const, stiffness: 400, damping: 25 };

  return (
    <>
      <section 
        data-section="fit-guide"
        className="lookbook-section-height w-full snap-start bg-stone-900 py-12 md:py-16 lg:py-24 px-4 md:px-6 overflow-y-auto"
      >
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <ScrollReveal variant="fadeUp">
              <p className="text-[10px] uppercase tracking-[0.3em] text-champagne-500 mb-6 font-light">
                How It Fits
              </p>
            </ScrollReveal>
            
            <TextReveal 
              text="Find Your Perfect Size"
              as="h2"
              className="text-3xl md:text-4xl lg:text-5xl font-extralight text-white mb-4"
              delay={0.2}
            />
            
            <ScrollReveal variant="fadeUp" delay={0.4}>
              <p className="text-white/50 font-light">
                Real models. Real measurements.
              </p>
            </ScrollReveal>
          </div>

          {/* Gender Toggle - Pill Style with Spring Animation */}
          <ScrollReveal variant="fadeUp" delay={0.5} className="flex justify-center mb-12">
            <div className="inline-flex bg-stone-800/50 p-1 backdrop-blur-sm border border-white/5">
              <motion.button
                onClick={() => setSelectedGender('male')}
                className={`relative px-6 py-3 md:px-8 md:py-2.5 min-h-[44px] text-sm font-light transition-colors ${
                  selectedGender === 'male'
                    ? 'text-white'
                    : 'text-white/50 hover:text-white/70'
                }`}
                whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                transition={springConfig}
              >
                {selectedGender === 'male' && (
                  <motion.div
                    className="absolute inset-0 bg-champagne-600"
                    layoutId="genderToggle"
                    transition={springConfig}
                  />
                )}
                <span className="relative z-10">Men</span>
              </motion.button>
              <motion.button
                onClick={() => setSelectedGender('female')}
                className={`relative px-6 py-3 md:px-8 md:py-2.5 min-h-[44px] text-sm font-light transition-colors ${
                  selectedGender === 'female'
                    ? 'text-white'
                    : 'text-white/50 hover:text-white/70'
                }`}
                whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                transition={springConfig}
              >
                {selectedGender === 'female' && (
                  <motion.div
                    className="absolute inset-0 bg-champagne-600"
                    layoutId="genderToggle"
                    transition={springConfig}
                  />
                )}
                <span className="relative z-10">Women</span>
              </motion.button>
            </div>
          </ScrollReveal>

          {/* Models Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-[3/4] bg-stone-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedGender}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <StaggerContainer 
                  className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6"
                  staggerDelay={0.08}
                  delayChildren={0.1}
                >
                  {displayModels.map((model) => (
                    <motion.button
                      key={model.id}
                      onClick={() => setSelectedModel(model)}
                      className="group relative aspect-[3/4] overflow-hidden focus:outline-none focus:ring-2 focus:ring-champagne-500 focus:ring-offset-2 focus:ring-offset-stone-900 active:scale-[0.98] transition-transform"
                      whileHover={prefersReducedMotion ? {} : { y: -6 }}
                      whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                      transition={springConfig}
                    >
                      <motion.img
                        src={model.photo_url}
                        alt={model.name}
                        className="w-full h-full object-cover"
                        whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                        transition={{ duration: 0.5, ease: easing.editorial }}
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300" />
                      
                      {/* Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                        <motion.p 
                          className="text-white font-light text-base md:text-lg mb-1"
                          initial={{ y: 0 }}
                          whileHover={{ y: -4 }}
                          transition={springConfig}
                        >
                          {model.name}
                        </motion.p>
                        <p className="text-white/60 text-sm font-light">
                          {model.height_imperial} • Size {model.size_worn}
                        </p>
                      </div>

                      {/* Hover/Tap indicator - Always visible on mobile */}
                      <motion.div 
                        className="absolute inset-0 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100"
                        transition={{ duration: 0.2 }}
                      >
                        <motion.span 
                          className="text-[10px] uppercase tracking-wider text-white bg-champagne-600 px-4 py-2"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          whileHover={{ scale: 1.05 }}
                          transition={springConfig}
                        >
                          View Details
                        </motion.span>
                      </motion.div>
                    </motion.button>
                  ))}
                </StaggerContainer>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {selectedModel && (
          <FitGuideModal 
            model={selectedModel} 
            onClose={() => setSelectedModel(null)} 
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default FitGuideSection;
