import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const StoryJoinCTA = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      className="relative bg-stone-950 text-white overflow-hidden"
    >
      {/* Index watermark */}
      <motion.span
        className="absolute top-10 right-10 lg:top-12 lg:right-12 text-[10px] tracking-[0.4em] text-white/20 font-light z-20"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        08
      </motion.span>

      <div className="grid lg:grid-cols-2 min-h-[80vh]">
        {/* Left: Image */}
        <motion.div
          className="relative h-80 lg:h-auto"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2, duration: 1 }}
        >
          <img
            src="/products/stay-holy-hoodie/male-model.png"
            alt="Join the Line of Judah movement"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-stone-950/50 lg:bg-gradient-to-l lg:from-stone-950/30 lg:to-transparent" />
        </motion.div>

        {/* Right: CTA content */}
        <div className="flex items-center px-8 md:px-12 lg:px-16 xl:px-24 py-20 lg:py-32">
          <div className="max-w-md lg:max-w-lg">
            <motion.p
              className="text-[10px] tracking-[0.4em] text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              THE CALL
            </motion.p>

            <motion.h2
              className="text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-light tracking-tight mb-8 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Ready to Suit Up<span className="text-white">?</span>
            </motion.h2>

            <motion.p
              className="text-base md:text-lg lg:text-xl font-light text-white/60 mb-12 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              The war between light and darkness isn't slowing down. Neither are we. 
              Join the movement. Wear your faith like armor. Let your wardrobe preach.
            </motion.p>

            {/* Dual CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 lg:gap-4 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <Button
                asChild
                size="lg"
                className="bg-white text-stone-950 hover:bg-white/90 px-8 group"
              >
                <Link to="/category/all">
                  Shop the Collection
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/30 text-white bg-transparent hover:bg-white/10 hover:text-white px-8"
              >
                <Link to="/ambassador">Become an Ambassador</Link>
              </Button>
            </motion.div>

            {/* Social proof */}
            <motion.p
              className="text-sm text-white/30 font-light"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              Join believers across Calgary wearing their faith daily.
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoryJoinCTA;
