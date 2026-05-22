import { motion } from "framer-motion";
import { Package, Zap, Users, BadgePercent, Camera } from "lucide-react";

const benefits = [
  {
    index: "01",
    icon: Package,
    title: "Free Clothing",
    description:
      "Every drop, delivered to your door. Wear the collection before anyone else.",
  },
  {
    index: "02",
    icon: Zap,
    title: "Early Access",
    description:
      "First look at new designs. Your input shapes what we create next.",
  },
  {
    index: "03",
    icon: Users,
    title: "Community",
    description:
      "Private group with fellow ambassadors. Iron sharpens iron.",
  },
  {
    index: "04",
    icon: BadgePercent,
    title: "Commission",
    description:
      "Earn on every sale through your unique code. Ministry that pays.",
  },
  {
    index: "05",
    icon: Camera,
    title: "Platform",
    description:
      "We feature you. Your story, your content, amplified to our audience.",
  },
];

const AmbassadorBenefits = () => {
  return (
    <section className="py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-background">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-16 md:mb-24"
      >
        <span className="text-eyebrow text-muted-foreground block mb-4">
          What you get
        </span>
        <h2 className="text-section text-foreground">
          THE TRIBE TAKES CARE OF ITS OWN.
        </h2>
      </motion.div>

      {/* Benefits grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
        {benefits.map((benefit, index) => (
          <motion.div
            key={benefit.index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="group"
          >
            {/* Index number */}
            <span className="text-[80px] md:text-[100px] font-extralight tracking-[-0.02em] leading-none text-foreground/[0.04] block mb-[-30px] md:mb-[-40px]">
              {benefit.index}
            </span>

            {/* Content */}
            <div className="relative border-t border-border pt-6">
              <div className="flex items-start gap-4">
                <benefit.icon className="w-5 h-5 text-accent mt-1 shrink-0" />
                <div>
                  <h3 className="text-lg font-light text-foreground mb-2 group-hover:text-accent transition-colors duration-300">
                    {benefit.title}
                  </h3>
                  <p className="text-sm font-light text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default AmbassadorBenefits;
