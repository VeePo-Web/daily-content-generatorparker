import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const tribeMembers = [
  {
    image: "/products/stay-holy-hoodie/male-model.png",
    username: "@marcus_faith",
    location: "Atlanta, USA",
  },
  {
    image: "/products/heavenly-crewneck/female-model.png",
    username: "@aaliyah.believes",
    location: "Toronto, Canada",
  },
  {
    image: "/products/stay-holy-hoodie/female-model-1.png",
    username: "@devon.warrior",
    location: "Calgary, Canada",
  },
  {
    image: "/products/heavenly-crewneck/front-model.png",
    username: "@sarah.crowned",
    location: "Houston, USA",
  },
  {
    image: "/products/stay-holy-hoodie/female-model-2.png",
    username: "@priya.kingdom",
    location: "Vancouver, Canada",
  },
  {
    image: "/products/heavenly-crewneck/lifestyle.png",
    username: "@james.lion",
    location: "London, UK",
  },
  {
    image: "/products/stay-holy-hoodie/flat-front.png",
    username: "@lineofjudah",
    location: "Calgary, Canada",
  },
  {
    image: "/products/heavenly-crewneck/side-view.png",
    username: "@testimony.daily",
    location: "Miami, USA",
  },
];

const StoryWorldwideTribe = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const isMobile = useIsMobile();

  return (
    <section
      ref={sectionRef}
      className="relative bg-stone-950 text-white py-32 md:py-48 overflow-hidden"
    >
      {/* Index watermark */}
      <motion.span
        className="absolute top-10 right-10 lg:top-12 lg:right-12 text-[10px] tracking-[0.4em] text-white/10 font-light"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        07
      </motion.span>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 xl:px-20">
        {/* Section header */}
        <div className="mb-12 lg:mb-16 xl:mb-20">
          <motion.p
            className="text-[10px] tracking-[0.4em] text-champagne-500 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            THE BATTLEFIELD
          </motion.p>
          <motion.h2
            className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Rooted in Calgary<span className="text-champagne-500">.</span>
          </motion.h2>
          <motion.p
            className="text-lg md:text-xl font-light text-white/50 max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Built in Calgary. Worn by the tribe across the city and beyond.
          </motion.p>
        </div>

        {/* Bento grid gallery */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 lg:gap-4 mb-16"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {tribeMembers.map((member, index) => {
            // Create varied sizes for bento effect
            const isLarge = index === 0 || index === 5;
            const isTall = index === 2 || index === 7;

            return (
              <motion.div
                key={index}
                className={`relative overflow-hidden cursor-pointer group ${
                  isLarge ? "md:col-span-2 md:row-span-2" : ""
                } ${isTall ? "row-span-2" : ""}`}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5 + index * 0.05, duration: 0.6 }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                whileHover={{ rotate: Math.random() > 0.5 ? 1 : -1 }}
              >
                <div
                  className={`relative w-full ${
                    isLarge ? "aspect-square" : isTall ? "aspect-[3/4]" : "aspect-square"
                  }`}
                >
                  {/* Image with grayscale → color on hover */}
                  <img
                    src={member.image}
                    alt={`${member.username} wearing Line of Judah`}
                    className={`w-full h-full object-cover transition-all duration-500 ${
                      isMobile ? "scale-100" : hoveredIndex === index ? "grayscale-0 scale-105" : "grayscale"
                    }`}
                  />

                  {/* Overlay gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent transition-opacity duration-300 ${
                      hoveredIndex === index ? "opacity-100" : "opacity-0"
                    }`}
                  />

                  {/* Instagram badge */}
                  <div className="absolute top-3 right-3 p-1.5 bg-stone-950/50 rounded-full opacity-50 group-hover:opacity-100 transition-opacity">
                    <Instagram className="w-3 h-3 text-white" />
                  </div>

                  {/* Username + location reveal */}
                  <motion.div
                    className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 ${
                      hoveredIndex === index
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                    }`}
                  >
                    <p className="text-white text-sm font-medium">{member.username}</p>
                    <p className="text-white/60 text-xs">{member.location}</p>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA strip */}
        <motion.div
          className="flex flex-col md:flex-row items-center lg:items-end justify-between gap-6 pt-10 lg:pt-12 border-t border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <p className="text-white/50 font-light">
            Tag <span className="text-white font-medium">@lineofjudah</span> to join the front line.
          </p>
          <Button
            variant="outline"
            className="group border-white text-white hover:bg-white hover:text-stone-950 bg-transparent px-8"
            onClick={() => window.open("https://instagram.com/lineofjudah", "_blank")}
          >
            <Instagram className="w-4 h-4 mr-2" />
            Follow the Movement
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default StoryWorldwideTribe;
