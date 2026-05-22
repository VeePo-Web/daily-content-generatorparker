import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { SizeRecommendation as SizeRec, getFitStatusInfo } from './utils/sizeRecommendation';
import { Check, AlertTriangle, Info } from 'lucide-react';

interface SizeRecommendationProps {
  recommendation: SizeRec | null;
  className?: string;
}

export const SizeRecommendation = ({ recommendation, className }: SizeRecommendationProps) => {
  if (!recommendation) {
    return (
      <div className={cn("p-4 border border-dashed border-border rounded-sm", className)}>
        <p className="text-sm text-muted-foreground text-center">
          Enter your measurements to get a size recommendation
        </p>
      </div>
    );
  }

  const { recommendedSize, confidence, fits, alternativeSize, alternativeReason } = recommendation;

  // Confidence bar segments
  const confidenceColor = confidence >= 85 
    ? 'bg-green-500' 
    : confidence >= 70 
      ? 'bg-amber-500' 
      : 'bg-red-500';

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main recommendation */}
      <div className="bg-foreground text-background p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider opacity-70">Your Size</span>
          <span className="text-3xl font-bold tracking-tight">{recommendedSize}</span>
        </div>
        
        {/* Confidence bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="opacity-70">Confidence</span>
            <span className="font-medium tabular-nums">{confidence}%</span>
          </div>
          <div className="h-1.5 bg-background/20 rounded-full overflow-hidden">
            <div 
              className={cn("h-full rounded-full transition-all duration-500", confidenceColor)}
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>
      </div>

      {/* Fit details */}
      <div className="space-y-2">
        {fits.map((fit) => {
          const { icon, color, text } = getFitStatusInfo(fit.status);
          return (
            <div 
              key={fit.dimension}
              className="flex items-center justify-between py-2 px-3 bg-secondary/50 rounded-sm"
            >
              <div className="flex items-center gap-2">
                <span className={cn("text-sm", color)}>{icon}</span>
                <span className="text-sm capitalize">{fit.dimension}</span>
              </div>
              <span className={cn("text-xs font-medium", color)}>{text}</span>
            </div>
          );
        })}
      </div>

      {/* Alternative size suggestion */}
      {alternativeSize && (
        <div className="flex items-start gap-2 p-3 border border-border rounded-sm bg-muted/30">
          <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="text-muted-foreground">Consider </span>
            <span className="font-medium">{alternativeSize}</span>
            <span className="text-muted-foreground"> {alternativeReason?.toLowerCase()}</span>
          </div>
        </div>
      )}

      {/* Perfect fit indicator */}
      {confidence >= 90 && fits.every(f => f.status === 'perfect') && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-sm">
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-700 dark:text-green-400 font-medium">
            Perfect match for your measurements!
          </span>
        </div>
      )}
    </div>
  );
};
