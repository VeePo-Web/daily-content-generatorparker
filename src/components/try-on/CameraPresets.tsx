import { User, Maximize2, Search, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CameraPreset = 'full' | 'upper' | 'detail' | 'three-quarter';

interface CameraPresetsProps {
  activePreset: CameraPreset;
  onSelectPreset: (preset: CameraPreset) => void;
  className?: string;
}

const presets: { id: CameraPreset; label: string; icon: React.ReactNode }[] = [
  { id: 'full', label: 'Full Body', icon: <User className="w-3.5 h-3.5" /> },
  { id: 'upper', label: 'Upper', icon: <Maximize2 className="w-3.5 h-3.5" /> },
  { id: 'detail', label: 'Detail', icon: <Search className="w-3.5 h-3.5" /> },
  { id: 'three-quarter', label: '3/4 View', icon: <RotateCw className="w-3.5 h-3.5" /> },
];

export const CameraPresets = ({ activePreset, onSelectPreset, className }: CameraPresetsProps) => {
  return (
    <div className={cn(
      "flex items-center gap-1 bg-background/90 backdrop-blur-md border border-border/50 p-1 rounded-full shadow-lg",
      className
    )}>
      {presets.map(({ id, label, icon }) => (
        <button
          key={id}
          onClick={() => onSelectPreset(id)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] font-medium rounded-full transition-all duration-200",
            activePreset === id
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
          aria-label={label}
          title={label}
        >
          {icon}
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
};
