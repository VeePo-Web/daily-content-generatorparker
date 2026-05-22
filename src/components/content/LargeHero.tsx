const LargeHero = () => {
  return (
    <section className="w-full mb-16 px-6">
      <div className="w-full aspect-[16/9] mb-3 overflow-hidden">
        <img 
          src="/products/stay-holy-hoodie/female-model-1.png" 
          alt="Faith-forward apparel collection" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="">
        <h2 className="text-sm font-normal text-foreground mb-1">
          New Arrivals
        </h2>
        <p className="text-sm font-light text-foreground">
          Premium streetwear designed to inspire and uplift
        </p>
      </div>
    </section>
  );
};

export default LargeHero;
