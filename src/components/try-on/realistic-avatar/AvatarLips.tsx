import { useMemo } from 'react';
import * as THREE from 'three';

interface AvatarLipsProps {
  headRadius: number;
  lipFullness: number; // 0-100 from face config
  skinTone: string;
  isMobile?: boolean;
}

/**
 * Anatomical lips with cupid's bow, vermilion border, and proper volume
 * Replaces the half-sphere with realistic lip geometry
 */
export const AvatarLips = ({
  headRadius,
  lipFullness,
  skinTone,
  isMobile = false,
}: AvatarLipsProps) => {
  const segments = isMobile ? 16 : 32;
  const fullnessMod = 0.7 + (lipFullness / 100) * 0.6; // 0.7 to 1.3

  // Calculate lip color (natural pink-red tint based on skin tone)
  const lipColor = useMemo(() => {
    const skin = new THREE.Color(skinTone);
    const lipTint = new THREE.Color('#C47070');
    skin.lerp(lipTint, 0.5);
    return `#${skin.getHexString()}`;
  }, [skinTone]);

  // Upper lip geometry with cupid's bow
  const upperLipGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const width = headRadius * 0.08;
    const height = headRadius * 0.025 * fullnessMod;
    
    // Start from left corner
    shape.moveTo(-width, 0);
    
    // Left side curve to cupid's bow
    shape.quadraticCurveTo(-width * 0.5, height * 0.8, -width * 0.15, height * 0.5);
    
    // Cupid's bow dip
    shape.quadraticCurveTo(0, height * 0.2, width * 0.15, height * 0.5);
    
    // Right side curve
    shape.quadraticCurveTo(width * 0.5, height * 0.8, width, 0);
    
    // Back through bottom
    shape.quadraticCurveTo(width * 0.5, -height * 0.2, 0, -height * 0.15);
    shape.quadraticCurveTo(-width * 0.5, -height * 0.2, -width, 0);
    
    return new THREE.ExtrudeGeometry(shape, {
      depth: headRadius * 0.02 * fullnessMod,
      bevelEnabled: true,
      bevelThickness: 0.003,
      bevelSize: 0.003,
      bevelSegments: isMobile ? 2 : 4,
    });
  }, [headRadius, fullnessMod, isMobile]);

  // Lower lip geometry - fuller, simpler curve
  const lowerLipGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const width = headRadius * 0.07;
    const height = headRadius * 0.03 * fullnessMod;
    
    // Rounded bottom lip
    shape.moveTo(-width, 0);
    shape.quadraticCurveTo(-width * 0.5, -height, 0, -height * 1.1);
    shape.quadraticCurveTo(width * 0.5, -height, width, 0);
    shape.quadraticCurveTo(width * 0.5, height * 0.3, 0, height * 0.4);
    shape.quadraticCurveTo(-width * 0.5, height * 0.3, -width, 0);
    
    return new THREE.ExtrudeGeometry(shape, {
      depth: headRadius * 0.025 * fullnessMod,
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.004,
      bevelSegments: isMobile ? 2 : 4,
    });
  }, [headRadius, fullnessMod, isMobile]);

  // Philtrum (groove between nose and upper lip)
  const philtrumGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const width = headRadius * 0.015;
    const height = headRadius * 0.035;
    
    shape.moveTo(-width, 0);
    shape.lineTo(-width * 0.3, height);
    shape.quadraticCurveTo(0, height * 1.1, width * 0.3, height);
    shape.lineTo(width, 0);
    shape.quadraticCurveTo(0, height * 0.1, -width, 0);
    
    return new THREE.ExtrudeGeometry(shape, {
      depth: headRadius * 0.008,
      bevelEnabled: false,
    });
  }, [headRadius]);

  const lipY = -headRadius * 0.25;
  const lipZ = headRadius * 0.8;

  // Slightly darker color for lip line
  const lipLineColor = useMemo(() => {
    const color = new THREE.Color(lipColor);
    color.multiplyScalar(0.7);
    return `#${color.getHexString()}`;
  }, [lipColor]);

  return (
    <group position={[0, lipY, lipZ]}>
      {/* Upper lip */}
      <mesh 
        geometry={upperLipGeometry}
        position={[0, headRadius * 0.01, 0]}
        rotation={[0.15, 0, 0]}
      >
        <meshPhysicalMaterial
          color={lipColor}
          roughness={0.35}
          metalness={0}
          clearcoat={0.25}
          clearcoatRoughness={0.4}
          sheen={0.3}
          sheenRoughness={0.5}
          sheenColor={lipColor}
        />
      </mesh>
      
      {/* Upper lip tubercle (center bump) */}
      <mesh position={[0, headRadius * 0.005, headRadius * 0.015]}>
        <sphereGeometry args={[headRadius * 0.015 * fullnessMod, segments / 2, segments / 4, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshPhysicalMaterial
          color={lipColor}
          roughness={0.3}
          clearcoat={0.3}
        />
      </mesh>
      
      {/* Lower lip */}
      <mesh 
        geometry={lowerLipGeometry}
        position={[0, -headRadius * 0.015, 0]}
        rotation={[-0.1, 0, 0]}
      >
        <meshPhysicalMaterial
          color={lipColor}
          roughness={0.3}
          metalness={0}
          clearcoat={0.3}
          clearcoatRoughness={0.35}
          sheen={0.35}
          sheenRoughness={0.4}
          sheenColor={lipColor}
        />
      </mesh>
      
      {/* Lip line / seam */}
      <mesh position={[0, -headRadius * 0.002, headRadius * 0.01]}>
        <boxGeometry args={[headRadius * 0.12, 0.001, 0.003]} />
        <meshStandardMaterial color={lipLineColor} roughness={0.6} />
      </mesh>
      
      {/* Philtrum */}
      <mesh 
        geometry={philtrumGeometry}
        position={[0, headRadius * 0.04, -headRadius * 0.01]}
        rotation={[-0.2, 0, 0]}
      >
        <meshPhysicalMaterial
          color={skinTone}
          roughness={0.5}
        />
      </mesh>
      
      {/* Philtrum ridges */}
      <mesh position={[-headRadius * 0.012, headRadius * 0.025, headRadius * 0.002]}>
        <cylinderGeometry args={[0.002, 0.002, headRadius * 0.04, 4]} />
        <meshPhysicalMaterial color={skinTone} roughness={0.5} />
      </mesh>
      <mesh position={[headRadius * 0.012, headRadius * 0.025, headRadius * 0.002]}>
        <cylinderGeometry args={[0.002, 0.002, headRadius * 0.04, 4]} />
        <meshPhysicalMaterial color={skinTone} roughness={0.5} />
      </mesh>
      
      {/* Mouth corners - subtle shadow spheres */}
      <mesh position={[-headRadius * 0.065, -headRadius * 0.005, -headRadius * 0.01]}>
        <sphereGeometry args={[headRadius * 0.012, 8, 8]} />
        <meshStandardMaterial 
          color={skinTone}
          roughness={0.7}
          transparent
          opacity={0.7}
        />
      </mesh>
      <mesh position={[headRadius * 0.065, -headRadius * 0.005, -headRadius * 0.01]}>
        <sphereGeometry args={[headRadius * 0.012, 8, 8]} />
        <meshStandardMaterial 
          color={skinTone}
          roughness={0.7}
          transparent
          opacity={0.7}
        />
      </mesh>
      
      {/* Chin cleft hint */}
      <mesh position={[0, -headRadius * 0.08, -headRadius * 0.02]}>
        <sphereGeometry args={[headRadius * 0.008, 8, 8]} />
        <meshStandardMaterial 
          color={skinTone}
          roughness={0.8}
          transparent
          opacity={0.5}
        />
      </mesh>
    </group>
  );
};
