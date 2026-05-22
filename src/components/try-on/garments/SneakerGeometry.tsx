import { useMemo } from 'react';
import * as THREE from 'three';
import { useFabricMaterial } from '../hooks/useFabricMaterial';

interface SneakerGeometryProps {
  color?: string;
  imageUrl?: string;
  style?: 'low' | 'high' | 'runner';
}

export const SneakerGeometry = ({ 
  color = '#FAFAFA', 
  imageUrl,
  style = 'low'
}: SneakerGeometryProps) => {
  const material = useFabricMaterial({ 
    type: 'leather', 
    color, 
    imageUrl 
  });

  const ankleHeight = useMemo(() => {
    switch (style) {
      case 'high': return 0.06;
      case 'runner': return 0.03;
      default: return 0.025;
    }
  }, [style]);

  // Single sneaker component
  const Sneaker = ({ side }: { side: 'left' | 'right' }) => {
    const xPos = side === 'left' ? -0.09 : 0.09;
    
    return (
      <group position={[xPos, 0.02, 0.03]}>
        {/* Sole - bottom of shoe */}
        <mesh position={[0, -0.015, 0]} rotation={[Math.PI / 2.2, 0, 0]}>
          <capsuleGeometry args={[0.035, 0.10, 4, 12]} />
          <meshStandardMaterial 
            color="#1a1a1a" 
            roughness={0.9}
            metalness={0}
          />
        </mesh>
        
        {/* Midsole - white/colored layer */}
        <mesh position={[0, 0.0, 0]} rotation={[Math.PI / 2.2, 0, 0]}>
          <capsuleGeometry args={[0.038, 0.09, 4, 12]} />
          <meshStandardMaterial 
            color="#f5f5f5" 
            roughness={0.7}
            metalness={0}
          />
        </mesh>
        
        {/* Upper - main shoe body */}
        <mesh position={[0, 0.018, -0.01]} rotation={[Math.PI / 2.3, 0, 0]}>
          <capsuleGeometry args={[0.036, 0.08, 6, 14]} />
          {material}
        </mesh>
        
        {/* Toe box - rounded front */}
        <mesh position={[0, 0.015, 0.055]} rotation={[0.1, 0, 0]}>
          <sphereGeometry args={[0.032, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          {material}
        </mesh>
        
        {/* Heel counter */}
        <mesh position={[0, 0.02, -0.05]}>
          <boxGeometry args={[0.05, 0.035, 0.02]} />
          {material}
        </mesh>
        
        {/* Ankle collar */}
        <mesh position={[0, 0.02 + ankleHeight, -0.03]}>
          <torusGeometry args={[0.028, 0.012, 8, 16]} />
          {material}
        </mesh>
        
        {/* Tongue */}
        <mesh position={[0, 0.03 + ankleHeight / 2, 0.02]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[0.035, 0.04, 0.008]} />
          {material}
        </mesh>
        
        {/* Laces representation */}
        <group position={[0, 0.032, 0.015]}>
          {[0, 0.015, 0.03].map((yOffset, i) => (
            <mesh key={i} position={[0, yOffset, 0]} rotation={[0.1, 0, 0]}>
              <boxGeometry args={[0.04, 0.004, 0.006]} />
              <meshStandardMaterial color="#e5e5e5" roughness={0.8} />
            </mesh>
          ))}
        </group>
        
        {/* High-top ankle extension */}
        {style === 'high' && (
          <mesh position={[0, 0.055, -0.02]}>
            <cylinderGeometry args={[0.032, 0.035, 0.05, 12]} />
            {material}
          </mesh>
        )}
      </group>
    );
  };

  return (
    <group position={[0, 0, 0]}>
      <Sneaker side="left" />
      <Sneaker side="right" />
    </group>
  );
};
