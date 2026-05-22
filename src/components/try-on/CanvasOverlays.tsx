import { cn } from '@/lib/utils';

interface CanvasOverlaysProps {
  showGrain?: boolean;
  showVignette?: boolean;
  className?: string;
}

/**
 * Editorial-grade visual overlays for the 3D canvas
 * - Grain: Subtle film-quality noise texture (2-3% opacity)
 * - Vignette: Gentle corner darkening for focus
 */
export const CanvasOverlays = ({ 
  showGrain = true, 
  showVignette = true,
  className 
}: CanvasOverlaysProps) => {
  return (
    <div className={cn("pointer-events-none absolute inset-0 z-[1]", className)}>
      {/* Film Grain Overlay */}
      {showGrain && (
        <div 
          className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
          aria-hidden="true"
        />
      )}
      
      {/* Vignette Effect */}
      {showVignette && (
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, hsl(var(--background) / 0.15) 100%)',
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
};
