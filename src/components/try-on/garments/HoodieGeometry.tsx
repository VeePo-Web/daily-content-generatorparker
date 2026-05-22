import { useMemo } from 'react';
import * as THREE from 'three';
import { useFabricMaterial } from '../hooks/useFabricMaterial';
import { ShoulderJunction } from './ShoulderJunction';
import { applyFrontProjectionUVs } from '../utils/uvProjection';

interface HoodieGeometryProps {
  color?: string;
  imageUrl?: string;
  garmentType?: string;
  bodyScale?: { shoulderWidth: number; waistWidth: number };
}

export const HoodieGeometry = ({ 
  color = '#1C1917', 
  imageUrl,
  garmentType = 'hoodie',
  bodyScale = { shoulderWidth: 0.40, waistWidth: 0.32 }
}: HoodieGeometryProps) => {
  const material = useFabricMaterial({ 
    type: 'fleece', 
    color, 
    imageUrl,
    garmentType
  });

  // Calculate shoulder attachment parameters
  const shoulderParams = useMemo(() => ({
    bodyRadius: bodyScale.shoulderWidth / 2 + 0.025,
    sleeveRadius: 0.068,
    armDropAngle: 0.35,
    sleevePositionX: 0.24,
    sleevePositionY: 0.20,
  }), [bodyScale]);

  // Create hoodie body profile with shoulder overlap built in
  const bodyGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    const segments = 28;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      let radius: number;
      
      if (t < 0.08) {
        // Collar area - slightly wider for hood attachment
        radius = THREE.MathUtils.lerp(0.13, bodyScale.shoulderWidth / 2 + 0.025, t / 0.08);
      } else if (t < 0.15) {
        // Shoulder region - add subtle bulge for sleeve overlap
        const localT = (t - 0.08) / 0.07;
        const baseRadius = bodyScale.shoulderWidth / 2 + 0.025;
        const shoulderBulge = Math.sin(localT * Math.PI) * 0.012;
        radius = baseRadius + shoulderBulge;
      } else if (t < 0.4) {
        // Upper chest - transition from shoulder to body
        const localT = (t - 0.15) / 0.25;
        radius = THREE.MathUtils.lerp(
          bodyScale.shoulderWidth / 2 + 0.025, 
          bodyScale.waistWidth / 2 + 0.045, 
          localT * 0.35
        );
      } else if (t < 0.7) {
        // Waist
        const localT = (t - 0.4) / 0.3;
        radius = THREE.MathUtils.lerp(bodyScale.waistWidth / 2 + 0.045, bodyScale.waistWidth / 2 + 0.035, localT);
      } else {
        // Hem (slight flare)
        const localT = (t - 0.7) / 0.3;
        radius = THREE.MathUtils.lerp(bodyScale.waistWidth / 2 + 0.035, bodyScale.waistWidth / 2 + 0.055, localT);
      }
      
      const y = THREE.MathUtils.lerp(0.30, -0.30, t);
      points.push(new THREE.Vector2(radius, y));
    }
    
    const geometry = new THREE.LatheGeometry(points, 40);
    geometry.computeVertexNormals();
    
    // Apply front-projection UVs for texture mapping
    if (imageUrl) {
      applyFrontProjectionUVs(geometry, 'hoodie');
    }
    
    return geometry;
  }, [bodyScale, imageUrl]);

  // Folded hood geometry - teardrop cross-section for realistic fabric
  const hoodGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    const segments = 20;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * Math.PI;
      // Teardrop shape - wider at bottom, tapered at top
      const radius = 0.11 + Math.sin(angle) * 0.05 * (1 - t * 0.3);
      const y = Math.cos(angle) * 0.10;
      points.push(new THREE.Vector2(radius, y));
    }
    
    const geometry = new THREE.LatheGeometry(points, 24, 0, Math.PI);
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  return (
    <group position={[0, 1.15, 0]}>
      {/* Main body */}
      <mesh geometry={bodyGeometry}>
        {material}
      </mesh>
      
      {/* Folded Hood - resting on shoulders */}
      <group position={[0, 0.32, -0.07]} rotation={[0.55, 0, 0]}>
        {/* Main hood shell */}
        <mesh geometry={hoodGeometry} rotation={[Math.PI / 2, 0, 0]}>
          {material}
        </mesh>
        
        {/* Hood opening rim - visible edge */}
        <mesh position={[0, 0.02, 0.06]} rotation={[-0.3, 0, 0]}>
          <torusGeometry args={[0.10, 0.015, 8, 24, Math.PI * 1.4]} />
          {material}
        </mesh>
        
        {/* Inner hood lining (darker) */}
        <mesh position={[0, -0.01, 0.02]} scale={[0.88, 0.88, 0.88]} rotation={[Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[0.09, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#0a0a0a" roughness={1} side={THREE.BackSide} />
        </mesh>
      </group>
      
      {/* Left sleeve with seamless shoulder junction */}
      <group position={[-shoulderParams.sleevePositionX, shoulderParams.sleevePositionY, 0]}>
        {/* Shoulder junction - bridges body to sleeve */}
        <ShoulderJunction
          bodyRadius={shoulderParams.bodyRadius}
          sleeveRadius={shoulderParams.sleeveRadius}
          armDropAngle={shoulderParams.armDropAngle}
          side="left"
          material={material}
          transitionLength={0.07}
        />
        
        {/* Main sleeve - starts after junction */}
        <group rotation={[0, 0, 0.35]}>
          <mesh position={[0, -0.16, 0]}>
            <cylinderGeometry args={[0.070, 0.058, 0.36, 24]} />
            {material}
          </mesh>
          {/* Sleeve cuff ribbing */}
          <mesh position={[0, -0.36, 0]}>
            <torusGeometry args={[0.055, 0.014, 10, 24]} />
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
          transitionLength={0.07}
        />
        
        {/* Main sleeve - starts after junction */}
        <group rotation={[0, 0, -0.35]}>
          <mesh position={[0, -0.16, 0]}>
            <cylinderGeometry args={[0.070, 0.058, 0.36, 24]} />
            {material}
          </mesh>
          {/* Sleeve cuff ribbing */}
          <mesh position={[0, -0.36, 0]}>
            <torusGeometry args={[0.055, 0.014, 10, 24]} />
            {material}
          </mesh>
        </group>
      </group>
      
      {/* 3D Kangaroo pocket with depth */}
      <group position={[0, -0.06, 0.17]}>
        {/* Pocket pouch - curved surface with volume */}
        <mesh rotation={[-0.12, 0, 0]}>
          <boxGeometry args={[0.24, 0.11, 0.035]} />
          {material}
        </mesh>
        
        {/* Pocket top edge - slightly raised */}
        <mesh position={[0, 0.058, 0.012]}>
          <boxGeometry args={[0.22, 0.012, 0.02]} />
          {material}
        </mesh>
        
        {/* Center opening slit */}
        <mesh position={[0, 0.02, 0.022]}>
          <boxGeometry args={[0.018, 0.04, 0.008]} />
          <meshStandardMaterial color="#0a0a0a" roughness={1} />
        </mesh>
        
        {/* Left hand opening */}
        <mesh position={[-0.06, 0.01, 0.022]}>
          <boxGeometry args={[0.05, 0.008, 0.006]} />
          <meshStandardMaterial color="#0a0a0a" roughness={1} />
        </mesh>
        
        {/* Right hand opening */}
        <mesh position={[0.06, 0.01, 0.022]}>
          <boxGeometry args={[0.05, 0.008, 0.006]} />
          <meshStandardMaterial color="#0a0a0a" roughness={1} />
        </mesh>
      </group>
      
      {/* Drawstrings */}
      <mesh position={[-0.04, 0.30, 0.14]}>
        <cylinderGeometry args={[0.004, 0.004, 0.16, 8]} />
        <meshStandardMaterial color="#d4d4d4" roughness={0.9} />
      </mesh>
      <mesh position={[0.04, 0.30, 0.14]}>
        <cylinderGeometry args={[0.004, 0.004, 0.16, 8]} />
        <meshStandardMaterial color="#d4d4d4" roughness={0.9} />
      </mesh>
      
      {/* Bottom ribbing */}
      <mesh position={[0, -0.32, 0]}>
        <torusGeometry args={[bodyScale.waistWidth / 2 + 0.055, 0.02, 10, 36]} />
        {material}
      </mesh>
    </group>
  );
};
