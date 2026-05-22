import { Link } from "react-router-dom";

const FiftyFiftySection = () => {
  return (
    <section className="w-full mb-16 px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Link to="/category/hoodies" className="block">
            <div className="w-full aspect-square mb-3 overflow-hidden">
              <img 
                src="/products/stay-holy-hoodie/male-model.png" 
                alt="Hoodies collection" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>
          <div className="">
            <h3 className="text-sm font-normal text-foreground mb-1">
              Hoodies
            </h3>
            <p className="text-sm font-light text-foreground">
              Premium armor for bold faith statements
            </p>
          </div>
        </div>

        <div>
          <Link to="/category/tops" className="block">
            <div className="w-full aspect-square mb-3 overflow-hidden">
              <img 
                src="/products/heavenly-crewneck/front-model.png" 
                alt="Tops collection" 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>
          <div className="">
            <h3 className="text-sm font-normal text-foreground mb-1">
              Crewnecks & Tees
            </h3>
            <p className="text-sm font-light text-foreground">
              Everyday essentials that make a statement
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FiftyFiftySection;
