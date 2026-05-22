import { cn } from "@/lib/utils";

type Unit = "in" | "cm";

interface UnitToggleProps {
  unit: Unit;
  onUnitChange: (unit: Unit) => void;
  className?: string;
}

const UnitToggle = ({ unit, onUnitChange, className }: UnitToggleProps) => {
  return (
    <div className={cn("inline-flex border border-stone-300 dark:border-stone-700", className)}>
      <button
        onClick={() => onUnitChange("in")}
        className={cn(
          "px-4 py-2 text-xs font-medium tracking-widest uppercase transition-colors",
          unit === "in"
            ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
            : "bg-transparent text-muted-foreground hover:text-foreground"
        )}
        aria-pressed={unit === "in"}
      >
        IN
      </button>
      <button
        onClick={() => onUnitChange("cm")}
        className={cn(
          "px-4 py-2 text-xs font-medium tracking-widest uppercase transition-colors",
          unit === "cm"
            ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
            : "bg-transparent text-muted-foreground hover:text-foreground"
        )}
        aria-pressed={unit === "cm"}
      >
        CM
      </button>
    </div>
  );
};

export default UnitToggle;
