import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface SubmitStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubmitStoryModal({ isOpen, onClose }: SubmitStoryModalProps) {
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_location: "",
    instagram_handle: "",
    headline: "",
    story_text: "",
    product_id: "",
    is_contactable: false,
  });

  const { data: products } = useQuery({
    queryKey: ["products-for-story"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name")
        .eq("status", "active")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("community_stories").insert({
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_location: formData.customer_location || null,
        instagram_handle: formData.instagram_handle || null,
        headline: formData.headline,
        story_text: formData.story_text,
        product_id: formData.product_id || null,
        is_contactable: formData.is_contactable,
        is_approved: false,
        is_featured: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Story submitted!",
        description: "Thank you for sharing. We'll review your story and feature it soon.",
      });
      setFormData({
        customer_name: "",
        customer_email: "",
        customer_location: "",
        instagram_handle: "",
        headline: "",
        story_text: "",
        product_id: "",
        is_contactable: false,
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.customer_email || !formData.headline || !formData.story_text) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    if (formData.story_text.length < 100) {
      toast({
        title: "Story too short",
        description: "Please share more details (at least 100 characters).",
        variant: "destructive",
      });
      return;
    }
    submitMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light">Share Your Story</DialogTitle>
          <DialogDescription>
            Your testimony could inspire someone today. Tell us how Line of Judah 
            has been part of your faith journey.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Name + Email */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Your name"
                value={formData.customer_name}
                onChange={(e) =>
                  setFormData({ ...formData, customer_name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.customer_email}
                onChange={(e) =>
                  setFormData({ ...formData, customer_email: e.target.value })
                }
                required
              />
            </div>
          </div>

          {/* Location + Instagram */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">City/State</Label>
              <Input
                id="location"
                placeholder="Calgary, AB"
                value={formData.customer_location}
                onChange={(e) =>
                  setFormData({ ...formData, customer_location: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                placeholder="@username"
                value={formData.instagram_handle}
                onChange={(e) =>
                  setFormData({ ...formData, instagram_handle: e.target.value })
                }
              />
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-2">
            <Label htmlFor="headline">Story Title *</Label>
            <Input
              id="headline"
              placeholder="e.g., 'This Hoodie Changed My Train Ride'"
              value={formData.headline}
              onChange={(e) =>
                setFormData({ ...formData, headline: e.target.value })
              }
              required
            />
          </div>

          {/* Story */}
          <div className="space-y-2">
            <Label htmlFor="story">Your Story *</Label>
            <Textarea
              id="story"
              placeholder="Share the moment, the conversation, the testimony... (minimum 100 characters)"
              rows={5}
              value={formData.story_text}
              onChange={(e) =>
                setFormData({ ...formData, story_text: e.target.value })
              }
              required
            />
            <p className="text-xs text-muted-foreground">
              {formData.story_text.length}/100 minimum characters
            </p>
          </div>

          {/* Product Link */}
          <div className="space-y-2">
            <Label htmlFor="product">Featured Product (optional)</Label>
            <Select
              value={formData.product_id}
              onValueChange={(value) =>
                setFormData({ ...formData, product_id: value === "none" ? "" : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {products?.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Contactable */}
          <div className="flex items-start gap-3 pt-2">
            <Checkbox
              id="contactable"
              checked={formData.is_contactable}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_contactable: checked as boolean })
              }
            />
            <div className="space-y-1">
              <Label htmlFor="contactable" className="cursor-pointer">
                Allow others to ask me questions
              </Label>
              <p className="text-xs text-muted-foreground">
                Enable the "Ask Me Anything" feature on your story card
              </p>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            className="w-full bg-champagne-500 text-stone-900 hover:bg-champagne-600"
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Story"
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By submitting, you agree to let us feature your story. 
            We may edit for clarity.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
