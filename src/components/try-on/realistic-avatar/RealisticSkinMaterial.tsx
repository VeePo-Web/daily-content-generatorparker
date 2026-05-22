/**
 * Realistic Skin Material with Subsurface Scattering
 * 
 * Uses meshPhysicalMaterial with transmission to simulate
 * light passing through skin for photorealistic rendering.
 */

interface RealisticSkinMaterialProps {
  skinTone: string;
  isMobile?: boolean;
}

export const RealisticSkinMaterial = ({ skinTone, isMobile = false }: RealisticSkinMaterialProps) => {
  // On mobile, reduce transmission for better performance
  const transmission = isMobile ? 0.05 : 0.12;
  const thickness = isMobile ? 0.1 : 0.25;
  
  return (
    <meshPhysicalMaterial
      color={skinTone}
      roughness={0.45}
      metalness={0}
      transmission={transmission}
      thickness={thickness}
      ior={1.38}
      clearcoat={0.08}
      clearcoatRoughness={0.5}
      sheen={0.15}
      sheenRoughness={0.5}
      sheenColor="#FFE4C4"
      envMapIntensity={0.3}
    />
  );
};
