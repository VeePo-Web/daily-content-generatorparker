import { useMemo } from 'react';
import * as THREE from 'three';

interface ShoulderJunctionProps {
  bodyRadius: number;
  sleeveRadius: number;
  armDropAngle: number;
  side: 'left' | 'right';
  material: JSX.Element;
  transitionLength?: number;
  showSeam?: boolean;
}

export const ShoulderJunction = ({
  bodyRadius,
  sleeveRadius,
  armDropAngle,
  side,
  material,
  transitionLength = 0.08,
  showSeam = false,
}: ShoulderJunctionProps) => {
  const sign = side === 'left' ? -1 : 1;
  
  // Create smooth bezier curve from body edge to sleeve top
  const junctionGeometry = useMemo(() => {
    // Start at body shoulder edge
    const start = new THREE.Vector3(0, 0, 0);
    
    // End at sleeve top (accounting for rotation)
    const end = new THREE.Vector3(
      transitionLength * Math.cos(armDropAngle) * sign,
      -transitionLength * Math.sin(armDropAngle),
      0
    );
    
    // Control points for smooth bezier curve - creates natural deltoid shape
    const ctrl1 = new THREE.Vector3(
      transitionLength * 0.25 * sign,
      0.005, // Slight upward bulge for deltoid
      0
    );
    const ctrl2 = new THREE.Vector3(
      transitionLength * 0.65 * sign,
      -transitionLength * Math.sin(armDropAngle) * 0.4,
      0
    );
    
    const curve = new THREE.CubicBezierCurve3(start, ctrl1, ctrl2, end);
    
    // Create tube with radius that transitions from body to sleeve
    // Using slightly larger radius to ensure overlap
    const avgRadius = (bodyRadius * 0.4 + sleeveRadius * 0.6) * 1.15;
    const geometry = new THREE.TubeGeometry(curve, 20, avgRadius, 24, false);
    geometry.computeVertexNormals();
    
    return geometry;
  }, [bodyRadius, sleeveRadius, armDropAngle, sign, transitionLength]);

  // Deltoid muscle bulge - adds anatomical realism
  const deltoidGeometry = useMemo(() => {
    const geometry = new THREE.SphereGeometry(sleeveRadius * 0.85, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6);
    geometry.computeVertexNormals();
    return geometry;
  }, [sleeveRadius]);

  // Position for deltoid bulge
  const deltoidPosition: [number, number, number] = [
    transitionLength * 0.35 * sign,
    0.01,
    0
  ];

  return (
    <group>
      {/* Main junction tube - bridges body and sleeve */}
      <mesh geometry={junctionGeometry}>
        {material}
      </mesh>
      
      {/* Deltoid bulge - adds natural shoulder shape */}
      <mesh 
        geometry={deltoidGeometry} 
        position={deltoidPosition}
        rotation={[0, 0, armDropAngle * sign * 0.3]}
        scale={[1.1, 0.7, 0.9]}
      >
        {material}
      </mesh>
      
      {/* Optional seam line at armhole */}
      {showSeam && (
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[bodyRadius * 0.95, 0.002, 4, 24, Math.PI * 0.8]} />
          <meshStandardMaterial color="#1a1a1a" roughness={1} />
        </mesh>
      )}
    </group>
  );
};

// Helper hook for calculating shoulder parameters from body scale
export const useShoulderParams = (bodyScale: { shoulderWidth: number; waistWidth: number }) => {
  return useMemo(() => ({
    bodyRadiusAtShoulder: bodyScale.shoulderWidth / 2 + 0.02,
    sleeveAttachmentY: 0.20,
    sleeveAttachmentX: 0.24,
  }), [bodyScale]);
};
