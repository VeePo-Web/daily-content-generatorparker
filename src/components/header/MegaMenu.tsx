import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface SubCategory {
  name: string;
  href: string;
}

interface MenuItem {
  name: string;
  href: string;
  subcategories?: SubCategory[];
}

interface MenuImage {
  src: string;
  alt: string;
  label: string;
}

interface MegaMenuProps {
  isOpen: boolean;
  activeDropdown: string | null;
  items: MenuItem[];
  images: MenuImage[];
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const containerVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1] as const,
      staggerChildren: 0.04,
      delayChildren: 0.08,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1] as const,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
  },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 1.05 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const, delay: 0.15 },
  },
};

const MegaMenu = ({
  isOpen,
  activeDropdown,
  items,
  images,
  onMouseEnter,
  onMouseLeave,
}: MegaMenuProps) => {
  // Determine link destinations for images
  const getImageLink = (imageLabel: string) => {
    if (activeDropdown === "Shop") {
      if (imageLabel === "Hoodies") return "/category/hoodies";
      if (imageLabel === "Tees") return "/category/tees";
    } else if (activeDropdown === "About") {
      return "/about/our-story";
    }
    return "/";
  };

  return (
    <AnimatePresence>
      {isOpen && items.length > 0 && (
        <motion.div
          className="absolute top-full left-0 right-0 bg-background border-b border-border z-50 shadow-lg"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div className="px-8 py-10">
            <div className="flex justify-between w-full">
              {/* Left side - Menu items with subcategories */}
              <div className="flex-1">
                <div className="flex gap-16">
                  {items.map((subItem, index) => (
                    <motion.div
                      key={index}
                      className="min-w-[150px]"
                      variants={itemVariants}
                    >
                      <Link
                        to={subItem.href}
                        className="group relative text-foreground hover:text-muted-foreground transition-colors duration-200 text-sm font-medium block pb-3 border-b border-border/40 mb-4"
                      >
                        <span className="relative inline-flex items-center gap-2">
                          {subItem.name}
                          <motion.span
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            initial={{ x: -4 }}
                            whileHover={{ x: 0 }}
                          >
                            <ArrowRight size={12} />
                          </motion.span>
                        </span>
                      </Link>
                      {subItem.subcategories && subItem.subcategories.length > 0 && (
                        <ul className="space-y-2.5">
                          {subItem.subcategories.map((sub, subIndex) => (
                            <motion.li
                              key={subIndex}
                              variants={itemVariants}
                            >
                              <Link
                                to={sub.href}
                                className="group relative text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm font-light block py-0.5"
                              >
                                <span className="relative">
                                  {sub.name}
                                  <motion.span
                                    className="absolute -bottom-0.5 left-0 h-px bg-foreground/30 origin-left"
                                    initial={{ scaleX: 0 }}
                                    whileHover={{ scaleX: 1 }}
                                    transition={{ duration: 0.25 }}
                                    style={{ width: "100%" }}
                                  />
                                </span>
                              </Link>
                            </motion.li>
                          ))}
                        </ul>
                      )}
                    </motion.div>
                  ))}
                </div>
                
                {/* View All CTA */}
                <motion.div 
                  className="mt-8 pt-6 border-t border-border/30"
                  variants={itemVariants}
                >
                  <Link
                    to={activeDropdown === "Shop" ? "/category/shop" : "/about/our-story"}
                    className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-muted-foreground transition-colors group"
                  >
                    <span>View All {activeDropdown}</span>
                    <motion.span
                      initial={{ x: 0 }}
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowRight size={14} />
                    </motion.span>
                  </Link>
                </motion.div>
              </div>

              {/* Right side - Portrait Images */}
              <div className="flex gap-4">
                {images.map((image, index) => (
                  <motion.div
                    key={index}
                    variants={imageVariants}
                    className="overflow-hidden"
                  >
                    <Link
                      to={getImageLink(image.label)}
                      className="w-[220px] h-[300px] cursor-pointer group relative overflow-hidden block"
                    >
                      <motion.div
                        className="w-full h-full"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                      >
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {/* Label */}
                      <div
                        className="absolute bottom-4 left-4 right-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200"
                      >
                        <span className="text-white text-sm font-light flex items-center gap-2">
                          {image.label}
                          <ArrowRight size={14} />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MegaMenu;
