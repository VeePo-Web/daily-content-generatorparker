import { AvatarHairConfig, HAIR_COLORS } from './avatarPresets';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface AvatarHairPickerProps {
  config: AvatarHairConfig;
  onChange: (updates: Partial<AvatarHairConfig>) => void;
}

const HAIR_STYLES = [
  { id: 'bald', label: 'Bald', icon: '👨‍🦲' },
  { id: 'buzz', label: 'Buzz', icon: '✂️' },
  { id: 'short', label: 'Short', icon: '💇' },
  { id: 'medium', label: 'Medium', icon: '💇‍♂️' },
  { id: 'long', label: 'Long', icon: '💇‍♀️' },
  { id: 'ponytail', label: 'Ponytail', icon: '🎀' },
  { id: 'braids', label: 'Braids', icon: '🪢' },
  { id: 'afro', label: 'Afro', icon: '🌀' },
  { id: 'curly', label: 'Curly', icon: '〰️' },
] as const;

const HAIRLINE_OPTIONS = [
  { id: 'full', label: 'Full' },
  { id: 'receding', label: 'Receding' },
  { id: 'widows-peak', label: "Widow's Peak" },
] as const;

export const AvatarHairPicker = ({ config, onChange }: AvatarHairPickerProps) => {
  return (
    <div className="space-y-6">
      {/* Hair Style */}
      <div className="space-y-2">
        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Hair Style
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {HAIR_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => onChange({ style: style.id })}
              className={cn(
                "flex flex-col items-center py-3 px-2 rounded-lg border transition-all",
                config.style === style.id 
                  ? "border-foreground bg-foreground text-background" 
                  : "border-border hover:border-foreground/50"
              )}
            >
              <span className="text-lg mb-1">{style.icon}</span>
              <span className="text-[10px] font-medium">{style.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Hair Color - only show if not bald */}
      {config.style !== 'bald' && (
        <div className="space-y-2">
          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Hair Color
          </Label>
          <div className="space-y-3">
            {/* Natural Colors */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-muted-foreground">Natural</span>
              <div className="flex flex-wrap gap-2">
                {HAIR_COLORS.filter(c => !['purple', 'blue', 'pink', 'green'].includes(c.id)).map((color) => (
                  <button
                    key={color.id}
                    onClick={() => onChange({ color: color.hex })}
                    className={cn(
                      "w-7 h-7 rounded-full border-2 transition-all hover:scale-110",
                      config.color === color.hex 
                        ? "border-foreground ring-2 ring-foreground ring-offset-2" 
                        : "border-transparent hover:border-foreground/30"
                    )}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
            
            {/* Fashion Colors */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-muted-foreground">Fashion</span>
              <div className="flex flex-wrap gap-2">
                {HAIR_COLORS.filter(c => ['purple', 'blue', 'pink', 'green'].includes(c.id)).map((color) => (
                  <button
                    key={color.id}
                    onClick={() => onChange({ color: color.hex })}
                    className={cn(
                      "w-7 h-7 rounded-full border-2 transition-all hover:scale-110",
                      config.color === color.hex 
                        ? "border-foreground ring-2 ring-foreground ring-offset-2" 
                        : "border-transparent hover:border-foreground/30"
                    )}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Hairline - only show for certain styles */}
      {!['bald', 'afro', 'braids', 'ponytail'].includes(config.style) && (
        <div className="space-y-2">
          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Hairline
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {HAIRLINE_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => onChange({ hairline: option.id })}
                className={cn(
                  "py-2 px-2 text-[10px] font-medium rounded-lg border transition-all",
                  config.hairline === option.id 
                    ? "border-foreground bg-foreground text-background" 
                    : "border-border hover:border-foreground/50"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
