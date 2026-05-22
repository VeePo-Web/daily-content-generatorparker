import { useNavigate } from "react-router-dom";
import { Box } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TryItOnButtonProps {
  productId: string;
  productSlug: string;
  productName: string;
  productPrice: number;
  productImage?: string;
  categorySlug?: string;
}

// Map category slugs to try-on slots
const categoryToSlot: Record<string, string> = {
  headwear: "head",
  hats: "head",
  caps: "head",
  tops: "top",
  shirts: "top",
  "t-shirts": "top",
  tees: "top",
  hoodies: "outerwear",
  sweaters: "outerwear",
  sweatshirts: "outerwear",
  jackets: "outerwear",
  outerwear: "outerwear",
  coats: "outerwear",
  bottoms: "bottom",
  pants: "bottom",
  shorts: "bottom",
  jeans: "bottom",
  footwear: "footwear",
  shoes: "footwear",
  sneakers: "footwear",
  boots: "footwear",
};

const TryItOnButton = ({
  productSlug,
  categorySlug,
}: TryItOnButtonProps) => {
  const navigate = useNavigate();

  const slot = categorySlug ? categoryToSlot[categorySlug.toLowerCase()] || "top" : "top";

  const handleClick = () => {
    navigate(`/try-on?product=${productSlug}&slot=${slot}`);
  };

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      className="w-full h-12 font-light rounded-none border-border hover:bg-muted/50 transition-all group"
    >
      <Box className="w-4 h-4 mr-2 transition-transform group-hover:rotate-12" strokeWidth={1.5} />
      <div className="flex flex-col items-start">
        <span className="text-sm">Try It On</span>
        <span className="text-xs text-muted-foreground">See how it looks on you</span>
      </div>
    </Button>
  );
};

export default TryItOnButton;
