import { useMemo } from 'react';
import * as THREE from 'three';
import { useIsMobile } from '@/hooks/use-mobile';

interface PhotorealisticSkinMaterialProps {
  skinTone: string;
}

/**
 * PhotorealisticSkinMaterial - Enhanced skin shader with SSS simulation
 * 
 * Uses meshPhysicalMaterial with:
 * - Subsurface scattering via transmission
 * - Sheen for velvety skin feel
 * - Clearcoat for natural oils
 * - Optimized for mobile performance
 */
export const PhotorealisticSkinMaterial = ({ skinTone }: PhotorealisticSkinMaterialProps) => {
  const isMobile = useIsMobile();
  
  // Calculate SSS and specular colors from base skin tone
  const { sssColor, sheenColor } = useMemo(() => {
    const baseColor = new THREE.Color(skinTone);
    
    // SSS color: warmer and slightly lighter
    const sss = baseColor.clone();
    sss.offsetHSL(0.02, 0.1, 0.08);
    
    // Sheen color: warm undertones
    const sheen = baseColor.clone();
    sheen.offsetHSL(0.01, 0.05, 0.12);
    
    return {
      sssColor: `#${sss.getHexString()}`,
      sheenColor: sheen,
    };
  }, [skinTone]);
  
  // Performance-adjusted parameters
  const transmission = isMobile ? 0.06 : 0.14;
  const thickness = isMobile ? 0.12 : 0.28;
  const sheen = isMobile ? 0.18 : 0.28;
  
  return (
    <meshPhysicalMaterial
      color={skinTone}
      roughness={0.42}
      metalness={0}
      // Subsurface scattering simulation via transmission
      transmission={transmission}
      thickness={thickness}
      ior={1.38}
      // Skin sheen for velvety appearance
      sheen={sheen}
      sheenRoughness={0.38}
      sheenColor={sheenColor}
      // Micro surface detail (natural skin oils)
      clearcoat={0.06}
      clearcoatRoughness={0.65}
      // Environment reflection
      envMapIntensity={0.22}
    />
  );
};

/**
 * HairStrandMaterial - Material for realistic hair rendering
 */
interface HairStrandMaterialProps {
  color: string;
  isAfro?: boolean;
}

export const HairStrandMaterial = ({ color, isAfro = false }: HairStrandMaterialProps) => {
  return (
    <meshStandardMaterial
      color={color}
      roughness={isAfro ? 0.85 : 0.6}
      metalness={isAfro ? 0 : 0.08}
    />
  );
};
