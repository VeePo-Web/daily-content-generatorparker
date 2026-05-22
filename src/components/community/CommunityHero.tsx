import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Play, MapPin, ArrowDown } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { wordReveal, wordItem, staggerContainer, staggerItem } from "@/lib/animations";

interface FeaturedStory {
  id: string;
  customer_name: string;
  customer_photo_url: string | null;
  customer_location: string | null;
  headline: string;
  story_text: string;
  video_url: string | null;
}

const manifestoLines = [
  "Pray before you post.",
  "Walk different because you answer to a higher call.",
  "Wear your faith like armor, not a costume.",
  "Start conversations, not confrontations.",
  "Move in silence but let your clothes speak.",
];

export default function CommunityHero() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const { data: featuredStory } = useQuery({
    queryKey: ["featured-community-story"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_stories")
        .select("*")
        .eq("is_featured", true)
        .eq("is_approved", true)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as FeaturedStory | null;
    },
  });

  const displayStory = featuredStory;

  return (
    <>
      {/* SECTION 1: The Manifesto */}
      <section className="relative min-h-screen bg-stone-950 flex items-center overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        
        <div className="absolute right-0 top-0 bottom-0 w-1/2 lg:w-2/5 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-stone-950/50 to-stone-950 z-10" />
          <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-0"
          >
            <img 
              src="/founders.png" 
              alt="" 
              className="w-full h-full object-cover grayscale"
              aria-hidden="true"
            />
          </motion.div>
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10 pt-20 lg:pt-0">
          <div className="max-w-4xl">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-[10px] uppercase tracking-[0.4em] text-champagne-500 font-medium mb-8"
            >
              Not For Everyone
            </motion.p>

            <motion.div
              variants={wordReveal}
              initial="hidden"
              animate="visible"
              className="mb-12"
            >
              <h1 className="text-[18vw] md:text-[12vw] lg:text-[10vw] font-extralight text-white leading-[0.85] tracking-[-0.04em] uppercase">
                <motion.span variants={wordItem} className="block">The</motion.span>
                <motion.span variants={wordItem} className="block text-champagne-500">Tribe</motion.span>
              </h1>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-2 mb-16 max-w-xl"
            >
              <motion.p 
                variants={staggerItem}
                className="text-[11px] uppercase tracking-[0.3em] text-white/40 mb-6"
              >
                If you...
              </motion.p>
              {manifestoLines.map((line, index) => (
                <motion.p
                  key={index}
                  variants={staggerItem}
                  className="text-white/80 text-base md:text-lg font-light leading-relaxed"
                >
                  {line}
                </motion.p>
              ))}
              <motion.p 
                variants={staggerItem}
                className="text-champagne-500 text-xl md:text-2xl font-light italic pt-6"
              >
                You belong here.
              </motion.p>
            </motion.div>

            {/* Stats Row - grid for mobile stability */}
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-3 gap-4 md:flex md:gap-16 pt-8 border-t border-white/10"
            >
              <motion.div variants={staggerItem} className="text-center">
                <p className="text-2xl md:text-4xl font-light text-white">500+</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mt-1">Stories</p>
              </motion.div>
              <motion.div variants={staggerItem} className="text-center">
                <p className="text-2xl md:text-4xl font-light text-white">45</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mt-1">Cities</p>
              </motion.div>
              <motion.div variants={staggerItem} className="text-center">
                <p className="text-2xl md:text-4xl font-light text-white">10K+</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mt-1">Tribe Members</p>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator on divider line */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <ArrowDown className="w-5 h-5 text-white/30" />
          </motion.div>
        </motion.div>
      </section>

      {/* Industrial divider */}
      <div className="h-px bg-border" />

      {/* SECTION 2: Featured Story */}
      <section className="relative bg-background pt-16 lg:pt-24 pb-10 lg:pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {displayStory ? (
            <div className="grid lg:grid-cols-5 gap-8 lg:gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="lg:col-span-3 relative"
              >
                <div className="aspect-[3/4] rounded-sm overflow-hidden bg-muted relative group">
                  <img
                    src={displayStory.customer_photo_url || "/founders.png"}
                    alt="Featured story"
                    className="w-full h-full object-cover md:grayscale md:group-hover:grayscale-0 transition-all duration-700"
                  />
                </div>
                <div className="absolute -bottom-3 left-4 lg:hidden bg-champagne-500 px-4 py-2">
                  <p className="text-stone-900 font-medium text-xs uppercase tracking-wider">Featured Story</p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="lg:col-span-2 space-y-8"
              >
                <div className="space-y-6">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-champagne-500 font-medium">——— Featured</p>
                  <h2 className="text-3xl lg:text-4xl xl:text-5xl font-light leading-[1.15] italic">
                    "{displayStory.headline}"
                  </h2>
                </div>
                <blockquote className="text-lg text-muted-foreground font-light leading-relaxed">
                  {displayStory.story_text}
                </blockquote>
                <div className="flex items-center gap-4 pt-4">
                  <div className="w-14 h-14 rounded-full bg-champagne-500/20 flex items-center justify-center">
                    <span className="text-champagne-500 font-medium text-xl">
                      {displayStory.customer_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-lg">{displayStory.customer_name}</p>
                    {displayStory.customer_location && (
                      <p className="text-muted-foreground text-sm flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {displayStory.customer_location}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-muted-foreground font-light tracking-wide">
                Coming soon...
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
