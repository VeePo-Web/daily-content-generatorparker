import { Suspense, useRef, useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Avatar3D } from './Avatar3D';
import { SceneControls } from './SceneControls';
import { CameraPresets, CameraPreset } from './CameraPresets';
import { CanvasOverlays } from './CanvasOverlays';
import { StudioLighting } from './lighting/StudioLighting';
import { StudioEnvironment } from './environment/StudioEnvironment';
import { EnhancedShadows } from './effects/PostProcessing';
import { useTryOnState } from '@/hooks/useTryOnState';
import { useCameraPresets } from '@/hooks/useCameraPresets';
import { useIsMobile } from '@/hooks/use-mobile';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Loader2, AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TryOnCanvasProps {
  className?: string;
}

const Scene = ({ 
  lightingMode, 
  cameraRef,
  controlsRef,
}: { 
  lightingMode: 'studio' | 'natural' | 'dramatic';
  cameraRef: React.RefObject<any>;
  controlsRef: React.RefObject<any>;
}) => {
  return (
    <>
      <PerspectiveCamera 
        ref={cameraRef}
        makeDefault 
        position={[0, 1.1, 3.8]} 
        fov={35}
      />
      
      <OrbitControls 
        ref={controlsRef}
        enablePan={false}
        minDistance={1.5}
        maxDistance={6.0}
        minPolarAngle={Math.PI / 10}
        maxPolarAngle={Math.PI / 1.5}
        target={[0, 0.95, 0]}
        enableDamping
        dampingFactor={0.03}
      />

      {/* Studio Lighting System */}
      <StudioLighting mode={lightingMode} />
      
      {/* Enhanced shadows for depth */}
      <EnhancedShadows />

      {/* Complete Studio Environment (floor, backdrop, shadows) */}
      <StudioEnvironment lightingMode={lightingMode} />

      {/* Avatar with Garments */}
      <Avatar3D position={[0, 0, 0]} />
    </>
  );
};

export const TryOnCanvas = ({ className }: TryOnCanvasProps) => {
  const { isLoading } = useTryOnState();
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const { animateToPreset } = useCameraPresets();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);
  const [lightingMode, setLightingMode] = useState<'studio' | 'natural' | 'dramatic'>('studio');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('full');
  const [contextLost, setContextLost] = useState(false);

  // Handle WebGL context loss/restore
  const handleContextLost = useCallback((event: Event) => {
    event.preventDefault();
    console.warn('[TryOnCanvas] WebGL context lost');
    setContextLost(true);
  }, []);

  const handleContextRestored = useCallback(() => {
    console.log('[TryOnCanvas] WebGL context restored');
    setContextLost(false);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('webglcontextlost', handleContextLost, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [handleContextLost, handleContextRestored]);

  const handleReloadCanvas = useCallback(() => {
    setContextLost(false);
    // Force remount by key change handled in parent
    window.location.reload();
  }, []);

  const handleReset = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    if (cameraRef.current) {
      const currentZ = cameraRef.current.position.z;
      cameraRef.current.position.z = Math.max(1.2, currentZ - 0.4);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (cameraRef.current) {
      const currentZ = cameraRef.current.position.z;
      cameraRef.current.position.z = Math.min(4.5, currentZ + 0.4);
    }
  }, []);

  const handleScreenshot = useCallback(() => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = 'line-of-judah-outfit.png';
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
    }
  }, []);

  const handleToggleLighting = useCallback(() => {
    setLightingMode(prev => {
      if (prev === 'studio') return 'natural';
      if (prev === 'natural') return 'dramatic';
      return 'studio';
    });
  }, []);

  const handleCameraPreset = useCallback((preset: CameraPreset) => {
    setCameraPreset(preset);
    if (!prefersReducedMotion) {
      animateToPreset(cameraRef, controlsRef, preset);
    } else {
      // Instant transition for reduced motion
      const config = {
        full: { pos: [0, 1.1, 3.8], target: [0, 0.95, 0] },
        upper: { pos: [0, 1.45, 2.0], target: [0, 1.35, 0] },
        detail: { pos: [0, 1.2, 1.3], target: [0, 1.2, 0] },
        'three-quarter': { pos: [1.5, 1.2, 3.2], target: [0, 1.0, 0] },
      }[preset] as { pos: number[]; target: number[] };
      if (cameraRef.current && controlsRef.current && config) {
        cameraRef.current.position.set(...config.pos);
        controlsRef.current.target.set(...config.target);
      }
    }
  }, [animateToPreset, prefersReducedMotion]);

  return (
    <div className={`relative ${className}`}>
      {/* Editorial overlays - grain + vignette */}
      <CanvasOverlays showGrain={!isMobile} showVignette />
      {/* Loading Overlay */}
      {isLoading && !contextLost && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-light tracking-wide">Loading model...</span>
          </div>
        </div>
      )}

      {/* WebGL Context Lost Fallback */}
      {contextLost && (
        <div className="absolute inset-0 bg-background z-20 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center p-6">
            <AlertTriangle className="w-12 h-12 text-destructive" />
            <div className="space-y-2">
              <h3 className="text-lg font-medium">3D View Unavailable</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                The 3D rendering context was lost. This can happen on devices with limited memory.
              </p>
            </div>
            <Button onClick={handleReloadCanvas} variant="outline" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Reload 3D View
            </Button>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        ref={canvasRef}
        shadows={!isMobile}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        gl={{ 
          preserveDrawingBuffer: true,
          antialias: !isMobile,
          toneMapping: 3, // ACESFilmicToneMapping
          toneMappingExposure: 1.1,
          powerPreference: isMobile ? 'low-power' : 'high-performance',
        }}
        className="touch-none"
      >
        <Suspense fallback={null}>
          <Scene 
            lightingMode={lightingMode} 
            cameraRef={cameraRef}
            controlsRef={controlsRef}
          />
        </Suspense>
      </Canvas>

      {/* Drag hint - premium styling */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[11px] uppercase tracking-[0.15em] text-muted-foreground/70 bg-background/60 backdrop-blur-sm px-4 py-2 rounded-full border border-border/30">
        Drag to rotate • Scroll to zoom
      </div>

      {/* Camera Presets - Desktop only */}
      <div className="hidden sm:block absolute top-4 right-4">
        <CameraPresets 
          activePreset={cameraPreset}
          onSelectPreset={handleCameraPreset}
        />
      </div>

      {/* Scene Controls */}
      <SceneControls
        onReset={handleReset}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onScreenshot={handleScreenshot}
        onToggleLighting={handleToggleLighting}
        lightingMode={lightingMode}
      />
    </div>
  );
};
