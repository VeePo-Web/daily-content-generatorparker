import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const PLPTestimonialStrip = () => {
  const { data: review } = useQuery({
    queryKey: ["featured-review-plp"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("is_featured", true)
        .eq("is_approved", true)
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });

  if (!review) return null;

  return (
    <section className="w-full px-4 md:px-6 py-10 md:py-12 my-6 md:my-8 bg-muted/30 border-y border-border">
      <div className="max-w-2xl mx-auto text-center">
        {/* Stars */}
        <div className="flex justify-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < review.rating
                  ? "fill-champagne-500 text-champagne-500"
                  : "text-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        {/* Quote */}
        <blockquote className="text-lg md:text-xl font-light text-foreground mb-4 leading-relaxed">
          "{review.review_text}"
        </blockquote>

        {/* Attribution */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {review.customer_name}
          </span>
          {review.customer_location && (
            <>
              <span>·</span>
              <span>{review.customer_location}</span>
            </>
          )}
        </div>

        {/* CTA */}
        <Link
          to="/about/customer-care"
          className="inline-flex items-center min-h-[44px] px-2 py-2 -mx-2 mt-4 md:mt-6 text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors"
        >
          Read More Reviews →
        </Link>
      </div>
    </section>
  );
};

export default PLPTestimonialStrip;
