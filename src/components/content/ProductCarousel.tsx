import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  image: string;
  hoverImage: string;
  isNew?: boolean;
}

const products: Product[] = [
  {
    id: 1,
    name: "Heavenly Crewneck",
    category: "Tops",
    price: "$65",
    image: "/products/heavenly-crewneck/front-model.png",
    hoverImage: "/products/heavenly-crewneck/flat-lay.png",
    isNew: true,
  },
  {
    id: 2,
    name: "Stay Holy Hoodie",
    category: "Hoodies",
    price: "$85",
    image: "/products/stay-holy-hoodie/male-model.png",
    hoverImage: "/products/stay-holy-hoodie/flat-front.png",
    isNew: true,
  },
  {
    id: 3,
    name: "Heavenly Crewneck",
    category: "Tops",
    price: "$65",
    image: "/products/heavenly-crewneck/female-model.png",
    hoverImage: "/products/heavenly-crewneck/lifestyle.png",
  },
  {
    id: 4,
    name: "Stay Holy Hoodie",
    category: "Hoodies",
    price: "$85",
    image: "/products/stay-holy-hoodie/female-model-1.png",
    hoverImage: "/products/stay-holy-hoodie/female-model-2.png",
  },
  {
    id: 5,
    name: "Heavenly Crewneck",
    category: "Tops",
    price: "$65",
    image: "/products/heavenly-crewneck/side-view.png",
    hoverImage: "/products/heavenly-crewneck/front-model.png",
  },
  {
    id: 6,
    name: "Stay Holy Hoodie",
    category: "Hoodies",
    price: "$85",
    image: "/products/stay-holy-hoodie/flat-full.png",
    hoverImage: "/products/stay-holy-hoodie/male-model.png",
  },
];

const ProductCarousel = () => {
  return (
    <section className="w-full mb-16 px-6">
      <Carousel
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="">
            {products.map((product) => (
               <CarouselItem
                 key={product.id}
                 className="basis-1/2 md:basis-1/3 lg:basis-1/4 pr-2 md:pr-4"
               >
                 <Link to={`/product/${product.id}`}>
                  <Card className="border-none shadow-none bg-transparent group">
                    <CardContent className="p-0">
                      <div className="aspect-square mb-3 overflow-hidden bg-muted/10 relative">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover transition-all duration-300 group-hover:opacity-0"
                        />
                        <img
                          src={product.hoverImage}
                          alt={`${product.name} alternate view`}
                          className="absolute inset-0 w-full h-full object-cover transition-all duration-300 opacity-0 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-black/[0.03]"></div>
                        {product.isNew && (
                          <div className="absolute top-2 left-2 px-2 py-1 text-xs font-medium text-black">
                            NEW
                          </div>
                        )}
                      </div>
                     <div className="space-y-1">
                       <p className="text-sm font-light text-foreground">
                         {product.category}
                       </p>
                       <div className="flex justify-between items-center">
                         <h3 className="text-sm font-medium text-foreground">
                           {product.name}
                         </h3>
                         <p className="text-sm font-light text-foreground">
                           {product.price}
                         </p>
                       </div>
                     </div>
                   </CardContent>
                 </Card>
                 </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
    </section>
  );
};

export default ProductCarousel;
