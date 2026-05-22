import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Shirt, Scale, Droplets, Ruler } from "lucide-react";
import TextReveal from "@/components/motion/TextReveal";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { easing } from "@/lib/animations";

interface FitFabricSectionProps {
  fitType?: string | null;
  fabricComposition?: string | null;
  weightGsm?: number | null;
  careInstructions?: string | null;
  modelInfo?: string | null;
}

const FitFabricSection = ({
  fitType,
  fabricComposition,
  weightGsm,
  careInstructions,
  modelInfo,
}: FitFabricSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const prefersReducedMotion = useReducedMotion();

  const getWeightDescription = (gsm: number) => {
    if (gsm < 150) return "Lightweight, breathable";
    if (gsm < 200) return "Mid-weight, versatile";
    if (gsm < 280) return "Heavyweight, premium";
    return "Ultra-heavy, substantial";
  };

  const getFitDescription = (fit: string) => {
    switch (fit?.toLowerCase()) {
      case "relaxed":
        return "Roomy through chest and body";
      case "regular":
        return "Classic fit, true to size";
      case "slim":
        return "Tailored, closer to body";
      case "oversized":
        return "Extra room, streetwear silhouette";
      default:
        return "True to size";
    }
  };

  const details = [
    {
      icon: Ruler,
      label: "Fit",
      value: fitType || "Regular",
      description: getFitDescription(fitType || "regular"),
    },
    {
      icon: Shirt,
      label: "Fabric",
      value: fabricComposition || "100% Cotton",
      description: "Durable, breathable, built to last",
    },
    {
      icon: Scale,
      label: "Weight",
      value: weightGsm ? `${weightGsm} GSM` : "200 GSM",
      description: weightGsm ? getWeightDescription(weightGsm) : "Mid-weight, versatile",
    },
    {
      icon: Droplets,
      label: "Care",
      value: careInstructions || "Machine wash cold",
      description: "Tumble dry low, iron if needed",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: easing.editorial,
      }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -20 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 15,
        delay: 0.1,
      }
    }
  };

  if (prefersReducedMotion) {
    return (
      <section className="w-full py-12 lg:py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xs font-light text-muted-foreground uppercase tracking-[0.2em] mb-8 text-center">
            Fit & Fabric
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {details.map(({ icon: Icon, label, value, description }) => (
              <div key={label} className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto flex items-center justify-center border border-border rounded-full">
                  <Icon className="w-5 h-5 text-foreground" strokeWidth={1.5} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-light text-muted-foreground uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-light text-foreground">{value}</p>
                  <p className="text-xs font-light text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>
          {modelInfo && (
            <p className="text-center text-xs font-light text-muted-foreground mt-8 pt-8 border-t border-border">
              {modelInfo}
            </p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="w-full py-12 lg:py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <TextReveal 
            text="Fit & Fabric"
            className="text-xs font-light text-muted-foreground uppercase tracking-[0.2em]"
          />
        </div>

        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {details.map(({ icon: Icon, label, value, description }, index) => (
            <motion.div 
              key={label} 
              className="text-center space-y-3 group"
              variants={cardVariants}
              whileHover={{ y: -4, transition: { type: "spring", stiffness: 400, damping: 20 } }}
            >
              <motion.div 
                className="w-12 h-12 mx-auto flex items-center justify-center border border-border rounded-full group-hover:border-foreground group-hover:shadow-md transition-all duration-300"
                variants={iconVariants}
              >
                <motion.div
                  whileHover={{ rotate: 15 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <Icon className="w-5 h-5 text-foreground" strokeWidth={1.5} />
                </motion.div>
              </motion.div>
              <div className="space-y-1">
                <p className="text-xs font-light text-muted-foreground uppercase tracking-wider">
                  {label}
                </p>
                <p className="text-sm font-light text-foreground">
                  {value}
                </p>
                <p className="text-xs font-light text-muted-foreground">
                  {description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {modelInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <motion.div
              className="mt-8 pt-8 border-t border-border"
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ delay: 0.6, duration: 0.6, ease: easing.editorial }}
              style={{ transformOrigin: "center" }}
            />
            <p className="text-center text-xs font-light text-muted-foreground mt-4">
              {modelInfo}
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default FitFabricSection;
