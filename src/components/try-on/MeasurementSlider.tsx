import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { formatHeight, formatWeight, formatMeasurement, cmToInches, kgToLbs } from './utils/measurementToProportions';

interface MeasurementSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: 'height' | 'weight' | 'measurement';
  unitSystem: 'metric' | 'imperial';
  onChange: (value: number) => void;
  icon?: React.ReactNode;
  className?: string;
}

export const MeasurementSlider = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  unitSystem,
  onChange,
  icon,
  className,
}: MeasurementSliderProps) => {
  // Format the display value based on unit type
  const formatValue = (val: number): string => {
    switch (unit) {
      case 'height':
        return formatHeight(val, unitSystem);
      case 'weight':
        return formatWeight(val, unitSystem);
      case 'measurement':
        return formatMeasurement(val, unitSystem);
      default:
        return String(val);
    }
  };

  // Get secondary unit display
  const getSecondaryValue = (val: number): string => {
    if (unitSystem === 'metric') {
      switch (unit) {
        case 'height':
          return formatHeight(val, 'imperial');
        case 'weight':
          return formatWeight(val, 'imperial');
        case 'measurement':
          return formatMeasurement(val, 'imperial');
        default:
          return '';
      }
    } else {
      switch (unit) {
        case 'height':
          return `${val} cm`;
        case 'weight':
          return `${val} kg`;
        case 'measurement':
          return `${val} cm`;
        default:
          return '';
      }
    }
  };

  // Calculate thumb position for floating label
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Label row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
        </div>
        <div className="text-right">
          <span className="text-sm font-medium tabular-nums">
            {formatValue(value)}
          </span>
          <span className="text-xs text-muted-foreground ml-2">
            {getSecondaryValue(value)}
          </span>
        </div>
      </div>

      {/* Slider with floating value pill */}
      <div className="relative pt-1">
        {/* Floating value pill */}
        <div 
          className="absolute -top-1 transform -translate-x-1/2 pointer-events-none z-10 transition-all duration-150"
          style={{ left: `${percentage}%` }}
        >
          <div className="bg-foreground text-background text-xs font-medium px-2 py-0.5 rounded-sm whitespace-nowrap">
            {formatValue(value)}
          </div>
          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-foreground mx-auto" />
        </div>

        {/* Custom styled slider */}
        <Slider
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={(vals) => onChange(vals[0])}
          className="[&_[data-slot=track]]:h-1.5 [&_[data-slot=range]]:bg-foreground [&_[data-slot=thumb]]:w-6 [&_[data-slot=thumb]]:h-6 [&_[data-slot=thumb]]:border-2 [&_[data-slot=thumb]]:border-foreground [&_[data-slot=thumb]]:shadow-md"
        />

        {/* Min/Max labels */}
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {formatValue(min)}
          </span>
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {formatValue(max)}
          </span>
        </div>
      </div>
    </div>
  );
};
