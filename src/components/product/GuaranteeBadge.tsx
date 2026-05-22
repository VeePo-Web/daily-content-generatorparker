import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Shield, Lock, CreditCard, Truck } from "lucide-react";
import TextReveal from "@/components/motion/TextReveal";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { easing } from "@/lib/animations";

const GuaranteeBadge = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
  const prefersReducedMotion = useReducedMotion();

  const trustSignals = [
    { icon: Lock, label: "Secure Checkout" },
    { icon: CreditCard, label: "Encrypted Payment" },
    { icon: Truck, label: "Fast Shipping" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.5,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: easing.editorial,
      }
    }
  };

  if (prefersReducedMotion) {
    return (
      <section className="w-full py-12 lg:py-16 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-foreground" strokeWidth={1.5} />
            <h2 className="text-xl lg:text-2xl font-light text-foreground">
              30-Day Risk-Free Ministry Test
            </h2>
          </div>
          <p className="text-sm font-light text-muted-foreground max-w-xl mx-auto mb-8">
            Not feeling called? No problem. Return any unworn item within 30 days for a full refund, no questions asked. 
            Your faith journey is personal—we're here to support it.
          </p>
          <div className="flex items-center justify-center gap-8 lg:gap-12 flex-wrap">
            {trustSignals.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-muted-foreground">
                <Icon className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-xs font-light">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="w-full py-12 lg:py-16 px-6 bg-muted/30">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main Guarantee */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -20 }}
            transition={{ type: "tween" as const, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
          >
            <Shield className="w-8 h-8 text-foreground" strokeWidth={1.5} />
          </motion.div>
          <TextReveal 
            text="30-Day Risk-Free Ministry Test"
            as="h2"
            className="text-xl lg:text-2xl font-light text-foreground"
            delay={0.2}
          />
        </div>

        <motion.p 
          className="text-sm font-light text-muted-foreground max-w-xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.4, duration: 0.5, ease: easing.editorial }}
        >
          Not feeling called? No problem. Return any unworn item within 30 days for a full refund, no questions asked. 
          Your faith journey is personal—we're here to support it.
        </motion.p>

        {/* Trust Signals */}
        <motion.div 
          className="flex items-center justify-center gap-8 lg:gap-12 flex-wrap"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {trustSignals.map(({ icon: Icon, label }) => (
            <motion.div 
              key={label} 
              className="flex items-center gap-2 text-muted-foreground"
              variants={itemVariants}
              whileHover={{ y: -2 }}
              transition={{ type: "spring" as const, stiffness: 400, damping: 20 }}
            >
              <Icon className="w-4 h-4" strokeWidth={1.5} />
              <span className="text-xs font-light">{label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default GuaranteeBadge;
