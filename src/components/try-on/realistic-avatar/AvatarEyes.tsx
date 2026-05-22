import { useMemo } from 'react';
import * as THREE from 'three';
import { useIsMobile } from '@/hooks/use-mobile';

interface AvatarEyesProps {
  headRadius: number;
  eyeSize: number; // 0-100
  skinTone: string;
  irisColor?: string;
}

/**
 * AvatarEyes - Photorealistic eye system with cornea, iris depth, and reflections
 * 
 * Enhancements over basic eyes:
 * - Multi-layer eye structure (sclera, iris, pupil, cornea)
 * - Wet cornea with environment reflections
 * - Eye socket shadows for depth
 * - Realistic iris colors and patterns
 */
export const AvatarEyes = ({ 
  headRadius, 
  eyeSize, 
  skinTone,
  irisColor = '#6B4423' 
}: AvatarEyesProps) => {
  const isMobile = useIsMobile();
  const segments = isMobile ? 16 : 32;
  
  const eyeScale = 0.7 + (eyeSize / 100) * 0.6; // 0.7 to 1.3 scale
  const eyeRadius = headRadius * 0.065 * eyeScale;
  const eyeSpacing = headRadius * 0.22;
  const eyeY = headRadius * 0.05;
  const eyeZ = headRadius * 0.78;
  
  // Calculate eye socket darker color for depth
  const socketColor = useMemo(() => {
    const color = new THREE.Color(skinTone);
    color.multiplyScalar(0.82);
    return `#${color.getHexString()}`;
  }, [skinTone]);

  // Shared eye component to reduce code duplication
  const Eye = ({ side }: { side: 'left' | 'right' }) => {
    const xPos = side === 'left' ? -eyeSpacing : eyeSpacing;
    const highlightX = side === 'left' ? eyeRadius * 0.22 : -eyeRadius * 0.22;
    
    return (
      <group position={[xPos, eyeY, eyeZ]}>
        {/* Eye socket shadow - creates depth around the eye */}
        <mesh position={[0, -0.003, -0.008]}>
          <sphereGeometry args={[eyeRadius * 1.35, segments / 2, segments / 2]} />
          <meshStandardMaterial 
            color={socketColor} 
            roughness={0.9} 
            transparent 
            opacity={0.7} 
          />
        </mesh>
        
        {/* Sclera (white of eye) */}
        <mesh>
          <sphereGeometry args={[eyeRadius, segments, segments]} />
          <meshPhysicalMaterial
            color="#FFFDF8"
            roughness={0.12}
            metalness={0}
            clearcoat={0.6}
            clearcoatRoughness={0.15}
            envMapIntensity={0.4}
          />
        </mesh>
        
        {/* Iris base */}
        <mesh position={[0, 0, eyeRadius * 0.82]}>
          <circleGeometry args={[eyeRadius * 0.48, segments]} />
          <meshStandardMaterial 
            color={irisColor} 
            roughness={0.35}
            metalness={0.05}
          />
        </mesh>
        
        {/* Iris detail ring - adds depth */}
        <mesh position={[0, 0, eyeRadius * 0.83]}>
          <ringGeometry args={[eyeRadius * 0.25, eyeRadius * 0.46, segments]} />
          <meshStandardMaterial 
            color={new THREE.Color(irisColor).multiplyScalar(0.7).getStyle()} 
            roughness={0.4}
          />
        </mesh>
        
        {/* Pupil */}
        <mesh position={[0, 0, eyeRadius * 0.85]}>
          <circleGeometry args={[eyeRadius * 0.22, segments]} />
          <meshBasicMaterial color="#0A0A0A" />
        </mesh>
        
        {/* Cornea - wet reflective layer over iris */}
        <mesh position={[0, 0, eyeRadius * 0.88]}>
          <sphereGeometry 
            args={[eyeRadius * 0.55, segments, segments / 2, 0, Math.PI * 2, 0, Math.PI * 0.5]} 
          />
          <meshPhysicalMaterial
            color="#FFFFFF"
            transparent
            opacity={0.18}
            roughness={0.02}
            metalness={0.3}
            envMapIntensity={1.8}
            clearcoat={1}
            clearcoatRoughness={0}
          />
        </mesh>
        
        {/* Primary catchlight - main light reflection */}
        <mesh position={[highlightX, eyeRadius * 0.15, eyeRadius * 0.92]}>
          <circleGeometry args={[eyeRadius * 0.12, 12]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.85} />
        </mesh>
        
        {/* Secondary catchlight - smaller accent */}
        <mesh position={[-highlightX * 0.5, -eyeRadius * 0.08, eyeRadius * 0.91]}>
          <circleGeometry args={[eyeRadius * 0.05, 8]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.5} />
        </mesh>
      </group>
    );
  };

  return (
    <group>
      <Eye side="left" />
      <Eye side="right" />
    </group>
  );
};
