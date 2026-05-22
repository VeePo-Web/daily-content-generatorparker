import { memo } from "react";

const MarqueeStrip = () => {
  return (
    <section className="w-full py-5 md:py-6 bg-background">
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground font-light tracking-wide">
          Coming soon...
        </p>
      </div>
    </section>
  );
};

export default memo(MarqueeStrip);
