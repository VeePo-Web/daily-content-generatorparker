import { useMemo } from 'react';
import * as THREE from 'three';
import { useFabricMaterial } from '../hooks/useFabricMaterial';

interface TankTopGeometryProps {
  color?: string;
  imageUrl?: string;
  garmentType?: string;
  bodyScale?: { shoulderWidth: number; waistWidth: number };
  neckStyle?: 'scoop' | 'crew' | 'racerback';
}

export const TankTopGeometry = ({ 
  color = '#FAFAFA', 
  imageUrl,
  garmentType = 'tank',
  bodyScale = { shoulderWidth: 0.38, waistWidth: 0.30 },
  neckStyle = 'scoop'
}: TankTopGeometryProps) => {
  const material = useFabricMaterial({ 
    type: 'cotton', 
    color, 
    imageUrl,
    garmentType
  });

  // Create tank body profile - narrower at shoulders (no sleeves)
  const bodyGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    const segments = 22;
    
    // Racerback is narrower at shoulders
    const shoulderMultiplier = neckStyle === 'racerback' ? 0.75 : 0.85;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      let radius: number;
      
      if (t < 0.06) {
        // Neckline
        const neckRadius = neckStyle === 'scoop' ? 0.10 : 0.085;
        radius = THREE.MathUtils.lerp(
          neckRadius, 
          bodyScale.shoulderWidth / 2 * shoulderMultiplier, 
          t / 0.06
        );
      } else if (t < 0.25) {
        // Shoulder straps to armhole
        const localT = (t - 0.06) / 0.19;
        radius = THREE.MathUtils.lerp(
          bodyScale.shoulderWidth / 2 * shoulderMultiplier, 
          bodyScale.waistWidth / 2 + 0.02, 
          localT
        );
      } else if (t < 0.85) {
        // Body
        const localT = (t - 0.25) / 0.6;
        radius = THREE.MathUtils.lerp(
          bodyScale.waistWidth / 2 + 0.02, 
          bodyScale.waistWidth / 2 + 0.015, 
          localT
        );
      } else {
        // Hem
        radius = bodyScale.waistWidth / 2 + 0.018;
      }
      
      const y = THREE.MathUtils.lerp(0.22, -0.22, t);
      points.push(new THREE.Vector2(radius, y));
    }
    
    return new THREE.LatheGeometry(points, 32);
  }, [bodyScale, neckStyle]);

  // Strap width varies by style
  const strapWidth = neckStyle === 'racerback' ? 0.025 : 0.035;

  return (
    <group position={[0, 1.25, 0]}>
      {/* Main body */}
      <mesh geometry={bodyGeometry}>
        {material}
      </mesh>
      
      {/* Neckline trim */}
      {neckStyle === 'scoop' ? (
        <mesh position={[0, 0.22, 0.03]} rotation={[0.3, 0, 0]}>
          <torusGeometry args={[0.095, 0.008, 6, 24, Math.PI]} />
          {material}
        </mesh>
      ) : (
        <mesh position={[0, 0.23, 0]}>
          <torusGeometry args={[0.085, 0.012, 8, 32]} />
          {material}
        </mesh>
      )}
      
      {/* Left shoulder strap */}
      <mesh 
        position={[-0.06, 0.22, 0]} 
        rotation={[0, 0, 0.1]}
      >
        <boxGeometry args={[strapWidth, 0.04, 0.012]} />
        {material}
      </mesh>
      
      {/* Right shoulder strap */}
      <mesh 
        position={[0.06, 0.22, 0]} 
        rotation={[0, 0, -0.1]}
      >
        <boxGeometry args={[strapWidth, 0.04, 0.012]} />
        {material}
      </mesh>
      
      {/* Armhole trim - left */}
      <mesh position={[-0.14, 0.12, 0]} rotation={[0, 0, 0.4]}>
        <torusGeometry args={[0.06, 0.006, 6, 16, Math.PI]} />
        {material}
      </mesh>
      
      {/* Armhole trim - right */}
      <mesh position={[0.14, 0.12, 0]} rotation={[0, 0, -0.4]}>
        <torusGeometry args={[0.06, 0.006, 6, 16, Math.PI]} />
        {material}
      </mesh>
      
      {/* Bottom hem */}
      <mesh position={[0, -0.23, 0]}>
        <torusGeometry args={[bodyScale.waistWidth / 2 + 0.018, 0.006, 6, 32]} />
        {material}
      </mesh>
    </group>
  );
};
