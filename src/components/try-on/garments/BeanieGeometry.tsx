import { useMemo } from 'react';
import * as THREE from 'three';
import { useFabricMaterial } from '../hooks/useFabricMaterial';

interface BeanieGeometryProps {
  color?: string;
  imageUrl?: string;
  style?: 'cuffed' | 'slouchy' | 'fitted';
}

export const BeanieGeometry = ({ 
  color = '#1C1917', 
  imageUrl,
  style = 'cuffed'
}: BeanieGeometryProps) => {
  const material = useFabricMaterial({ 
    type: 'knit', 
    color, 
    imageUrl 
  });

  // Create beanie crown profile
  const crownGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    const segments = 16;
    
    // Height varies by style
    const heightMultiplier = style === 'slouchy' ? 1.3 : style === 'fitted' ? 0.85 : 1.0;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      let radius: number;
      
      if (t < 0.1) {
        // Top of beanie - gathered point
        radius = THREE.MathUtils.lerp(0.01, 0.08, t / 0.1);
      } else if (t < 0.7) {
        // Crown dome
        const localT = (t - 0.1) / 0.6;
        radius = THREE.MathUtils.lerp(0.08, 0.11, Math.sin(localT * Math.PI / 2));
      } else {
        // Sides tapering to head
        const localT = (t - 0.7) / 0.3;
        radius = THREE.MathUtils.lerp(0.11, 0.105, localT);
      }
      
      const y = THREE.MathUtils.lerp(0.12 * heightMultiplier, -0.02, t);
      points.push(new THREE.Vector2(radius, y));
    }
    
    return new THREE.LatheGeometry(points, 24);
  }, [style]);

  return (
    <group position={[0, 1.74, 0]}>
      {/* Main crown */}
      <mesh geometry={crownGeometry}>
        {material}
      </mesh>
      
      {/* Cuff (if cuffed style) */}
      {style === 'cuffed' && (
        <group position={[0, -0.02, 0]}>
          {/* Main cuff band */}
          <mesh>
            <cylinderGeometry args={[0.108, 0.105, 0.04, 24]} />
            {material}
          </mesh>
          {/* Cuff fold line */}
          <mesh position={[0, 0.018, 0]}>
            <torusGeometry args={[0.108, 0.004, 6, 24]} />
            <meshStandardMaterial color="#0a0a0a" roughness={1} />
          </mesh>
          {/* Bottom edge */}
          <mesh position={[0, -0.02, 0]}>
            <torusGeometry args={[0.105, 0.006, 6, 24]} />
            {material}
          </mesh>
        </group>
      )}
      
      {/* Fitted/slouchy bottom edge */}
      {style !== 'cuffed' && (
        <mesh position={[0, -0.02, 0]}>
          <torusGeometry args={[0.105, 0.008, 8, 24]} />
          {material}
        </mesh>
      )}
      
      {/* Top gathered detail */}
      <mesh position={[0, 0.12, 0]}>
        <sphereGeometry args={[0.015, 12, 8]} />
        {material}
      </mesh>
    </group>
  );
};
