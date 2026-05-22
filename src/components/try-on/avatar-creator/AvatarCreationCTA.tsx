import { Sparkles, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AvatarCreationCTAProps {
  onStart: () => void;
  onQuickStart?: () => void;
}

export const AvatarCreationCTA = ({ onStart, onQuickStart }: AvatarCreationCTAProps) => {
  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-gradient-to-br from-muted/30 to-muted/10 p-5">
      {/* Decorative gradient border effect */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
      
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Icon with sparkle effect */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </div>
          <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-primary" />
        </div>
        
        {/* Text */}
        <div className="space-y-1.5">
          <h3 className="text-sm font-medium tracking-tight">Create Your Avatar</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Build a realistic human avatar that looks like you to see how clothes fit your body.
          </p>
        </div>
        
        {/* CTAs */}
        <div className="flex flex-col w-full gap-2">
          <Button 
            onClick={onStart} 
            className="w-full gap-2"
            size="sm"
          >
            <Sparkles className="w-4 h-4" />
            Create My Avatar
          </Button>
          
          {onQuickStart && (
            <Button 
              onClick={onQuickStart} 
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground hover:text-foreground"
            >
              Quick Start with Preset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
