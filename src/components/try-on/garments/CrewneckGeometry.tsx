import { useMemo } from 'react';
import * as THREE from 'three';
import { useFabricMaterial } from '../hooks/useFabricMaterial';
import { ShoulderJunction } from './ShoulderJunction';
import { applyFrontProjectionUVs } from '../utils/uvProjection';

interface CrewneckGeometryProps {
  color?: string;
  imageUrl?: string;
  garmentType?: string;
  bodyScale?: { shoulderWidth: number; waistWidth: number };
}

export const CrewneckGeometry = ({ 
  color = '#1C1917', 
  imageUrl,
  garmentType = 'crewneck',
  bodyScale = { shoulderWidth: 0.40, waistWidth: 0.32 }
}: CrewneckGeometryProps) => {
  const material = useFabricMaterial({ 
    type: 'cotton', 
    color, 
    imageUrl,
    garmentType
  });

  // Calculate shoulder attachment parameters - crewneck is tighter than hoodie
  const shoulderParams = useMemo(() => ({
    bodyRadius: bodyScale.shoulderWidth / 2 + 0.018,
    sleeveRadius: 0.062,
    armDropAngle: 0.35,
    sleevePositionX: 0.23,
    sleevePositionY: 0.18,
  }), [bodyScale]);

  // Create crewneck body profile with shoulder overlap
  const bodyGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    const segments = 28;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      let radius: number;
      
      if (t < 0.08) {
        // Crew neck collar - tighter than hoodie
        radius = THREE.MathUtils.lerp(0.095, bodyScale.shoulderWidth / 2 + 0.018, t / 0.08);
      } else if (t < 0.14) {
        // Shoulder region - add subtle bulge for sleeve overlap
        const localT = (t - 0.08) / 0.06;
        const baseRadius = bodyScale.shoulderWidth / 2 + 0.018;
        const shoulderBulge = Math.sin(localT * Math.PI) * 0.010;
        radius = baseRadius + shoulderBulge;
      } else if (t < 0.35) {
        // Shoulders to chest
        const localT = (t - 0.14) / 0.21;
        radius = THREE.MathUtils.lerp(bodyScale.shoulderWidth / 2 + 0.018, bodyScale.waistWidth / 2 + 0.035, localT * 0.4);
      } else if (t < 0.7) {
        // Chest to waist
        const localT = (t - 0.35) / 0.35;
        radius = THREE.MathUtils.lerp(bodyScale.waistWidth / 2 + 0.035, bodyScale.waistWidth / 2 + 0.028, localT);
      } else {
        // Hem
        const localT = (t - 0.7) / 0.3;
        radius = THREE.MathUtils.lerp(bodyScale.waistWidth / 2 + 0.028, bodyScale.waistWidth / 2 + 0.045, localT);
      }
      
      const y = THREE.MathUtils.lerp(0.28, -0.28, t);
      points.push(new THREE.Vector2(radius, y));
    }
    
    const geometry = new THREE.LatheGeometry(points, 40);
    geometry.computeVertexNormals();
    
    // Apply front-projection UVs for texture mapping
    if (imageUrl) {
      applyFrontProjectionUVs(geometry, 'crewneck');
    }
    
    return geometry;
  }, [bodyScale, imageUrl]);

  return (
    <group position={[0, 1.15, 0]}>
      {/* Main body */}
      <mesh geometry={bodyGeometry}>
        {material}
      </mesh>
      
      {/* Crew neck collar ribbing - thicker and more defined */}
      <mesh position={[0, 0.30, 0]}>
        <torusGeometry args={[0.095, 0.025, 12, 36]} />
        {material}
      </mesh>
      
      {/* Collar inner ring for depth */}
      <mesh position={[0, 0.295, 0]}>
        <torusGeometry args={[0.085, 0.012, 8, 32]} />
        <meshStandardMaterial color="#0a0a0a" roughness={1} />
      </mesh>
      
      {/* Left sleeve with seamless shoulder junction */}
      <group position={[-shoulderParams.sleevePositionX, shoulderParams.sleevePositionY, 0]}>
        {/* Shoulder junction - bridges body to sleeve */}
        <ShoulderJunction
          bodyRadius={shoulderParams.bodyRadius}
          sleeveRadius={shoulderParams.sleeveRadius}
          armDropAngle={shoulderParams.armDropAngle}
          side="left"
          material={material}
          transitionLength={0.06}
        />
        
        {/* Main sleeve */}
        <group rotation={[0, 0, 0.35]}>
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.064, 0.052, 0.32, 24]} />
            {material}
          </mesh>
          {/* Sleeve cuff ribbing */}
          <mesh position={[0, -0.33, 0]}>
            <torusGeometry args={[0.050, 0.014, 10, 24]} />
            {material}
          </mesh>
        </group>
      </group>
      
      {/* Right sleeve with seamless shoulder junction */}
      <group position={[shoulderParams.sleevePositionX, shoulderParams.sleevePositionY, 0]}>
        {/* Shoulder junction - bridges body to sleeve */}
        <ShoulderJunction
          bodyRadius={shoulderParams.bodyRadius}
          sleeveRadius={shoulderParams.sleeveRadius}
          armDropAngle={shoulderParams.armDropAngle}
          side="right"
          material={material}
          transitionLength={0.06}
        />
        
        {/* Main sleeve */}
        <group rotation={[0, 0, -0.35]}>
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.064, 0.052, 0.32, 24]} />
            {material}
          </mesh>
          {/* Sleeve cuff ribbing */}
          <mesh position={[0, -0.33, 0]}>
            <torusGeometry args={[0.050, 0.014, 10, 24]} />
            {material}
          </mesh>
        </group>
      </group>
      
      {/* Bottom ribbing */}
      <mesh position={[0, -0.30, 0]}>
        <torusGeometry args={[bodyScale.waistWidth / 2 + 0.045, 0.02, 10, 36]} />
        {material}
      </mesh>
    </group>
  );
};
