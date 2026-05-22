import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import ImageZoom from "./ImageZoom";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { easing, timing } from "@/lib/animations";

interface ProductImage {
  id: string;
  image_url: string;
  alt_text?: string | null;
  is_primary: boolean;
  display_order: number;
}

interface ProductImageGalleryProps {
  images?: ProductImage[];
  selectedColor?: string | null;
}

const ProductImageGallery = ({ images, selectedColor }: ProductImageGalleryProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomInitialIndex, setZoomInitialIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<1 | -1>(1);
  const prefersReducedMotion = useReducedMotion();

  // Sort images by display_order, primary first
  const sortedImages = useMemo(() => {
    if (!images || images.length === 0) return [];
    return [...images].sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return a.display_order - b.display_order;
    });
  }, [images]);

  const imageUrls = sortedImages.map(img => img.image_url);

  const nextImage = () => {
    setSwipeDirection(1);
    setCurrentImageIndex((prev) => (prev + 1) % sortedImages.length);
  };

  const prevImage = () => {
    setSwipeDirection(-1);
    setCurrentImageIndex((prev) => (prev - 1 + sortedImages.length) % sortedImages.length);
  };

  const handleImageClick = (index: number) => {
    setZoomInitialIndex(index);
    setIsZoomOpen(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const difference = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(difference) > minSwipeDistance) {
      if (difference > 0) {
        nextImage();
      } else {
        prevImage();
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Animation variants
  const imageRevealVariants = {
    hidden: { 
      clipPath: "inset(0% 100% 0% 0%)",
      opacity: 0
    },
    visible: { 
      clipPath: "inset(0% 0% 0% 0%)",
      opacity: 1,
      transition: {
        clipPath: {
          duration: timing.cinematic,
          ease: easing.editorial,
        },
        opacity: {
          duration: 0.3,
        }
      }
    }
  };

  const kenBurnsVariants = {
    hidden: { scale: 1.15 },
    visible: { 
      scale: 1,
      transition: {
        duration: timing.cinematic * 1.2,
        ease: easing.editorial,
      }
    }
  };

  const subsequentImageVariants = {
    hidden: { 
      opacity: 0, 
      y: 40 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.7,
        ease: easing.editorial,
      }
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    })
  };

  // Placeholder images if no images provided
  if (sortedImages.length === 0) {
    return (
      <div className="w-full">
        <div className="aspect-[3/4] bg-muted flex items-center justify-center">
          <span className="text-6xl opacity-20">✝</span>
        </div>
      </div>
    );
  }

  if (prefersReducedMotion) {
    return (
      <div className="w-full">
        {/* Desktop: Static gallery */}
        <div className="hidden lg:block">
          <div className="space-y-4">
            {sortedImages.map((image, index) => (
              <div 
                key={image.id} 
                className="w-full aspect-[3/4] overflow-hidden cursor-pointer group bg-muted"
                onClick={() => handleImageClick(index)}
              >
                <img
                  src={image.image_url}
                  alt={image.alt_text || `Product view ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading={index > 0 ? "lazy" : "eager"}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: Static slider */}
        <div className="lg:hidden">
          <div className="relative">
            <div 
              className="w-full aspect-[3/4] overflow-hidden cursor-pointer bg-muted"
              onClick={() => handleImageClick(currentImageIndex)}
            >
              <img
                src={sortedImages[currentImageIndex].image_url}
                alt={sortedImages[currentImageIndex].alt_text || `Product view ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex justify-center mt-4 gap-2">
              {sortedImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-foreground' : 'bg-muted-foreground/30'
                  }`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        <ImageZoom
          images={imageUrls}
          initialIndex={zoomInitialIndex}
          isOpen={isZoomOpen}
          onClose={() => setIsZoomOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop: Vertical scrolling gallery with cinematic reveals */}
      <div className="hidden lg:block">
        <div className="space-y-4">
          {sortedImages.map((image, index) => (
            <DesktopImage
              key={image.id}
              image={image}
              index={index}
              onImageClick={handleImageClick}
              imageRevealVariants={imageRevealVariants}
              kenBurnsVariants={kenBurnsVariants}
              subsequentImageVariants={subsequentImageVariants}
            />
          ))}
        </div>
      </div>

      {/* Tablet/Mobile: Image slider with AnimatePresence */}
      <div className="lg:hidden">
        <div className="relative">
          <div 
            className="w-full aspect-[3/4] overflow-hidden cursor-pointer bg-muted touch-pan-y"
            onClick={() => handleImageClick(currentImageIndex)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence mode="wait" custom={swipeDirection}>
              <motion.img
                key={currentImageIndex}
                custom={swipeDirection}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                src={sortedImages[currentImageIndex].image_url}
                alt={sortedImages[currentImageIndex].alt_text || `Product view ${currentImageIndex + 1}`}
                className="w-full h-full object-cover select-none"
              />
            </AnimatePresence>
          </div>
          
          {/* Tap to zoom hint - auto-fade after 3 seconds */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 text-xs font-light text-muted-foreground/80 bg-background/80 backdrop-blur-sm px-3 py-1.5"
          >
            <motion.span
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ delay: 3, duration: 0.5 }}
            >
              Tap to zoom
            </motion.span>
          </motion.div>
          
          {/* Dots indicator with touch-friendly targets */}
          <div className="flex justify-center mt-4 gap-3">
            {sortedImages.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => {
                  setSwipeDirection(index > currentImageIndex ? 1 : -1);
                  setCurrentImageIndex(index);
                }}
                className="w-8 h-8 flex items-center justify-center p-0"
                animate={{
                  scale: index === currentImageIndex ? 1.1 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 20,
                }}
                aria-label={`View image ${index + 1}`}
              >
                <span className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex ? 'bg-foreground' : 'bg-muted-foreground/30'
                }`} />
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      <ImageZoom
        images={imageUrls}
        initialIndex={zoomInitialIndex}
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
      />
    </div>
  );
};

// Desktop image component with scroll-triggered animations
const DesktopImage = ({ 
  image, 
  index, 
  onImageClick,
  imageRevealVariants,
  kenBurnsVariants,
  subsequentImageVariants,
}: {
  image: ProductImage;
  index: number;
  onImageClick: (index: number) => void;
  imageRevealVariants: any;
  kenBurnsVariants: any;
  subsequentImageVariants: any;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  // First image gets special mask reveal treatment
  if (index === 0) {
    return (
      <motion.div
        ref={ref}
        className="w-full aspect-[3/4] overflow-hidden cursor-pointer group bg-muted"
        onClick={() => onImageClick(index)}
        variants={imageRevealVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        whileHover={{ scale: 1.005 }}
        transition={{ scale: { type: "spring", stiffness: 400, damping: 30 } }}
      >
        <motion.img
          src={image.image_url}
          alt={image.alt_text || `Product view ${index + 1}`}
          className="w-full h-full object-cover"
          variants={kenBurnsVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          whileHover={{ scale: 1.05 }}
          transition={{ scale: { duration: 0.6, ease: easing.editorial } }}
        />
      </motion.div>
    );
  }

  // Subsequent images get fadeUp treatment
  return (
    <motion.div
      ref={ref}
      className="w-full aspect-[3/4] overflow-hidden cursor-pointer group bg-muted"
      onClick={() => onImageClick(index)}
      variants={subsequentImageVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      whileHover={{ y: -4 }}
      transition={{ y: { type: "spring", stiffness: 400, damping: 30 } }}
    >
      <motion.img
        src={image.image_url}
        alt={image.alt_text || `Product view ${index + 1}`}
        className="w-full h-full object-cover"
        loading="lazy"
        whileHover={{ scale: 1.05 }}
        transition={{ scale: { duration: 0.5, ease: easing.editorial } }}
      />
    </motion.div>
  );
};

interface ProductImage {
  id: string;
  image_url: string;
  alt_text?: string | null;
  is_primary: boolean;
  display_order: number;
}

export default ProductImageGallery;
