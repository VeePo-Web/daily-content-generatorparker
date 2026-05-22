import { ReactNode, memo } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoCardProps {
  icon: LucideIcon;
  title: string;
  description: string | ReactNode;
  className?: string;
  variant?: 'default' | 'muted' | 'accent';
  size?: 'sm' | 'default';
  iconColor?: 'amber' | 'emerald' | 'blue' | 'stone';
  children?: ReactNode;
}

const InfoCard = memo(({
  icon: Icon,
  title,
  description,
  className,
  variant = 'default',
  size = 'default',
  iconColor = 'amber',
  children
}: InfoCardProps) => {
  const variantClasses = {
    default: "bg-stone-900/50",
    muted: "bg-muted/30",
    accent: "border-l-4 border-champagne-500 bg-champagne-500/5"
  };

  const iconColorClasses = {
    amber: "text-champagne-500",
    emerald: "text-champagne-500",
    blue: "text-blue-500",
    stone: "text-stone-400"
  };

  return (
    <div 
      className={cn(
        variantClasses[variant],
        size === 'default' ? "p-6" : "p-4",
        className
      )}
    >
      <div className={cn(
        "flex items-center gap-2",
        size === 'default' ? "mb-3" : "mb-2"
      )}>
        <Icon className={cn("w-4 h-4 flex-shrink-0", iconColorClasses[iconColor])} strokeWidth={1.5} />
        <h3 className="font-medium text-sm">{title}</h3>
      </div>
      
      <div className={cn(
        "text-muted-foreground font-light",
        size === 'default' ? "text-sm" : "text-xs"
      )}>
        {typeof description === 'string' ? (
          <p>{description}</p>
        ) : (
          description
        )}
      </div>
      
      {children && (
        <div className="mt-2">
          {children}
        </div>
      )}
    </div>
  );
});

InfoCard.displayName = 'InfoCard';

export default InfoCard;
