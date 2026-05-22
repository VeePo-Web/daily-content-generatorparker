import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { quickPresets, BodyMeasurements, formatHeight, formatWeight } from './utils/measurementToProportions';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface QuickSizePresetsProps {
  onSelectPreset: (measurements: BodyMeasurements) => void;
  selectedPresetId?: string;
  className?: string;
}

// Small human silhouette that scales with height
const HeightSilhouette = ({ heightCm }: { heightCm: number }) => {
  // Map height to visual scale (140cm = 0.75, 190cm = 1.1)
  const scale = 0.75 + ((heightCm - 140) / 50) * 0.35;
  
  return (
    <div 
      className="flex items-end justify-center h-8 mb-1"
      style={{ transform: `scaleY(${scale})`, transformOrigin: 'bottom' }}
    >
      <User className="h-6 w-6" />
    </div>
  );
};

export const QuickSizePresets = ({ 
  onSelectPreset, 
  selectedPresetId,
  className 
}: QuickSizePresetsProps) => {
  const presetEntries = useMemo(() => Object.entries(quickPresets), []);

  return (
    <div className={cn("space-y-3", className)}>
      <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Quick Size Presets
      </h4>
      
      <TooltipProvider delayDuration={300}>
        <div className="grid grid-cols-5 gap-2">
          {presetEntries.map(([id, { label, measurements }]) => (
            <Tooltip key={id}>
              <TooltipTrigger asChild>
                <motion.button
                  onClick={() => onSelectPreset(measurements)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    "flex flex-col items-center py-3 px-2 border transition-all duration-200",
                    selectedPresetId === id
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-transparent text-foreground hover:border-foreground"
                  )}
                >
                  <HeightSilhouette heightCm={measurements.heightCm} />
                  <span className="text-[10px] font-medium leading-tight text-center">
                    {label.split(' ')[0]}
                  </span>
                  <span className="text-[9px] opacity-70 mt-0.5">
                    {label.match(/\(([^)]+)\)/)?.[1] || ''}
                  </span>
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="p-3 max-w-[200px]">
                <div className="space-y-2">
                  <p className="font-medium text-sm">{label}</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>Height:</span>
                    <span className="text-foreground">{formatHeight(measurements.heightCm, 'imperial')}</span>
                    <span>Weight:</span>
                    <span className="text-foreground">{formatWeight(measurements.weightKg, 'imperial')}</span>
                    <span>Chest:</span>
                    <span className="text-foreground">{measurements.chestCm}cm</span>
                    <span>Waist:</span>
                    <span className="text-foreground">{measurements.waistCm}cm</span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
      
      {selectedPresetId && (
        <motion.p 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] text-muted-foreground flex items-center gap-1"
        >
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
          Using {quickPresets[selectedPresetId]?.label} preset
        </motion.p>
      )}
      
      {!selectedPresetId && (
        <p className="text-[10px] text-muted-foreground">
          Tap a preset for quick sizing, or use Detailed tab for custom measurements
        </p>
      )}
    </div>
  );
};
