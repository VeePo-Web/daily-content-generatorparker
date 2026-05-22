import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Quote } from "lucide-react";

interface TestimonialSnippetProps {
  productId?: string;
}

const TestimonialSnippet = ({ productId }: TestimonialSnippetProps) => {
  const { data: review } = useQuery({
    queryKey: ["featured-review", productId],
    queryFn: async () => {
      let query = supabase
        .from("reviews")
        .select("*")
        .eq("is_approved", true)
        .eq("is_featured", true)
        .gte("rating", 4);

      if (productId) {
        query = query.eq("product_id", productId);
      }

      const { data, error } = await query.limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (!review) return null;

  // Truncate to a snippet
  const snippet = review.review_text.length > 60 
    ? review.review_text.substring(0, 60).trim() + "..."
    : review.review_text;

  return (
    <div className="flex items-start gap-2 py-3">
      <Quote className="w-3 h-3 text-muted-foreground flex-shrink-0 mt-0.5 rotate-180" strokeWidth={1.5} />
      <p className="text-sm font-light text-muted-foreground italic">
        "{snippet}"
        <span className="not-italic text-foreground ml-2">
          — {review.customer_name}
          {review.customer_location && `, ${review.customer_location}`}
        </span>
      </p>
    </div>
  );
};

export default TestimonialSnippet;
