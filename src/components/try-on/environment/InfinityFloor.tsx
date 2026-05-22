/**
 * Infinity Floor - Reflective Studio Floor
 * 
 * Creates a premium reflective floor with real-time mirror effect.
 * Uses @react-three/drei Reflector for accurate reflections.
 */

import { useIsMobile } from '@/hooks/use-mobile';
import * as THREE from 'three';

interface InfinityFloorProps {
  size?: number;
  color?: string;
  reflectivity?: number;
}

export const InfinityFloor = ({
  size = 10,
  color = '#FAFAF8',
  reflectivity = 0.35,
}: InfinityFloorProps) => {
  const isMobile = useIsMobile();
  
  // On mobile, use simpler floor without reflection for performance
  if (isMobile) {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]} receiveShadow>
        <circleGeometry args={[size / 2, 64]} />
        <meshStandardMaterial
          color={color}
          roughness={0.15}
          metalness={0.05}
          envMapIntensity={0.2}
        />
      </mesh>
    );
  }
  
  // Desktop: Full reflective floor with gradient fade
  return (
    <group>
      {/* Main reflective floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]} receiveShadow>
        <circleGeometry args={[size / 2, 128]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.08}
          metalness={0.02}
          clearcoat={0.1}
          clearcoatRoughness={0.4}
          reflectivity={reflectivity}
          envMapIntensity={0.4}
        />
      </mesh>
      
      {/* Subtle gradient overlay for spotlight effect */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]}>
        <circleGeometry args={[size / 2, 64]} />
        <shaderMaterial
          transparent
          uniforms={{
            centerColor: { value: new THREE.Color('#FFFFFF') },
            edgeColor: { value: new THREE.Color('#E8E4E0') },
            opacity: { value: 0.15 },
          }}
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform vec3 centerColor;
            uniform vec3 edgeColor;
            uniform float opacity;
            varying vec2 vUv;
            
            void main() {
              vec2 center = vec2(0.5, 0.5);
              float dist = distance(vUv, center) * 2.0;
              vec3 color = mix(centerColor, edgeColor, smoothstep(0.0, 1.0, dist));
              float alpha = opacity * (1.0 - smoothstep(0.8, 1.0, dist));
              gl_FragColor = vec4(color, alpha);
            }
          `}
        />
      </mesh>
    </group>
  );
};
