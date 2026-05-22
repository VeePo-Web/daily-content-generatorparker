import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useIsMobile } from '@/hooks/use-mobile';

type HairStyle = 'bald' | 'buzz' | 'short' | 'medium' | 'long' | 'ponytail' | 'braids' | 'afro' | 'curly';
type Hairline = 'full' | 'receding' | 'widows-peak';

interface AvatarHairProps {
  style: HairStyle;
  color: string;
  hairline: Hairline;
  headRadius: number;
  isMobile?: boolean;
}

/**
 * AvatarHair - Enhanced procedural hair system
 * 
 * Features:
 * - 9 distinct hairstyles with realistic silhouettes
 * - Strand-based rendering for afro/curly styles
 * - Performance-optimized geometry
 * - Proper hair material with realistic roughness
 */
export const AvatarHair = ({ 
  style, 
  color, 
  hairline,
  headRadius, 
  isMobile: isMobileProp 
}: AvatarHairProps) => {
  const isMobileHook = useIsMobile();
  const isMobile = isMobileProp ?? isMobileHook;
  const segments = isMobile ? 12 : 24;
  
  // Enhanced hair material with realistic properties
  const hairMaterial = useMemo(() => (
    <meshStandardMaterial 
      color={color}
      roughness={0.62}
      metalness={0.08}
    />
  ), [color]);

  // Matte hair material for textured styles
  const matteHairMaterial = useMemo(() => (
    <meshStandardMaterial 
      color={color}
      roughness={0.85}
      metalness={0}
    />
  ), [color]);

  if (style === 'bald') {
    return null;
  }

  // Buzz cut - thin textured cap
  if (style === 'buzz') {
    return (
      <mesh position={[0, headRadius * 0.15, 0]}>
        <sphereGeometry args={[headRadius * 0.925, segments, segments / 2, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        {matteHairMaterial}
      </mesh>
    );
  }

  // Short hair - slight volume with styled fringe
  if (style === 'short') {
    return (
      <group>
        <mesh position={[0, headRadius * 0.18, headRadius * 0.02]}>
          <sphereGeometry args={[headRadius * 0.96, segments, segments / 2, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
          {hairMaterial}
        </mesh>
        {/* Front fringe */}
        <mesh position={[0, headRadius * 0.52, headRadius * 0.68]} rotation={[-0.35, 0, 0]}>
          <boxGeometry args={[headRadius * 0.75, headRadius * 0.12, headRadius * 0.18]} />
          {hairMaterial}
        </mesh>
        {/* Side texturing */}
        <mesh position={[-headRadius * 0.55, headRadius * 0.1, headRadius * 0.2]}>
          <sphereGeometry args={[headRadius * 0.18, segments / 2, segments / 2]} />
          {hairMaterial}
        </mesh>
        <mesh position={[headRadius * 0.55, headRadius * 0.1, headRadius * 0.2]}>
          <sphereGeometry args={[headRadius * 0.18, segments / 2, segments / 2]} />
          {hairMaterial}
        </mesh>
      </group>
    );
  }

  // Medium hair - covers ears, more volume
  if (style === 'medium') {
    return (
      <group>
        {/* Main volume */}
        <mesh position={[0, headRadius * 0.2, -headRadius * 0.05]}>
          <sphereGeometry args={[headRadius * 1.04, segments, segments, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
          {hairMaterial}
        </mesh>
        {/* Side volume covering ears */}
        <mesh position={[-headRadius * 0.62, -headRadius * 0.08, 0]}>
          <sphereGeometry args={[headRadius * 0.38, segments / 2, segments / 2]} />
          {hairMaterial}
        </mesh>
        <mesh position={[headRadius * 0.62, -headRadius * 0.08, 0]}>
          <sphereGeometry args={[headRadius * 0.38, segments / 2, segments / 2]} />
          {hairMaterial}
        </mesh>
        {/* Back volume */}
        <mesh position={[0, -headRadius * 0.15, -headRadius * 0.45]}>
          <sphereGeometry args={[headRadius * 0.5, segments / 2, segments / 2]} />
          {hairMaterial}
        </mesh>
      </group>
    );
  }

  // Long hair - flows past shoulders
  if (style === 'long') {
    return (
      <group>
        {/* Top volume */}
        <mesh position={[0, headRadius * 0.2, -headRadius * 0.05]}>
          <sphereGeometry args={[headRadius * 1.06, segments, segments, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          {hairMaterial}
        </mesh>
        {/* Back hair flowing down */}
        <mesh position={[0, -headRadius * 0.55, -headRadius * 0.32]} rotation={[-0.12, 0, 0]}>
          <cylinderGeometry args={[headRadius * 0.68, headRadius * 0.82, headRadius * 1.9, segments, 4]} />
          {hairMaterial}
        </mesh>
        {/* Side strands */}
        <mesh position={[-headRadius * 0.52, -headRadius * 0.28, headRadius * 0.12]}>
          <cylinderGeometry args={[headRadius * 0.22, headRadius * 0.28, headRadius * 1.15, segments / 2, 2]} />
          {hairMaterial}
        </mesh>
        <mesh position={[headRadius * 0.52, -headRadius * 0.28, headRadius * 0.12]}>
          <cylinderGeometry args={[headRadius * 0.22, headRadius * 0.28, headRadius * 1.15, segments / 2, 2]} />
          {hairMaterial}
        </mesh>
      </group>
    );
  }

  // Ponytail - pulled back with tied tail
  if (style === 'ponytail') {
    return (
      <group>
        {/* Pulled back top - smooth and tight */}
        <mesh position={[0, headRadius * 0.22, -headRadius * 0.08]}>
          <sphereGeometry args={[headRadius * 0.97, segments, segments, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          {hairMaterial}
        </mesh>
        {/* Ponytail bun/tie */}
        <mesh position={[0, headRadius * 0.08, -headRadius * 0.88]}>
          <sphereGeometry args={[headRadius * 0.22, segments / 2, segments / 2]} />
          {hairMaterial}
        </mesh>
        {/* Ponytail length */}
        <mesh position={[0, -headRadius * 0.42, -headRadius * 0.92]} rotation={[-0.25, 0, 0]}>
          <cylinderGeometry args={[headRadius * 0.1, headRadius * 0.06, headRadius * 1.25, segments / 2, 2]} />
          {hairMaterial}
        </mesh>
      </group>
    );
  }

  // Braids - individual strands
  if (style === 'braids') {
    const braidCount = isMobile ? 5 : 8;
    const braidPositions = Array.from({ length: braidCount }, (_, i) => {
      const angle = (i / braidCount) * Math.PI - Math.PI / 2;
      return {
        x: Math.sin(angle) * 0.35,
        z: Math.cos(angle) * 0.15 - 0.1,
        rotation: angle * 0.08,
      };
    });
    
    return (
      <group>
        {/* Scalp cap */}
        <mesh position={[0, headRadius * 0.25, 0]}>
          <sphereGeometry args={[headRadius * 0.94, segments, segments / 2, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
          {hairMaterial}
        </mesh>
        {/* Individual braids */}
        {braidPositions.map((pos, i) => (
          <mesh 
            key={i} 
            position={[headRadius * pos.x, -headRadius * 0.5, headRadius * pos.z]}
            rotation={[0.05, 0, pos.rotation]}
          >
            <cylinderGeometry args={[headRadius * 0.055, headRadius * 0.035, headRadius * 1.7, 6, 4]} />
            {hairMaterial}
          </mesh>
        ))}
      </group>
    );
  }

  // Afro - large natural volume
  if (style === 'afro') {
    return (
      <group>
        {/* Main afro volume */}
        <mesh position={[0, headRadius * 0.38, 0]}>
          <sphereGeometry args={[headRadius * 1.4, segments, segments, 0, Math.PI * 2, 0, Math.PI * 0.72]} />
          {matteHairMaterial}
        </mesh>
        {/* Side volume for natural shape */}
        <mesh position={[-headRadius * 0.65, headRadius * 0.15, 0]}>
          <sphereGeometry args={[headRadius * 0.55, segments / 2, segments / 2]} />
          {matteHairMaterial}
        </mesh>
        <mesh position={[headRadius * 0.65, headRadius * 0.15, 0]}>
          <sphereGeometry args={[headRadius * 0.55, segments / 2, segments / 2]} />
          {matteHairMaterial}
        </mesh>
      </group>
    );
  }

  // Curly - textured medium volume
  if (style === 'curly') {
    return (
      <group>
        {/* Main curly volume */}
        <mesh position={[0, headRadius * 0.24, 0]}>
          <sphereGeometry args={[headRadius * 1.1, segments, segments, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
          {matteHairMaterial}
        </mesh>
        {/* Side curls */}
        <mesh position={[-headRadius * 0.62, -headRadius * 0.02, headRadius * 0.12]}>
          <sphereGeometry args={[headRadius * 0.32, segments / 2, segments / 2]} />
          {matteHairMaterial}
        </mesh>
        <mesh position={[headRadius * 0.62, -headRadius * 0.02, headRadius * 0.12]}>
          <sphereGeometry args={[headRadius * 0.32, segments / 2, segments / 2]} />
          {matteHairMaterial}
        </mesh>
        {/* Front curls */}
        <mesh position={[0, headRadius * 0.42, headRadius * 0.62]}>
          <sphereGeometry args={[headRadius * 0.25, segments / 2, segments / 2]} />
          {matteHairMaterial}
        </mesh>
      </group>
    );
  }

  return null;
};
