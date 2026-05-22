/**
 * Studio Lighting System - Professional Photography Setup
 * 
 * Three modes matching real photo studio configurations:
 * - Studio: Clean commercial lighting with softbox key
 * - Natural: Golden hour outdoor simulation
 * - Dramatic: High contrast editorial lighting
 */

import { Environment } from '@react-three/drei';
import { useIsMobile } from '@/hooks/use-mobile';

interface StudioLightingProps {
  mode: 'studio' | 'natural' | 'dramatic';
}

export const StudioLighting = ({ mode }: StudioLightingProps) => {
  const isMobile = useIsMobile();
  const shadowMapSize = isMobile ? 1024 : 2048;
  
  if (mode === 'studio') {
    return (
      <>
        {/* Key light - main soft box from front-right */}
        <spotLight 
          position={[3.5, 4.5, 4]} 
          intensity={2.8} 
          angle={0.55}
          penumbra={0.7}
          castShadow={!isMobile}
          shadow-mapSize={[shadowMapSize, shadowMapSize]}
          shadow-bias={-0.0001}
          color="#FFF8F0"
        />
        
        {/* Fill light - softer from front-left */}
        <spotLight 
          position={[-3, 3.5, 3.5]} 
          intensity={1.4}
          angle={0.6}
          penumbra={0.85}
          color="#F5F8FF"
        />
        
        {/* Rim/Hair light - edge definition from behind */}
        <spotLight 
          position={[0, 4.5, -4.5]} 
          intensity={2.0}
          angle={0.45}
          penumbra={0.5}
          color="#FFFFFF"
        />
        
        {/* Ground bounce light - simulates floor reflection */}
        <directionalLight 
          position={[0, 0.5, 3]} 
          intensity={0.4} 
          color="#FAFAF8"
        />
        
        {/* Top fill - soft overhead */}
        <directionalLight 
          position={[0, 6, 0]} 
          intensity={0.5} 
          color="#FFFFFF"
        />
        
        {/* Ambient - prevent pure black shadows */}
        <ambientLight intensity={0.25} color="#F5F5F5" />
        
        {/* Environment map for subtle reflections */}
        <Environment preset="studio" background={false} />
      </>
    );
  }

  if (mode === 'natural') {
    return (
      <>
        {/* Sun-like key light - warm golden hour */}
        <directionalLight 
          position={[5, 8, 5]} 
          intensity={1.6}
          castShadow={!isMobile}
          shadow-mapSize={[shadowMapSize, shadowMapSize]}
          color="#FFF0D4"
        />
        
        {/* Sky fill - hemisphere lighting */}
        <hemisphereLight 
          intensity={0.9} 
          color="#87CEEB" 
          groundColor="#F4E9D9" 
        />
        
        {/* Bounce light from ground */}
        <directionalLight 
          position={[0, 0.5, 2]} 
          intensity={0.3} 
          color="#FFE4C0"
        />
        
        {/* Ambient */}
        <ambientLight intensity={0.35} color="#FFF8F0" />
        
        <Environment preset="sunset" background={false} />
      </>
    );
  }

  // Dramatic mode - high contrast editorial
  return (
    <>
      {/* Single hard key light - theatrical */}
      <spotLight 
        position={[4.5, 5.5, 2.5]} 
        intensity={4.5}
        angle={0.32}
        penumbra={0.35}
        castShadow={!isMobile}
        shadow-mapSize={[shadowMapSize, shadowMapSize]}
        color="#FFFFFF"
      />
      
      {/* Golden rim light - accent */}
      <spotLight 
        position={[-2.5, 3.5, -4.5]} 
        intensity={1.5}
        angle={0.5}
        penumbra={0.6}
        color="#FFD700"
      />
      
      {/* Subtle fill to prevent pure black */}
      <spotLight 
        position={[-3, 2, 3]} 
        intensity={0.3}
        angle={0.8}
        penumbra={1}
        color="#4A5568"
      />
      
      {/* Very low ambient - maintain drama */}
      <ambientLight intensity={0.08} color="#1A1A2E" />
      
      <Environment preset="night" background={false} />
    </>
  );
};
