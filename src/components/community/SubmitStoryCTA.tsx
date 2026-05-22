import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import SubmitStoryModal from "./SubmitStoryModal";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, wordReveal, wordItem } from "@/lib/animations";

export default function SubmitStoryCTA() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Exclusive Invitation Section - 032c Industrial */}
      <section className="relative py-24 lg:py-32 bg-stone-950 overflow-hidden">
        {/* Noise texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          {/* Industrial divider top */}
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="h-px bg-white/10 mb-16 origin-left"
          />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            {/* Main Headline - TextReveal */}
            <motion.div
              variants={wordReveal}
              className="mb-10"
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight text-white leading-[1.1] uppercase tracking-[-0.02em]">
                <motion.span variants={wordItem} className="block">Got a</motion.span>
                <motion.span variants={wordItem} className="block text-champagne-500">Testimony?</motion.span>
              </h2>
            </motion.div>

            {/* Exclusive Copy */}
            <motion.div variants={staggerItem} className="space-y-4 mb-12">
              <p className="text-white/70 text-lg md:text-xl font-light leading-relaxed">
                We feature real stories from the tribe.
              </p>
              <p className="text-white/50 text-base font-light">
                Not everyone gets in. Not everyone applies.
                <br />
                But if you've worn the lion and something happened —
                <br />
                we want to hear it.
              </p>
            </motion.div>

            {/* CTA Button - Industrial style */}
            <motion.div variants={staggerItem}>
              <Button
                size="lg"
                onClick={() => setIsModalOpen(true)}
                className="bg-transparent text-white border border-white/30 hover:bg-white hover:text-stone-950 rounded-none px-12 py-6 h-auto text-xs uppercase tracking-[0.25em] font-medium transition-all duration-300 group"
              >
                Submit Your Story
                <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Industrial divider bottom */}
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="h-px bg-white/10 mt-16 origin-right"
          />
        </div>
      </section>

      <SubmitStoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
