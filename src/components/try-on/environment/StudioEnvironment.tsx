/**
 * Studio Environment - Complete 3D Photo Studio
 * 
 * Combines cyclorama backdrop, reflective floor, horizon gradient,
 * and enhanced lighting into a world-class studio environment.
 */

import { ContactShadows } from '@react-three/drei';
import { InfinityFloor } from './InfinityFloor';
import { HorizonGradient } from './HorizonGradient';
import { useIsMobile } from '@/hooks/use-mobile';

interface StudioEnvironmentProps {
  lightingMode?: 'studio' | 'natural' | 'dramatic';
}

// Color palettes for different lighting modes
const STUDIO_PALETTES = {
  studio: {
    backdrop: '#F8F6F3',
    floor: '#FAFAF8',
    horizonTop: '#FAFAF8',
    horizonMid: '#F5F3F0',
    horizonBottom: '#EBE8E4',
    shadowColor: '#1C1917',
  },
  natural: {
    backdrop: '#FFF8F0',
    floor: '#FFFBF5',
    horizonTop: '#E8F4FF',
    horizonMid: '#FFF0E0',
    horizonBottom: '#FFE8D8',
    shadowColor: '#2C1810',
  },
  dramatic: {
    backdrop: '#1C1917',
    floor: '#252220',
    horizonTop: '#0A0908',
    horizonMid: '#1C1917',
    horizonBottom: '#252220',
    shadowColor: '#000000',
  },
};

export const StudioEnvironment = ({ 
  lightingMode = 'studio' 
}: StudioEnvironmentProps) => {
  const isMobile = useIsMobile();
  const palette = STUDIO_PALETTES[lightingMode];
  
  return (
    <group>
      {/* Infinite horizon sky dome */}
      <HorizonGradient
        topColor={palette.horizonTop}
        horizonColor={palette.horizonMid}
        bottomColor={palette.horizonBottom}
      />
      
      {/* Curved cyclorama backdrop (simplified) */}
      <mesh position={[0, 3, -5]} rotation={[0, 0, 0]}>
        <planeGeometry args={[16, 8]} />
        <meshStandardMaterial 
          color={palette.backdrop}
          roughness={0.9}
          metalness={0}
        />
      </mesh>
      
      {/* Side walls for studio feel */}
      <mesh position={[-6, 2, -2]} rotation={[0, Math.PI / 6, 0]}>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial 
          color={palette.backdrop}
          roughness={0.95}
          metalness={0}
          transparent
          opacity={0.6}
        />
      </mesh>
      <mesh position={[6, 2, -2]} rotation={[0, -Math.PI / 6, 0]}>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial 
          color={palette.backdrop}
          roughness={0.95}
          metalness={0}
          transparent
          opacity={0.6}
        />
      </mesh>
      
      {/* Reflective infinity floor */}
      <InfinityFloor
        size={12}
        color={palette.floor}
        reflectivity={lightingMode === 'dramatic' ? 0.5 : 0.35}
      />
      
      {/* Enhanced contact shadows */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={lightingMode === 'dramatic' ? 0.65 : 0.45}
        scale={10}
        blur={isMobile ? 2 : 3}
        far={2.5}
        color={palette.shadowColor}
        frames={isMobile ? 1 : Infinity}
      />
      
      {/* Subtle ground gradient for depth */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0.001, 0]}
      >
        <ringGeometry args={[4, 8, 64]} />
        <meshBasicMaterial
          color={palette.horizonBottom}
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
};

export { STUDIO_PALETTES };
