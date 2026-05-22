import { memo } from "react";
import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import ScrollReveal from "@/components/motion/ScrollReveal";

const InstagramFeed = () => {
  return (
    <section className="w-full py-12 md:py-16 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 xs:px-6">
        <ScrollReveal variant="fadeUp">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center gap-3">
              <Instagram className="w-5 h-5 text-foreground" />
              <span className="text-sm font-light text-foreground">@lineofjudahwear</span>
            </div>
            <motion.a 
              href="https://instagram.com/lineofjudahwear" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-caption text-muted-foreground hover:text-foreground transition-colors uppercase touch-target px-3 py-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Follow
            </motion.a>
          </div>
        </ScrollReveal>

        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-muted-foreground font-light tracking-wide">
            Coming soon...
          </p>
        </div>

        <ScrollReveal variant="fadeIn" delay={0.4}>
          <p className="text-center text-caption text-muted-foreground mt-6 md:mt-8">
            Tag us for a chance to be featured
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default memo(InstagramFeed);
