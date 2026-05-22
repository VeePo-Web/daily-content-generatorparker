import { Star, MapPin, Play } from "lucide-react";
import { motion } from "framer-motion";

export interface StoryCardData {
  id: string;
  type: "review" | "story";
  customer_name: string;
  customer_photo_url?: string | null;
  customer_location?: string | null;
  headline?: string;
  story_text: string;
  rating?: number;
  video_url?: string | null;
  product_name?: string;
  product_slug?: string;
  is_contactable?: boolean;
  instagram_handle?: string | null;
}

interface StoryCardProps {
  story: StoryCardData;
  onOpenStory: (story: StoryCardData) => void;
  index: number;
  size?: "regular" | "large" | "wide" | "tablet-wide";
}

export default function StoryCard({ story, onOpenStory, index, size = "regular" }: StoryCardProps) {
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
  };

  // No aspect ratio — grid auto-rows controls height; card fills cell


  // Hero card spans 2 cols + 2 rows on desktop
  const spanClass = size === "large" 
    ? "md:row-span-2 md:col-span-2" 
    : size === "wide" 
      ? "md:col-span-2" 
      : size === "tablet-wide"
        ? "md:col-span-2 lg:col-span-1"
        : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      tabIndex={0}
      role="button"
      className={`group relative cursor-pointer ${spanClass} transition-transform duration-500 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-champagne-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background outline-none`}
      onClick={() => onOpenStory(story)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenStory(story);
        }
      }}
    >
      <div className="h-full min-h-[200px] md:min-h-0 relative overflow-hidden bg-muted border border-white/5">
        {/* Background Image or Placeholder */}
        {story.customer_photo_url ? (
          <img
            src={story.customer_photo_url}
            alt={story.customer_name}
            className="absolute inset-0 w-full h-full object-cover md:grayscale md:group-hover:grayscale-0 transition-all duration-700"
          />
        ) : (
          <div className={`absolute inset-0 ${
            [
              'bg-gradient-to-br from-stone-900 to-stone-800',
              'bg-gradient-to-br from-stone-900/80 to-stone-900',
              'bg-gradient-to-br from-stone-800 to-stone-700',
              'bg-gradient-to-br from-stone-950 to-champagne-950/40',
            ][index % 4]
          }`}>
            <span className="absolute top-6 right-6 text-[60px] font-extralight text-white/[0.06] uppercase leading-none group-hover:scale-110 group-hover:rotate-3 transition-transform duration-700">
              {story.customer_name.charAt(0)}
            </span>
            {index % 2 === 0 && (
              <div 
                className="absolute inset-0 opacity-[0.02]"
                style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)',
                }}
              />
            )}
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />

        {/* Video Play Button */}
        {story.video_url && (
          <div className="absolute top-4 right-4 z-10">
            <motion.div 
              className="w-10 h-10 rounded-full bg-champagne-500 flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <Play className="w-4 h-4 text-stone-900 ml-0.5" fill="currentColor" />
            </motion.div>
          </div>
        )}

        {/* Type Badge (top-left) — always visible */}
        <div className="absolute top-4 left-4 z-10">
          {story.product_name ? (
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/70 font-medium">
              {story.product_name}
            </span>
          ) : (
            <span className={`text-[9px] uppercase tracking-[0.2em] font-medium ${
              story.type === "story" ? "text-champagne-500" : "text-white/50"
            }`}>
              {story.type === "story" ? "Testimony" : "Review"}
            </span>
          )}
        </div>

        {/* AMA Badge */}
        {story.is_contactable && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden group-hover:block">
            <div className="bg-champagne-500 px-2 py-1 -rotate-90 origin-right">
              <span className="text-[9px] uppercase tracking-[0.15em] text-stone-900 font-medium whitespace-nowrap">
                AMA
              </span>
            </div>
          </div>
        )}

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
          {/* Rating — always visible for reviews */}
          {story.rating && (
            <div className="flex items-center gap-0.5 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < story.rating!
                      ? "text-champagne-500 fill-champagne-500"
                      : "text-white/20"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Headline or Story Snippet */}
          <p className={`text-white font-light leading-relaxed mb-4 italic ${
            size === "large" ? "text-base md:text-lg" : "text-sm md:text-base"
          }`}>
            "{truncateText(story.headline || story.story_text, size === "large" ? 120 : 80)}"
          </p>

          {/* Customer Info */}
          <div className="flex items-center gap-3 translate-y-1 group-hover:translate-y-0 transition-transform duration-500">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
              {story.customer_photo_url ? (
                <img 
                  src={story.customer_photo_url} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-xs font-medium">
                  {story.customer_name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <p className="text-white font-medium text-sm">
                {story.customer_name}
              </p>
              {story.customer_location && (
                <p className="text-white/50 text-xs flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5" />
                  {story.customer_location}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
