import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import StoryCard, { StoryCardData } from "./StoryCard";
import StoryModal from "./StoryModal";
import { motion } from "framer-motion";

interface StoryGridProps {
  selectedProduct?: string;
  selectedType?: string;
  selectedGender?: string;
  sortBy?: string;
}

const ITEMS_PER_PAGE = 12;

export default function StoryGrid({
  selectedProduct = "all",
  selectedType = "all",
  selectedGender = "all",
  sortBy = "recent",
}: StoryGridProps) {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [selectedStory, setSelectedStory] = useState<StoryCardData | null>(null);

  const { data: stories, isLoading: storiesLoading } = useQuery({
    queryKey: ["community-stories", selectedProduct, selectedType, selectedGender, sortBy],
    queryFn: async () => {
      let query = supabase
        .from("community_stories")
        .select(`
          id, customer_name, customer_photo_url, customer_location,
          headline, story_text, video_url, gender, is_contactable,
          instagram_handle, is_featured, product_id,
          products (name, slug)
        `)
        .eq("is_approved", true);

      if (selectedGender !== "all") query = query.eq("gender", selectedGender);
      if (sortBy === "featured") query = query.order("is_featured", { ascending: false });
      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ["community-reviews", selectedProduct, selectedType, selectedGender, sortBy],
    queryFn: async () => {
      let query = supabase
        .from("reviews")
        .select(`
          id, customer_name, customer_avatar_url, customer_location,
          review_text, rating, video_url, gender, is_contactable,
          is_featured, product_id,
          products (name, slug)
        `)
        .eq("is_approved", true);

      if (selectedGender !== "all") query = query.eq("gender", selectedGender);
      if (sortBy === "featured") query = query.order("is_featured", { ascending: false });
      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const allStories: StoryCardData[] = [
    ...(stories || []).map((s: any) => ({
      id: s.id,
      type: "story" as const,
      customer_name: s.customer_name,
      customer_photo_url: s.customer_photo_url,
      customer_location: s.customer_location,
      headline: s.headline,
      story_text: s.story_text,
      video_url: s.video_url,
      product_name: s.products?.name,
      product_slug: s.products?.slug,
      is_contactable: s.is_contactable,
      instagram_handle: s.instagram_handle,
    })),
    ...((selectedType === "all" || selectedType === "product_review") && reviews
      ? reviews.map((r: any) => ({
          id: r.id,
          type: "review" as const,
          customer_name: r.customer_name,
          customer_photo_url: r.customer_avatar_url,
          customer_location: r.customer_location,
          story_text: r.review_text,
          rating: r.rating,
          video_url: r.video_url,
          product_name: r.products?.name,
          product_slug: r.products?.slug,
          is_contactable: r.is_contactable,
        }))
      : []),
  ];

  const filteredStories = selectedProduct === "all"
    ? allStories
    : allStories.filter((s) => s.product_slug === selectedProduct);

  const visibleStories = filteredStories.slice(0, visibleCount);
  const hasMore = visibleCount < filteredStories.length;
  const isLoading = storiesLoading || reviewsLoading;

  // Bento sizes: first card hero, every 7th large, every 5th wide
  const getCardSize = (index: number): "regular" | "large" | "wide" | "tablet-wide" => {
    if (index === 0) return "large";
    if (displayStories.length > 9) {
      if (index % 7 === 0) return "large";
      if (index % 5 === 0) return "wide";
    }
    // Last card orphan fix for 2-col tablet grid
    if (index === displayStories.length - 1 && (displayStories.length - 1) % 2 !== 0) return "tablet-wide";
    return "regular";
  };

  if (isLoading) {
    return (
      <section className="py-12 lg:py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 auto-rows-[280px]">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className={`${i === 0 ? "row-span-2 md:col-span-2" : ""}`} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const displayStories = visibleStories;

  if (!isLoading && displayStories.length === 0) {
    return (
      <section className="py-12 lg:py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-muted-foreground font-light tracking-wide">
              Coming soon...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 lg:py-16 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section header - editorial index */}
        <div className="flex items-baseline gap-4 mb-10">
          <span className="text-[10px] uppercase tracking-[0.2em] text-champagne-500 font-medium">02</span>
          <div className="h-px flex-1 bg-border" />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
          >
            Stories From The Tribe · {displayStories.length}
          </motion.p>
        </div>

        {/* Bento Grid — adaptive columns based on item count */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 auto-rows-auto md:auto-rows-[280px] lg:auto-rows-[300px]">
          {displayStories.map((story, index) => (
            <StoryCard
              key={story.id}
              story={story}
              onOpenStory={setSelectedStory}
              index={index}
              size={getCardSize(index)}
            />
          ))}
        </div>

        {hasMore && (
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex justify-center mt-10"
          >
            <Button
              variant="outline"
              size="lg"
              onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
              className="border-foreground text-foreground hover:bg-foreground hover:text-background rounded-none px-12 text-xs uppercase tracking-[0.2em]"
            >
              Load More Stories
            </Button>
          </motion.div>
        )}

        {!hasMore && displayStories.length > 0 && (
          <div className="flex items-center gap-4 mt-12">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">End of stories</span>
            <div className="h-px flex-1 bg-border" />
          </div>
        )}

        <StoryModal
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
        />
      </div>
    </section>
  );
}
