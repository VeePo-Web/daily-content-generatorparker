import { useState } from 'react';
import { useTryOnState } from '@/hooks/useTryOnState';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DrawCheckIcon } from '@/components/ui/draw-check-icon';
import { Copy, Check, Share2, Twitter, Facebook, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SaveLookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const generateShareId = () => {
  return Math.random().toString(36).substring(2, 10);
};

export const SaveLookModal = ({ open, onOpenChange }: SaveLookModalProps) => {
  const { equippedItems, avatarGender, avatarBodyType, getTotalPrice, getEquippedCount } = useTryOnState();
  const [outfitName, setOutfitName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedShareId, setSavedShareId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const totalPrice = Number(getTotalPrice());
  const itemCount = getEquippedCount();
  const items = Object.entries(equippedItems).filter(([_, item]) => item !== null);

  const shareUrl = savedShareId 
    ? `${window.location.origin}/try-on/saved/${savedShareId}`
    : '';

  const handleSave = async () => {
    if (itemCount === 0) {
      toast.error('Add some items to your outfit first');
      return;
    }

    setIsSaving(true);
    const shareId = generateShareId();
    const defaultName = `My Outfit - ${new Date().toLocaleDateString()}`;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase
        .from('saved_outfits') as any)
        .insert({
          name: outfitName.trim() || defaultName,
          share_id: shareId,
          avatar_gender: avatarGender,
          avatar_body_type: avatarBodyType,
          equipped_items: equippedItems,
        });

      if (error) throw error;

      setSavedShareId(shareId);
      toast.success('Outfit saved successfully!');
    } catch (error) {
      console.error('Error saving outfit:', error);
      toast.error('Failed to save outfit. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = (platform: 'twitter' | 'facebook' | 'whatsapp') => {
    const text = `Check out my outfit from Line of Judah!`;
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${shareUrl}`)}`,
    };
    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after closing
    setTimeout(() => {
      setSavedShareId(null);
      setOutfitName('');
      setCopied(false);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm uppercase tracking-wider font-light">
            Save Your Look
          </DialogTitle>
          <DialogDescription className="sr-only">
            Save your current outfit configuration to share with others
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!savedShareId ? (
            <>
              {/* Name Input */}
              <div className="space-y-2">
                <Label htmlFor="outfit-name" className="text-xs text-muted-foreground">
                  Name your outfit (optional)
                </Label>
                <Input
                  id="outfit-name"
                  placeholder="Sunday Best"
                  value={outfitName}
                  onChange={(e) => setOutfitName(e.target.value)}
                  className="font-light"
                />
              </div>

              {/* Outfit Preview */}
              <div className="space-y-3">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Your Outfit ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                </div>
                <div className="divide-y divide-border border border-border">
                  {items.map(([slot, item]) => (
                    <div key={slot} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-light">{item?.name}</div>
                        <div className="text-xs text-muted-foreground">Size {item?.size}</div>
                      </div>
                      <div className="text-sm">${item?.price.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-light">Total</span>
                  <span className="text-lg font-medium">${totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSave}
                disabled={isSaving || itemCount === 0}
                className="w-full"
                size="lg"
              >
                {isSaving ? 'Saving...' : 'Save & Get Link'}
              </Button>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <DrawCheckIcon size="sm" className="text-primary" delay={100} />
                </div>
                <div className="text-sm font-light">Your outfit has been saved!</div>
              </div>

              {/* Share Link */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Share this link</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={shareUrl}
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Social Share */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Share on social</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => handleShare('twitter')}
                  >
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => handleShare('facebook')}
                  >
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => handleShare('whatsapp')}
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </Button>
                </div>
              </div>

              {/* Done Button */}
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full"
              >
                Done
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
