/**
 * Advanced Skin Material with Enhanced Subsurface Scattering
 * 
 * Cinema-quality skin rendering using meshPhysicalMaterial
 * with proper SSS simulation via transmission and sheen.
 */

import { useMemo } from 'react';
import * as THREE from 'three';
import { useIsMobile } from '@/hooks/use-mobile';

interface AdvancedSkinMaterialProps {
  skinTone: string;
  quality?: 'low' | 'medium' | 'high';
}

// Skin tone presets with SSS color adjustments
const getSSSColor = (skinTone: string): string => {
  const baseColor = new THREE.Color(skinTone);
  const hsl = { h: 0, s: 0, l: 0 };
  baseColor.getHSL(hsl);
  
  // SSS color is warmer and slightly more saturated
  const sssColor = new THREE.Color().setHSL(
    hsl.h + 0.02, // Slightly more orange
    Math.min(1, hsl.s + 0.1), // More saturated
    Math.min(1, hsl.l + 0.1)  // Slightly lighter
  );
  
  return `#${sssColor.getHexString()}`;
};

export const AdvancedSkinMaterial = ({ 
  skinTone, 
  quality = 'high' 
}: AdvancedSkinMaterialProps) => {
  const isMobile = useIsMobile();
  const effectiveQuality = isMobile ? 'low' : quality;
  
  const sssColor = useMemo(() => getSSSColor(skinTone), [skinTone]);
  
  // Quality-based material properties
  const materialProps = useMemo(() => {
    const base = {
      color: skinTone,
      roughness: 0.42,
      metalness: 0,
    };
    
    switch (effectiveQuality) {
      case 'low':
        // Mobile: No SSS, simpler material
        return {
          ...base,
          roughness: 0.5,
          clearcoat: 0.02,
          clearcoatRoughness: 0.8,
        };
        
      case 'medium':
        return {
          ...base,
          transmission: 0.08,
          thickness: 0.15,
          ior: 1.38,
          sheen: 0.1,
          sheenRoughness: 0.5,
          sheenColor: sssColor,
        };
        
      case 'high':
      default:
        return {
          ...base,
          transmission: 0.15,
          thickness: 0.3,
          ior: 1.38,
          clearcoat: 0.02,
          clearcoatRoughness: 0.8,
          sheen: 0.2,
          sheenRoughness: 0.4,
          sheenColor: sssColor,
          envMapIntensity: 0.2,
        };
    }
  }, [skinTone, sssColor, effectiveQuality]);

  return <meshPhysicalMaterial {...materialProps} />;
};

// Default ceramic material for mannequin aesthetic
export const CeramicMaterial = () => {
  const isMobile = useIsMobile();
  
  return (
    <meshPhysicalMaterial
      color="#E8E4E0"
      roughness={isMobile ? 0.8 : 0.72}
      metalness={0}
      clearcoat={isMobile ? 0 : 0.03}
      clearcoatRoughness={0.8}
      envMapIntensity={isMobile ? 0.1 : 0.15}
    />
  );
};
