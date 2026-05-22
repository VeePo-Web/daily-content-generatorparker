import { useMemo } from 'react';
import * as THREE from 'three';
import { useFabricMaterial } from '../hooks/useFabricMaterial';

interface ShortsGeometryProps {
  color?: string;
  imageUrl?: string;
  garmentType?: string;
  bodyScale?: { hipWidth: number; legThickness: number };
  length?: 'short' | 'mid' | 'long';
  style?: 'athletic' | 'casual' | 'swim';
}

export const ShortsGeometry = ({ 
  color = '#1C1917', 
  imageUrl,
  garmentType = 'shorts',
  bodyScale = { hipWidth: 0.34, legThickness: 0.12 },
  length = 'mid',
  style = 'casual'
}: ShortsGeometryProps) => {
  const material = useFabricMaterial({ 
    type: style === 'swim' ? 'cotton' : 'cotton', 
    color, 
    imageUrl,
    garmentType
  });

  // Length configuration
  const lengthConfig = useMemo(() => {
    switch (length) {
      case 'short': return { legLength: 0.10, inseam: 0.06 };
      case 'long': return { legLength: 0.22, inseam: 0.14 };
      default: return { legLength: 0.16, inseam: 0.10 };
    }
  }, [length]);

  // Style configuration
  const styleConfig = useMemo(() => {
    switch (style) {
      case 'athletic': return { legWidth: 1.25, waistHeight: 0.04 };
      case 'swim': return { legWidth: 1.15, waistHeight: 0.035 };
      default: return { legWidth: 1.0, waistHeight: 0.045 };
    }
  }, [style]);

  const legWidth = bodyScale.legThickness * styleConfig.legWidth;
  const { legLength, inseam } = lengthConfig;

  return (
    <group position={[0, 0.875, 0]}>
      {/* Waistband */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[
          bodyScale.hipWidth / 2 + 0.02,
          bodyScale.hipWidth / 2 + 0.025,
          styleConfig.waistHeight,
          32
        ]} />
        {material}
      </mesh>
      
      {/* Waistband top edge */}
      <mesh position={[0, 0.04, 0]}>
        <torusGeometry args={[bodyScale.hipWidth / 2 + 0.02, 0.008, 8, 32]} />
        {material}
      </mesh>
      
      {/* Hip/crotch area - connects waist to legs */}
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[
          bodyScale.hipWidth / 2 + 0.025,
          bodyScale.hipWidth / 2 + 0.015,
          0.06,
          32
        ]} />
        {material}
      </mesh>
      
      {/* Left leg */}
      <group position={[-bodyScale.hipWidth / 4 - 0.02, -inseam, 0]}>
        <mesh>
          <cylinderGeometry args={[
            legWidth + 0.02,
            legWidth + 0.025,
            legLength,
            20
          ]} />
          {material}
        </mesh>
        
        {/* Leg hem */}
        <mesh position={[0, -legLength / 2, 0]}>
          <torusGeometry args={[legWidth + 0.025, 0.006, 6, 20]} />
          {material}
        </mesh>
      </group>
      
      {/* Right leg */}
      <group position={[bodyScale.hipWidth / 4 + 0.02, -inseam, 0]}>
        <mesh>
          <cylinderGeometry args={[
            legWidth + 0.02,
            legWidth + 0.025,
            legLength,
            20
          ]} />
          {material}
        </mesh>
        
        {/* Leg hem */}
        <mesh position={[0, -legLength / 2, 0]}>
          <torusGeometry args={[legWidth + 0.025, 0.006, 6, 20]} />
          {material}
        </mesh>
      </group>
      
      {/* Crotch gusset - fills gap between legs */}
      <mesh position={[0, -0.05, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.06, 0.04, 0.04]} />
        {material}
      </mesh>
      
      {/* Side pockets (casual/athletic only) */}
      {style !== 'swim' && (
        <>
          {/* Left pocket */}
          <mesh position={[-bodyScale.hipWidth / 2, 0.0, 0.02]} rotation={[0, 0.2, 0]}>
            <boxGeometry args={[0.008, 0.06, 0.04]} />
            <meshStandardMaterial color="#0a0a0a" roughness={1} />
          </mesh>
          
          {/* Right pocket */}
          <mesh position={[bodyScale.hipWidth / 2, 0.0, 0.02]} rotation={[0, -0.2, 0]}>
            <boxGeometry args={[0.008, 0.06, 0.04]} />
            <meshStandardMaterial color="#0a0a0a" roughness={1} />
          </mesh>
        </>
      )}
      
      {/* Drawstring (athletic/swim) */}
      {(style === 'athletic' || style === 'swim') && (
        <>
          <mesh position={[-0.02, 0.035, bodyScale.hipWidth / 2 + 0.02]}>
            <cylinderGeometry args={[0.003, 0.003, 0.06, 6]} />
            <meshStandardMaterial color="#d4d4d4" roughness={0.9} />
          </mesh>
          <mesh position={[0.02, 0.035, bodyScale.hipWidth / 2 + 0.02]}>
            <cylinderGeometry args={[0.003, 0.003, 0.06, 6]} />
            <meshStandardMaterial color="#d4d4d4" roughness={0.9} />
          </mesh>
        </>
      )}
    </group>
  );
};
