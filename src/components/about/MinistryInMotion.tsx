import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Instagram, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { staggerContainer, staggerItem } from '@/lib/animations';

const MinistryInMotion = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const { data: ugcPhotos, isLoading } = useQuery({
    queryKey: ['ministry-ugc'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_ugc')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      return data;
    },
  });

  const photos = ugcPhotos;

  // Grid layout classes for bento/masonry effect
  const getGridClass = (index: number) => {
    const layouts = [
      'col-span-2 row-span-2', // Large
      'col-span-1 row-span-1', // Small
      'col-span-1 row-span-1', // Small
      'col-span-1 row-span-2', // Tall
      'col-span-1 row-span-1', // Small
      'col-span-2 row-span-1', // Wide
    ];
    return layouts[index % layouts.length];
  };

  return (
    <section 
      ref={sectionRef}
      className="relative py-24 md:py-32 bg-background overflow-hidden"
    >
      {/* Index watermark */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.03 } : { opacity: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="absolute top-8 right-8 text-[20vw] font-light text-foreground leading-none select-none pointer-events-none z-0"
      >
        04
      </motion.span>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <p className="text-[10px] uppercase tracking-[0.4em] text-champagne-500 mb-4">
            Our Tribe
          </p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-foreground tracking-tight">
              Ministry In<br />
              <span className="text-muted-foreground">Motion</span>
            </h2>
            <p className="text-muted-foreground font-light max-w-sm md:text-right">
              See our Calgary community wearing the mission. Tag @lineofjudah to be featured.
            </p>
          </div>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[200px] md:auto-rows-[220px]"
        >
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={i}
                className={`bg-muted animate-pulse ${getGridClass(i)}`}
              />
            ))
          ) : photos && photos.length > 0 ? (
            <>
              {photos.slice(0, 6).map((photo, index) => (
                <motion.div
                  key={photo.id}
                  variants={staggerItem}
                  className={`group relative overflow-hidden cursor-pointer ${getGridClass(index)}`}
                >
                  <img
                    src={photo.image_url}
                    alt={`${photo.customer_name} wearing Line of Judah`}
                    className="w-full h-full object-cover md:grayscale md:group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-4 md:p-6">
                    <p className="font-light text-lg text-white mb-1">{photo.customer_name}</p>
                    {photo.instagram_handle && (
                      <div className="flex items-center gap-1 text-sm text-white/70">
                        <Instagram className="h-3 w-3" />
                        <span>{photo.instagram_handle}</span>
                      </div>
                    )}
                    {photo.caption && (
                      <p className="text-sm text-white/60 mt-2 italic line-clamp-2">
                        "{photo.caption}"
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </>
          ) : (
            <div className="col-span-full flex items-center justify-center py-16">
              <p className="text-sm text-muted-foreground font-light tracking-wide">
                Coming soon...
              </p>
            </div>
          )}
        </motion.div>

        {/* Community link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <Link 
            to="/community"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <span>See all community stories</span>
            <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default MinistryInMotion;
