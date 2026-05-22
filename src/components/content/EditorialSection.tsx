import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const EditorialSection = () => {
  return (
    <section className="w-full mb-16 px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-4 max-w-[630px]">
          <h2 className="text-2xl font-normal text-foreground leading-tight md:text-xl">
            Apparel With Purpose
          </h2>
          <p className="text-sm font-light text-foreground leading-relaxed">
            Line of Judah was born from a calling to create clothing that speaks truth. 
            We believe that what you wear can be a testament to your faith — a daily 
            reminder of who you are and whose you are. Every piece is designed to inspire 
            conversations and strengthen your walk.
          </p>
          <Link to="/about/our-story" className="inline-flex items-center gap-1 text-sm font-light text-foreground hover:text-foreground/80 transition-colors duration-200">
            <span>Read our full story</span>
            <ArrowRight size={12} />
          </Link>
        </div>
        
        <div className="order-first md:order-last">
          <div className="w-full aspect-square overflow-hidden">
            <img 
              src="/products/heavenly-crewneck/lifestyle.png" 
              alt="Line of Judah lifestyle" 
              className="w-full h-full object-cover" 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default EditorialSection;
