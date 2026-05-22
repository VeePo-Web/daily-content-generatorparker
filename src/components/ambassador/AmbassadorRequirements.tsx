import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const requirements = [
  "You actively share your faith on social media",
  "You have an engaged following (quality over quantity)",
  "You can create content consistently (photos, videos, stories)",
  "You're willing to be tagged and featured publicly",
  "You understand this is ministry, not just marketing",
];

const notForYou = [
  "You just want free stuff",
  "You're not ready to share your faith publicly",
  "You can't commit to regular content creation",
  "You're looking for a quick cash grab",
];

const AmbassadorRequirements = () => {
  return (
    <section className="py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-secondary/30">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 md:mb-24 text-center"
        >
          <span className="text-eyebrow text-muted-foreground block mb-4">
            What we ask
          </span>
          <h2 className="text-section text-foreground mb-6">
            THIS ISN'T FOR EVERYONE.
          </h2>
          <p className="text-editorial text-muted-foreground max-w-2xl mx-auto">
            That's the point. We're building something intentional. If that sounds
            like work, it's probably not for you. If it sounds like calling —
            keep reading.
          </p>
        </motion.div>

        {/* Two column layout */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-16">
          {/* This is for you */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-lg font-light text-foreground mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                <Check className="w-4 h-4 text-accent" />
              </span>
              This is for you if...
            </h3>
            <ul className="space-y-4">
              {requirements.map((req, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start gap-3 text-sm font-light text-foreground/80"
                >
                  <Check className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                  {req}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* This is NOT for you */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-lg font-light text-foreground mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                <X className="w-4 h-4 text-destructive" />
              </span>
              This is NOT for you if...
            </h3>
            <ul className="space-y-4">
              {notForYou.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start gap-3 text-sm font-light text-muted-foreground"
                >
                  <X className="w-4 h-4 text-destructive/60 mt-0.5 shrink-0" />
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center text-sm text-muted-foreground mt-16 md:mt-24 max-w-xl mx-auto"
        >
          Still here? Good. That means you might be exactly who we're looking for.
        </motion.p>
      </div>
    </section>
  );
};

export default AmbassadorRequirements;
