import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LoadingAvatarProps {
  position?: [number, number, number];
}

/**
 * LoadingAvatar - Placeholder shown while GLB avatar loads
 * 
 * Displays a stylized wireframe silhouette with gentle animation
 */
export const LoadingAvatar = ({ position = [0, 0, 0] }: LoadingAvatarProps) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      // Gentle breathing/pulsing effect
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.02 + 1;
      groupRef.current.scale.setScalar(pulse);
    }
  });
  
  return (
    <group ref={groupRef} position={position}>
      {/* Head outline */}
      <mesh position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial 
          color="#888888" 
          wireframe 
          transparent 
          opacity={0.5} 
        />
      </mesh>
      
      {/* Torso outline */}
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.5, 12]} />
        <meshBasicMaterial 
          color="#888888" 
          wireframe 
          transparent 
          opacity={0.5} 
        />
      </mesh>
      
      {/* Hips */}
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.22, 0.18, 0.2, 12]} />
        <meshBasicMaterial 
          color="#888888" 
          wireframe 
          transparent 
          opacity={0.5} 
        />
      </mesh>
      
      {/* Left leg */}
      <mesh position={[-0.1, 0.35, 0]}>
        <cylinderGeometry args={[0.06, 0.05, 0.7, 8]} />
        <meshBasicMaterial 
          color="#888888" 
          wireframe 
          transparent 
          opacity={0.5} 
        />
      </mesh>
      
      {/* Right leg */}
      <mesh position={[0.1, 0.35, 0]}>
        <cylinderGeometry args={[0.06, 0.05, 0.7, 8]} />
        <meshBasicMaterial 
          color="#888888" 
          wireframe 
          transparent 
          opacity={0.5} 
        />
      </mesh>
      
      {/* Left arm */}
      <mesh position={[-0.28, 1.15, 0]} rotation={[0, 0, 0.15]}>
        <cylinderGeometry args={[0.04, 0.03, 0.5, 8]} />
        <meshBasicMaterial 
          color="#888888" 
          wireframe 
          transparent 
          opacity={0.5} 
        />
      </mesh>
      
      {/* Right arm */}
      <mesh position={[0.28, 1.15, 0]} rotation={[0, 0, -0.15]}>
        <cylinderGeometry args={[0.04, 0.03, 0.5, 8]} />
        <meshBasicMaterial 
          color="#888888" 
          wireframe 
          transparent 
          opacity={0.5} 
        />
      </mesh>
    </group>
  );
};
