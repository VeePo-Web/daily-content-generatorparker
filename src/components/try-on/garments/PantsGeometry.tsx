import { useMemo } from 'react';
import * as THREE from 'three';
import { useFabricMaterial } from '../hooks/useFabricMaterial';

interface PantsGeometryProps {
  color?: string;
  imageUrl?: string;
  garmentType?: string;
  bodyScale?: { hipWidth: number; legThickness: number };
  style?: 'straight' | 'slim' | 'relaxed';
}

export const PantsGeometry = ({ 
  color = '#1C1917', 
  imageUrl,
  garmentType = 'pants',
  bodyScale = { hipWidth: 0.38, legThickness: 0.08 },
  style = 'straight'
}: PantsGeometryProps) => {
  const material = useFabricMaterial({ 
    type: 'denim', 
    color, 
    imageUrl,
    garmentType
  });

  // Style multipliers for leg taper
  const styleMultipliers = {
    slim: { thigh: 0.95, ankle: 0.7 },
    straight: { thigh: 1.0, ankle: 0.85 },
    relaxed: { thigh: 1.1, ankle: 0.95 },
  };

  const mult = styleMultipliers[style];

  // Create leg geometry
  const createLegGeometry = useMemo(() => {
    const thighRadius = bodyScale.legThickness * mult.thigh + 0.015;
    const ankleRadius = bodyScale.legThickness * mult.ankle * 0.6;
    
    const points: THREE.Vector2[] = [];
    const segments = 16;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const radius = THREE.MathUtils.lerp(thighRadius, ankleRadius, t);
      const y = THREE.MathUtils.lerp(0.22, -0.38, t);
      points.push(new THREE.Vector2(radius, y));
    }
    
    return new THREE.LatheGeometry(points, 20);
  }, [bodyScale, mult]);

  return (
    <group position={[0, 0.875, 0]}>
      {/* Waistband */}
      <mesh position={[0, 0.26, 0]}>
        <torusGeometry args={[bodyScale.hipWidth / 2 + 0.02, 0.025, 8, 32]} />
        {material}
      </mesh>
      
      {/* Belt loops (5 around) */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2;
        const x = Math.sin(angle) * (bodyScale.hipWidth / 2 + 0.02);
        const z = Math.cos(angle) * (bodyScale.hipWidth / 2 + 0.02);
        return (
          <mesh key={i} position={[x, 0.26, z]} rotation={[0, -angle, 0]}>
            <boxGeometry args={[0.015, 0.04, 0.008]} />
            {material}
          </mesh>
        );
      })}
      
      {/* Hip/seat area */}
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[
          bodyScale.hipWidth / 2 + 0.015,
          bodyScale.hipWidth / 2 - 0.02,
          0.12,
          24
        ]} />
        {material}
      </mesh>
      
      {/* Crotch gusset */}
      <mesh position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.08, 0.1, 16]} />
        {material}
      </mesh>
      
      {/* Left leg */}
      <group position={[-0.09, -0.08, 0]}>
        <mesh geometry={createLegGeometry}>
          {material}
        </mesh>
        {/* Knee seam detail */}
        <mesh position={[0, -0.12, 0.07]}>
          <boxGeometry args={[0.04, 0.003, 0.003]} />
          <meshStandardMaterial color="#0a0a0a" roughness={1} />
        </mesh>
      </group>
      
      {/* Right leg */}
      <group position={[0.09, -0.08, 0]}>
        <mesh geometry={createLegGeometry}>
          {material}
        </mesh>
        {/* Knee seam detail */}
        <mesh position={[0, -0.12, 0.07]}>
          <boxGeometry args={[0.04, 0.003, 0.003]} />
          <meshStandardMaterial color="#0a0a0a" roughness={1} />
        </mesh>
      </group>
      
      {/* Front pocket stitching (left) */}
      <mesh position={[-0.12, 0.16, 0.08]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.08, 0.002, 0.06]} />
        <meshStandardMaterial color="#0a0a0a" roughness={1} transparent opacity={0.3} />
      </mesh>
      
      {/* Front pocket stitching (right) */}
      <mesh position={[0.12, 0.16, 0.08]} rotation={[0, -0.3, 0]}>
        <boxGeometry args={[0.08, 0.002, 0.06]} />
        <meshStandardMaterial color="#0a0a0a" roughness={1} transparent opacity={0.3} />
      </mesh>
    </group>
  );
};
