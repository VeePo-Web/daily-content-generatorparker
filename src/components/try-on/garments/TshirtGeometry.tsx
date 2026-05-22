import { useMemo } from 'react';
import * as THREE from 'three';
import { useFabricMaterial } from '../hooks/useFabricMaterial';
import { ShoulderJunction } from './ShoulderJunction';
import { applyFrontProjectionUVs } from '../utils/uvProjection';

interface TshirtGeometryProps {
  color?: string;
  imageUrl?: string;
  garmentType?: string;
  bodyScale?: { shoulderWidth: number; waistWidth: number };
  neckStyle?: 'crew' | 'vneck';
  fit?: 'fitted' | 'regular' | 'oversized';
}

export const TshirtGeometry = ({ 
  color = '#FAFAFA', 
  imageUrl,
  garmentType = 'tshirt',
  bodyScale = { shoulderWidth: 0.40, waistWidth: 0.32 },
  neckStyle = 'crew',
  fit = 'regular'
}: TshirtGeometryProps) => {
  const material = useFabricMaterial({ 
    type: 'cotton', 
    color, 
    imageUrl,
    garmentType
  });

  // Fit adjustments
  const fitScale = useMemo(() => {
    switch (fit) {
      case 'fitted': return { body: 0.95, sleeve: 0.9, length: 0.95 };
      case 'oversized': return { body: 1.12, sleeve: 1.15, length: 1.08 };
      default: return { body: 1, sleeve: 1, length: 1 };
    }
  }, [fit]);

  // Calculate shoulder attachment parameters - t-shirt has more visible armhole
  const shoulderParams = useMemo(() => ({
    bodyRadius: (bodyScale.shoulderWidth / 2 + 0.012) * fitScale.body,
    sleeveRadius: 0.056 * fitScale.sleeve,
    armDropAngle: 0.48, // More angle for set-in sleeve
    sleevePositionX: 0.21 * fitScale.body,
    sleevePositionY: neckStyle === 'vneck' ? 0.14 : 0.16,
  }), [bodyScale, fitScale, neckStyle]);

  // Create t-shirt body profile with shoulder overlap
  const bodyGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    const segments = 26;
    const bodyMultiplier = fitScale.body;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      let radius: number;
      
      if (t < 0.08) {
        // Collar
        const collarRadius = neckStyle === 'vneck' ? 0.085 : 0.088;
        radius = THREE.MathUtils.lerp(collarRadius, (bodyScale.shoulderWidth / 2 + 0.012) * bodyMultiplier, t / 0.08);
      } else if (t < 0.14) {
        // Shoulder region - add subtle bulge for sleeve overlap (more pronounced for t-shirt)
        const localT = (t - 0.08) / 0.06;
        const baseRadius = (bodyScale.shoulderWidth / 2 + 0.012) * bodyMultiplier;
        const shoulderBulge = Math.sin(localT * Math.PI) * 0.015; // More bulge for t-shirt
        radius = baseRadius + shoulderBulge;
      } else if (t < 0.3) {
        // Shoulders - t-shirts have more pronounced shoulder drop
        const localT = (t - 0.14) / 0.16;
        radius = THREE.MathUtils.lerp(
          (bodyScale.shoulderWidth / 2 + 0.012) * bodyMultiplier, 
          (bodyScale.waistWidth / 2 + 0.025) * bodyMultiplier, 
          localT * 0.35
        );
      } else if (t < 0.85) {
        // Body - slightly looser for t-shirt
        const localT = (t - 0.3) / 0.55;
        radius = THREE.MathUtils.lerp(
          (bodyScale.waistWidth / 2 + 0.025) * bodyMultiplier, 
          (bodyScale.waistWidth / 2 + 0.018) * bodyMultiplier, 
          localT
        );
      } else {
        // Hem - slight flare
        radius = (bodyScale.waistWidth / 2 + 0.022) * bodyMultiplier;
      }
      
      // T-shirts are shorter than sweatshirts
      const yRange = 0.22 * fitScale.length;
      const y = THREE.MathUtils.lerp(yRange, -yRange, t);
      points.push(new THREE.Vector2(radius, y));
    }
    
    const geometry = new THREE.LatheGeometry(points, 36);
    geometry.computeVertexNormals();
    
    // Apply front-projection UVs for texture mapping
    if (imageUrl) {
      applyFrontProjectionUVs(geometry, 'tshirt');
    }
    
    return geometry;
  }, [bodyScale, fitScale, neckStyle, imageUrl]);

  const sleeveLength = 0.13 * fitScale.sleeve;

  return (
    <group position={[0, 1.15, 0]}>
      {/* Main body */}
      <mesh geometry={bodyGeometry}>
        {material}
      </mesh>
      
      {/* Collar - crew or v-neck */}
      {neckStyle === 'crew' ? (
        <>
          <mesh position={[0, 0.24, 0]}>
            <torusGeometry args={[0.088, 0.016, 10, 32]} />
            {material}
          </mesh>
          {/* Inner collar detail */}
          <mesh position={[0, 0.235, 0]}>
            <torusGeometry args={[0.078, 0.008, 6, 28]} />
            <meshStandardMaterial color="#0a0a0a" roughness={1} />
          </mesh>
        </>
      ) : (
        /* V-neck collar */
        <group position={[0, 0.22, 0.04]}>
          {/* V-neck left side */}
          <mesh position={[-0.03, 0, 0]} rotation={[0, 0, 0.4]}>
            <boxGeometry args={[0.065, 0.012, 0.008]} />
            {material}
          </mesh>
          {/* V-neck right side */}
          <mesh position={[0.03, 0, 0]} rotation={[0, 0, -0.4]}>
            <boxGeometry args={[0.065, 0.012, 0.008]} />
            {material}
          </mesh>
        </group>
      )}
      
      {/* Left short sleeve with seamless shoulder junction */}
      <group position={[-shoulderParams.sleevePositionX, shoulderParams.sleevePositionY, 0]}>
        {/* Shoulder junction - bridges body to sleeve */}
        <ShoulderJunction
          bodyRadius={shoulderParams.bodyRadius}
          sleeveRadius={shoulderParams.sleeveRadius}
          armDropAngle={shoulderParams.armDropAngle}
          side="left"
          material={material}
          transitionLength={0.055}
        />
        
        {/* Main sleeve - short */}
        <group rotation={[0, 0, 0.48]}>
          <mesh position={[0, -sleeveLength / 2 - 0.02, 0]}>
            <cylinderGeometry args={[shoulderParams.sleeveRadius * 1.05, shoulderParams.sleeveRadius * 1.12, sleeveLength, 20]} />
            {material}
          </mesh>
          {/* Sleeve hem - slight roll */}
          <mesh position={[0, -sleeveLength - 0.01, 0]}>
            <torusGeometry args={[shoulderParams.sleeveRadius * 1.08, 0.008, 6, 20]} />
            {material}
          </mesh>
        </group>
      </group>
      
      {/* Right short sleeve with seamless shoulder junction */}
      <group position={[shoulderParams.sleevePositionX, shoulderParams.sleevePositionY, 0]}>
        {/* Shoulder junction - bridges body to sleeve */}
        <ShoulderJunction
          bodyRadius={shoulderParams.bodyRadius}
          sleeveRadius={shoulderParams.sleeveRadius}
          armDropAngle={shoulderParams.armDropAngle}
          side="right"
          material={material}
          transitionLength={0.055}
        />
        
        {/* Main sleeve - short */}
        <group rotation={[0, 0, -0.48]}>
          <mesh position={[0, -sleeveLength / 2 - 0.02, 0]}>
            <cylinderGeometry args={[shoulderParams.sleeveRadius * 1.05, shoulderParams.sleeveRadius * 1.12, sleeveLength, 20]} />
            {material}
          </mesh>
          {/* Sleeve hem - slight roll */}
          <mesh position={[0, -sleeveLength - 0.01, 0]}>
            <torusGeometry args={[shoulderParams.sleeveRadius * 1.08, 0.008, 6, 20]} />
            {material}
          </mesh>
        </group>
      </group>
      
      {/* Bottom hem - simple edge for t-shirt */}
      <mesh position={[0, -0.24 * fitScale.length, 0]}>
        <torusGeometry args={[(bodyScale.waistWidth / 2 + 0.022) * fitScale.body, 0.008, 6, 32]} />
        {material}
      </mesh>
    </group>
  );
};
