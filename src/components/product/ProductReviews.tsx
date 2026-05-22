import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, useInView } from "framer-motion";
import { Star, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ScrollReveal from "@/components/motion/ScrollReveal";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { easing } from "@/lib/animations";

interface ProductReviewsProps {
  productId?: string;
}

const CustomStar = ({ filled }: { filled: boolean }) => (
  <Star
    className={`w-3.5 h-3.5 ${filled ? "fill-foreground text-foreground" : "text-muted-foreground/30"}`}
    strokeWidth={1.5}
  />
);

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const [sortBy, setSortBy] = useState<string>("recent");
  const [filterRating, setFilterRating] = useState<string>("all");
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
  const prefersReducedMotion = useReducedMotion();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: async () => {
      const query = supabase
        .from("reviews")
        .select("*")
        .eq("is_approved", true);

      if (productId) {
        query.eq("product_id", productId);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const filteredReviews = reviews
    .filter((review) => {
      if (filterRating === "all") return true;
      return review.rating === parseInt(filterRating);
    })
    .sort((a, b) => {
      if (sortBy === "highest") return b.rating - a.rating;
      if (sortBy === "lowest") return a.rating - b.rating;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: reviews.length > 0
      ? (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100
      : 0,
  }));

  // AI-highlighted insights (mock - would be generated)
  const insights = reviews.length > 0 ? [
    { label: "Runs true to size", count: Math.floor(reviews.length * 0.8) },
    { label: "Great quality", count: Math.floor(reviews.length * 0.9) },
    { label: "Built right", count: Math.floor(reviews.length * 0.7) },
  ] : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: easing.editorial,
      }
    }
  };

  if (isLoading) {
    return (
      <section className="w-full py-12 lg:py-16 px-6">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-6 bg-muted rounded w-32 mx-auto mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (prefersReducedMotion) {
    return (
      <section className="w-full py-12 lg:py-16 px-6 bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xs font-light text-muted-foreground uppercase tracking-[0.2em] mb-8 text-center">
            Customer Reviews
          </h2>
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm font-light text-muted-foreground">
                No reviews yet. Be the first to share your experience.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                    <span className="text-4xl font-light text-foreground">{averageRating.toFixed(1)}</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <CustomStar key={star} filled={star <= Math.round(averageRating)} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm font-light text-muted-foreground">
                    Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="space-y-2">
                  {ratingCounts.map(({ rating, count, percentage }) => (
                    <button key={rating} onClick={() => setFilterRating(filterRating === rating.toString() ? "all" : rating.toString())} className="flex items-center gap-2 w-full group">
                      <span className="text-xs font-light text-muted-foreground w-4">{rating}</span>
                      <Star className="w-3 h-3 text-foreground fill-foreground" />
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-foreground" style={{ width: `${percentage}%` }} />
                      </div>
                      <span className="text-xs font-light text-muted-foreground w-6 text-right">{count}</span>
                    </button>
                  ))}
                </div>
                {insights.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center lg:justify-end items-start">
                    {insights.map(({ label, count }) => (
                      <span key={label} className="inline-flex items-center gap-1 px-3 py-1.5 bg-background border border-border text-xs font-light text-muted-foreground">
                        <ThumbsUp className="w-3 h-3" />
                        {label}
                        <span className="text-foreground ml-1">{count}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
                <div className="flex items-center gap-4">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[140px] h-9 text-xs font-light border-border">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="highest">Highest Rated</SelectItem>
                      <SelectItem value="lowest">Lowest Rated</SelectItem>
                    </SelectContent>
                  </Select>
                  {filterRating !== "all" && (
                    <Button variant="ghost" size="sm" onClick={() => setFilterRating("all")} className="text-xs font-light h-9">
                      Clear filter
                    </Button>
                  )}
                </div>
                <span className="text-xs font-light text-muted-foreground">
                  {filteredReviews.length} review{filteredReviews.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="space-y-8">
                {filteredReviews.map((review) => (
                  <div key={review.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex">{[1, 2, 3, 4, 5].map((star) => (<CustomStar key={star} filled={star <= review.rating} />))}</div>
                        <span className="text-sm font-light text-foreground">{review.customer_name}</span>
                        {review.customer_location && <span className="text-xs font-light text-muted-foreground">· {review.customer_location}</span>}
                      </div>
                      <span className="text-xs font-light text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                    <p className="text-sm font-light text-muted-foreground leading-relaxed">{review.review_text}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="w-full py-12 lg:py-16 px-6 bg-muted/20">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal variant="fadeUp">
          <h2 className="text-xs font-light text-muted-foreground uppercase tracking-[0.2em] mb-8 text-center">
            Customer Reviews
          </h2>
        </ScrollReveal>

        {reviews.length === 0 ? (
          <ScrollReveal variant="fadeUp" delay={0.2}>
            <div className="text-center py-12">
              <p className="text-sm font-light text-muted-foreground">
                No reviews yet. Be the first to share your experience.
              </p>
            </div>
          </ScrollReveal>
        ) : (
          <>
            {/* Summary */}
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12"
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              {/* Average Rating */}
              <motion.div 
                className="text-center lg:text-left"
                variants={itemVariants}
              >
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                  <motion.span 
                    className="text-4xl font-light text-foreground"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.5, delay: 0.2, type: "spring" as const, stiffness: 200 }}
                  >
                    {averageRating.toFixed(1)}
                  </motion.span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star, index) => (
                      <motion.div
                        key={star}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                        transition={{ delay: 0.3 + index * 0.1, type: "spring" as const, stiffness: 400 }}
                      >
                        <CustomStar filled={star <= Math.round(averageRating)} />
                      </motion.div>
                    ))}
                  </div>
                </div>
                <p className="text-sm font-light text-muted-foreground">
                  Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                </p>
              </motion.div>

              {/* Rating Breakdown */}
              <motion.div 
                className="space-y-2"
                variants={itemVariants}
              >
                {ratingCounts.map(({ rating, count, percentage }, index) => (
                  <button
                    key={rating}
                    onClick={() => setFilterRating(filterRating === rating.toString() ? "all" : rating.toString())}
                    className="flex items-center gap-2 w-full group"
                  >
                    <span className="text-xs font-light text-muted-foreground w-4">
                      {rating}
                    </span>
                    <Star className="w-3 h-3 text-foreground fill-foreground" />
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-foreground"
                        initial={{ width: 0 }}
                        animate={isInView ? { width: `${percentage}%` } : { width: 0 }}
                        transition={{ 
                          delay: 0.5 + index * 0.1, 
                          duration: 0.6, 
                          ease: easing.editorial 
                        }}
                      />
                    </div>
                    <span className="text-xs font-light text-muted-foreground w-6 text-right">
                      {count}
                    </span>
                  </button>
                ))}
              </motion.div>

              {/* AI Insights */}
              {insights.length > 0 && (
                <motion.div 
                  className="flex flex-wrap gap-2 justify-center lg:justify-end items-start"
                  variants={containerVariants}
                >
                  {insights.map(({ label, count }, index) => (
                    <motion.span
                      key={label}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-background border border-border text-xs font-light text-muted-foreground"
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 10 }}
                      transition={{ 
                        delay: 0.7 + index * 0.1, 
                        type: "spring" as const, 
                        stiffness: 400, 
                        damping: 20 
                      }}
                      whileHover={{ scale: 1.05, y: -2 }}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      {label}
                      <span className="text-foreground ml-1">{count}</span>
                    </motion.span>
                  ))}
                </motion.div>
              )}
            </motion.div>

            {/* Filters */}
            <motion.div 
              className="flex items-center justify-between mb-6 pb-6 border-b border-border"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
            >
              <div className="flex items-center gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px] h-9 text-xs font-light border-border">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="highest">Highest Rated</SelectItem>
                    <SelectItem value="lowest">Lowest Rated</SelectItem>
                  </SelectContent>
                </Select>

                {filterRating !== "all" && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFilterRating("all")}
                      className="text-xs font-light h-9"
                    >
                      Clear filter
                    </Button>
                  </motion.div>
                )}
              </div>

              <span className="text-xs font-light text-muted-foreground">
                {filteredReviews.length} review{filteredReviews.length !== 1 ? "s" : ""}
              </span>
            </motion.div>

            {/* Reviews List */}
            <motion.div 
              className="space-y-8"
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
            >
              {filteredReviews.map((review, index) => (
                <motion.div 
                  key={review.id} 
                  className="space-y-3"
                  variants={itemVariants}
                  custom={index}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <CustomStar key={star} filled={star <= review.rating} />
                        ))}
                      </div>
                      <span className="text-sm font-light text-foreground">
                        {review.customer_name}
                      </span>
                      {review.customer_location && (
                        <span className="text-xs font-light text-muted-foreground">
                          · {review.customer_location}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-light text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-sm font-light text-muted-foreground leading-relaxed">
                    {review.review_text}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
};

export default ProductReviews;
