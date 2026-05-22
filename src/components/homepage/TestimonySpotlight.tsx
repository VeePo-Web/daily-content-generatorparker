import { memo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/motion/ScrollReveal";

const TestimonySpotlight = () => {
  return (
    <section className="w-full bg-stone-950 text-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[70vh] md:min-h-[80vh]">
        {/* Typographic editorial panel (replaces former lifestyle photo) */}
        <div className="relative min-h-[50vh] md:min-h-[60vh] lg:min-h-full flex items-center justify-center px-6 md:px-12 lg:px-16 border-r border-white/10">
          <div className="text-center max-w-md">
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 mb-8">
              Exodus 28:2
            </p>
            <p className="text-2xl md:text-3xl lg:text-4xl font-light leading-snug tracking-tight">
              "And thou shalt make<br />
              <span className="text-white/60">holy garments</span><br />
              for glory and for beauty."
            </p>
            <div className="w-12 h-px bg-white/30 mx-auto mt-10" />
          </div>
        </div>

        <div className="flex items-center p-6 xs:p-8 md:p-12 lg:p-16 bg-stone-100 text-stone-950">
          <div className="max-w-lg w-full">
            <ScrollReveal variant="fadeUp" delay={0.1}>
              <p className="text-xs uppercase tracking-[0.2em] text-accent mb-6">From the tribe</p>
            </ScrollReveal>

            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-muted-foreground font-light tracking-wide">
                Coming soon...
              </p>
            </div>

            <ScrollReveal variant="fadeUp" delay={0.3}>
              <Link 
                to="/community"
                className="inline-flex items-center gap-2 text-stone-900 text-sm font-light hover:text-champagne-600 transition-colors group touch-target py-3 -my-3"
              >
                Read More Stories
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(TestimonySpotlight);
