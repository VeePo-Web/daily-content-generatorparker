import { cn } from '@/lib/utils';
import { SavedProfile } from './hooks/useBodyProfiles';
import { formatHeight, formatWeight } from './utils/measurementToProportions';
import { recommendSize } from './utils/sizeRecommendation';
import { Star, Trash2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface ProfileCardProps {
  profile: SavedProfile;
  isActive: boolean;
  onApply: () => void;
  onSetDefault: () => void;
  onDelete: () => void;
}

export const ProfileCard = ({
  profile,
  isActive,
  onApply,
  onSetDefault,
  onDelete,
}: ProfileCardProps) => {
  const sizeRec = useMemo(() => recommendSize(profile.measurements), [profile.measurements]);
  
  const formattedDate = useMemo(() => {
    const date = new Date(profile.updatedAt || profile.createdAt);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }, [profile.updatedAt, profile.createdAt]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "p-4 border transition-all duration-200",
        isActive 
          ? "border-foreground bg-foreground/5" 
          : "border-border hover:border-muted-foreground"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onSetDefault}
            className={cn(
              "p-1 transition-colors shrink-0",
              profile.isDefault
                 ? "text-champagne-500"
                 : "text-muted-foreground hover:text-champagne-500"
            )}
            title={profile.isDefault ? "Default profile" : "Set as default"}
          >
            <Star className={cn("h-4 w-4", profile.isDefault && "fill-current")} />
          </button>
          <h4 className="font-medium truncate">{profile.name}</h4>
        </div>
        
        {isActive && (
          <span className="shrink-0 flex items-center gap-1 text-xs text-muted-foreground">
            <Check className="h-3 w-3" />
            Active
          </span>
        )}
      </div>

      {/* Measurements Summary */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
        <span>{formatHeight(profile.measurements.heightCm, 'imperial')}</span>
        <span className="text-border">|</span>
        <span>{formatWeight(profile.measurements.weightKg, 'imperial')}</span>
        <span className="text-border">|</span>
        <span className="font-medium text-foreground">Size {sizeRec?.recommendedSize || 'M'}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-xs text-muted-foreground">
          Updated {formattedDate}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={onDelete}
            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
            title="Delete profile"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          
          {!isActive && (
            <button
              onClick={onApply}
              className="px-3 py-1.5 text-xs font-medium border border-foreground hover:bg-foreground hover:text-background transition-colors"
            >
              Apply
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
