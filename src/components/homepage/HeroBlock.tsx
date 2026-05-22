import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

const HeroBlock = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section className="relative w-full h-[100dvh] min-h-[600px] max-h-[900px] overflow-hidden">
      {/* Background Image/Video */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60 z-10"
        />
        {/* Hero Background - Using a gradient placeholder, can be replaced with video/image */}
        <div 
          className="w-full h-full bg-gradient-to-br from-stone-900 via-stone-800 to-stone-800"
          style={{
            backgroundImage: `url('/products/stay-holy-hoodie/male-model.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
          }}
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-20 h-full flex flex-col justify-center items-center text-center px-6">
        <div 
          className={`max-w-4xl transition-all duration-1000 ease-out ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Eyebrow Text */}
          <p 
            className="text-champagne-400/90 text-sm tracking-[0.3em] uppercase mb-6 font-light"
            style={{ transitionDelay: '200ms' }}
          >
            Faith-Forward Fashion
          </p>

          {/* Main Headline */}
          <h1 
            className="text-white text-4xl md:text-6xl lg:text-7xl font-light leading-tight mb-6"
            style={{ 
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: '-0.02em'
            }}
          >
            Wear Your Faith.
            <br />
            <span className="text-champagne-400">Live Your Purpose.</span>
          </h1>

          {/* Subheadline */}
          <p 
            className={`text-white/80 text-lg md:text-xl font-light max-w-2xl mx-auto mb-10 transition-all duration-1000 ease-out ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            Premium Christian apparel designed for the modern believer. 
            Bold statements. Timeless faith.
          </p>

          {/* CTAs */}
          <div 
            className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-1000 ease-out ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '600ms' }}
          >
            <Button 
              asChild
              size="lg"
              className="bg-forest-500 hover:bg-forest-400 text-white font-medium px-8 py-6 text-base rounded-none group"
            >
              <Link to="/category/shop">
                Shop the Collection
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>

            <Button 
              asChild
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 font-light px-8 py-6 text-base rounded-none bg-transparent"
            >
              <Link to="/about/our-story">
                Learn Our Story
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div 
        className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 transition-all duration-1000 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ transitionDelay: '1000ms' }}
      >
        <div className="flex flex-col items-center text-white/60">
          <span className="text-xs tracking-widest uppercase mb-2">Scroll</span>
          <div className="w-px h-8 bg-white/30" />
        </div>
      </div>
    </section>
  );
};

export default HeroBlock;
