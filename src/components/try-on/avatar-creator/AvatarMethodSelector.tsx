import { Camera, Ruler, Users, ArrowRight, Clock, Sparkles, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type AvatarMethod = 'ai' | 'photo' | 'manual' | 'library';

interface AvatarMethodSelectorProps {
  onSelect: (method: AvatarMethod) => void;
}

const methods = [
  {
    id: 'ai' as AvatarMethod,
    icon: Wand2,
    title: 'AI Generator',
    description: 'Describe yourself and AI creates your avatar',
    effort: '30 sec',
    accuracy: 'High',
    available: true,
    badge: 'New',
  },
  {
    id: 'library' as AvatarMethod,
    icon: Users,
    title: 'Choose a Model',
    description: 'Pick from 12 diverse pre-made avatars',
    effort: 'Instant',
    accuracy: 'Approximate',
    available: true,
  },
  {
    id: 'manual' as AvatarMethod,
    icon: Ruler,
    title: 'Enter Measurements',
    description: 'Input your height, weight & body measurements',
    effort: '2 min',
    accuracy: 'Very High',
    available: true,
  },
  {
    id: 'photo' as AvatarMethod,
    icon: Camera,
    title: 'Photo Scan',
    description: 'AI generates measurements from 2 photos',
    effort: '30 sec',
    accuracy: 'High',
    available: false, // Coming soon
  },
];

export const AvatarMethodSelector = ({ onSelect }: AvatarMethodSelectorProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-light tracking-tight">How would you like to create your avatar?</h2>
        <p className="text-sm text-muted-foreground">
          Choose the method that works best for you
        </p>
      </div>
      
      <div className="space-y-3">
        {methods.map((method) => {
          const Icon = method.icon;
          
          return (
            <button
              key={method.id}
              onClick={() => method.available && onSelect(method.id)}
              disabled={!method.available}
              className={cn(
                "w-full p-4 rounded-lg border text-left transition-all duration-200",
                "hover:border-foreground/50 hover:bg-muted/30",
                "focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2",
                "group relative",
                !method.available && "opacity-50 cursor-not-allowed hover:border-border hover:bg-transparent"
              )}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                  "bg-muted group-hover:bg-primary/10 transition-colors",
                  !method.available && "group-hover:bg-muted"
                )}>
                  <Icon className="w-5 h-5 text-foreground" strokeWidth={1.5} />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm">{method.title}</h3>
                    {method.badge && (
                      <span className="text-[10px] uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {method.badge}
                      </span>
                    )}
                    {!method.available && (
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{method.description}</p>
                  
                  {/* Meta */}
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {method.effort}
                    </span>
                    <span className="text-border">•</span>
                    <span>{method.accuracy} accuracy</span>
                  </div>
                </div>
                
                {/* Arrow */}
                {method.available && (
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
