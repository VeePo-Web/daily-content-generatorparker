import { motion } from "framer-motion";

const CurrentAmbassadors = () => {
  return (
    <section className="py-16 md:py-20 px-6 md:px-12 lg:px-24 bg-background border-t border-border">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <span className="text-eyebrow text-muted-foreground block mb-2">
            Meet the tribe
          </span>
        </motion.div>

        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-muted-foreground font-light tracking-wide">
            Coming soon...
          </p>
        </div>
      </div>
    </section>
  );
};

export default CurrentAmbassadors;
