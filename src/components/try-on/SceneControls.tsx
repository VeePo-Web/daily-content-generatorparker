import { RotateCcw, ZoomIn, ZoomOut, Camera, Sun, Moon, Sparkles } from 'lucide-react';

interface SceneControlsProps {
  onReset: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onScreenshot: () => void;
  onToggleLighting: () => void;
  lightingMode: 'studio' | 'natural' | 'dramatic';
}

export const SceneControls = ({ 
  onReset, 
  onZoomIn, 
  onZoomOut, 
  onScreenshot,
  onToggleLighting,
  lightingMode
}: SceneControlsProps) => {
  const getLightingIcon = () => {
    switch (lightingMode) {
      case 'studio':
        return <Sun className="w-4 h-4" />;
      case 'natural':
        return <Moon className="w-4 h-4" />;
      case 'dramatic':
        return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-background/90 backdrop-blur-md border border-border/50 p-1.5 rounded-full shadow-lg">
      <button
        onClick={onReset}
        className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-all"
        aria-label="Reset view"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
      
      <div className="w-px h-5 bg-border/50" />
      
      <button
        onClick={onZoomOut}
        className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-all"
        aria-label="Zoom out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>
      
      <button
        onClick={onZoomIn}
        className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-all"
        aria-label="Zoom in"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
      
      <div className="w-px h-5 bg-border/50" />
      
      <button
        onClick={onToggleLighting}
        className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-all"
        aria-label={`Lighting mode: ${lightingMode}`}
        title={`Current: ${lightingMode}`}
      >
        {getLightingIcon()}
      </button>
      
      <div className="w-px h-5 bg-border/50" />
      
      <button
        onClick={onScreenshot}
        className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-all"
        aria-label="Take screenshot"
      >
        <Camera className="w-4 h-4" />
      </button>
    </div>
  );
};
