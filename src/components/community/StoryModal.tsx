import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, MapPin, MessageCircle, Instagram, ExternalLink, Share2 } from "lucide-react";
import { StoryCardData } from "./StoryCard";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface StoryModalProps {
  story: StoryCardData | null;
  onClose: () => void;
}

export default function StoryModal({ story, onClose }: StoryModalProps) {
  if (!story) return null;

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Share this testimony with your community.",
      });
    } catch {
      toast({
        title: "Couldn't copy link",
        description: "Please copy the URL manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={!!story} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <div className="grid md:grid-cols-5 gap-0">
          {/* Left: Image/Video (60%) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="md:col-span-3 relative aspect-[4/3] md:aspect-auto md:min-h-[600px] bg-muted"
          >
            {story.video_url ? (
              <iframe
                src={story.video_url}
                className="w-full h-full"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            ) : story.customer_photo_url ? (
              <img
                src={story.customer_photo_url}
                alt={story.customer_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-900">
                <span className="text-[120px] font-extralight text-stone-300/50 dark:text-stone-700/50 uppercase">
                  {story.customer_name.charAt(0)}
                </span>
              </div>
            )}

            {/* Type badge - Rotated */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 hidden md:block">
              <div className="bg-champagne-500 px-3 py-1.5 -rotate-90 origin-left">
                <span className="text-[9px] uppercase tracking-[0.2em] text-stone-900 font-medium whitespace-nowrap">
                  {story.type === "review" ? "Review" : "Testimony"}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right: Content (40%) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="md:col-span-2 p-6 lg:p-10 flex flex-col relative scroll-mt-4"
          >
            {/* Decorative quote marks */}
            <div className="absolute -top-4 -left-2 text-[100px] leading-none text-champagne-500/10 font-serif select-none pointer-events-none hidden md:block">
              "
            </div>

            <DialogHeader className="text-left mb-8 relative z-10">
              <DialogDescription className="sr-only">
                Read the full story from {story.customer_name}
              </DialogDescription>
              {/* Rating */}
              {story.rating && (
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < story.rating!
                          ? "text-champagne-500 fill-champagne-500"
                          : "text-muted"
                      }`}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">
                    {story.rating}/5
                  </span>
                </div>
              )}

              <DialogTitle className="text-2xl lg:text-3xl font-light leading-tight italic">
                {story.headline ? `"${story.headline}"` : `"${story.story_text.slice(0, 60)}..."`}
              </DialogTitle>
            </DialogHeader>

            {/* Customer Info */}
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border">
              {story.customer_photo_url ? (
                <img
                  src={story.customer_photo_url}
                  alt={story.customer_name}
                  className="w-14 h-14 rounded-full object-cover grayscale"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-champagne-500/10 flex items-center justify-center">
                  <span className="text-champagne-500 font-medium text-xl">
                    {story.customer_name.charAt(0)}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium text-lg">{story.customer_name}</p>
                {story.customer_location && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {story.customer_location}
                  </p>
                )}
              </div>
              {story.instagram_handle && (
                <a
                  href={`https://instagram.com/${story.instagram_handle.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-champagne-500 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
            </div>

            {/* Full Story */}
            <div className="flex-1 mb-8">
              <p className="text-foreground/80 leading-relaxed whitespace-pre-line text-[15px]">
                {story.story_text}
              </p>
            </div>

            {/* Product Link */}
            {story.product_name && story.product_slug && (
              <div className="mb-8 p-5 bg-muted/50 border border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-3">
                  Featured Product
                </p>
                <div className="flex items-center justify-between">
                  <p className="font-medium">{story.product_name}</p>
                  <Button variant="outline" size="sm" asChild className="rounded-none text-xs uppercase tracking-wider">
                    <Link to={`/product/${story.product_slug}`}>
                      View
                      <ExternalLink className="w-3 h-3 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-6 border-t border-border">
              {story.is_contactable && (
                <Button className="flex-1 bg-champagne-500 text-stone-900 hover:bg-champagne-600 rounded-none text-xs uppercase tracking-wider">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Ask Me Anything
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={handleShare}
                className="rounded-none text-xs uppercase tracking-wider"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
