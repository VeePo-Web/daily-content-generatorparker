/**
 * Horizon Gradient - Seamless Sky Dome
 * 
 * Creates the infinite horizon effect using a gradient sky dome.
 * Provides depth without distraction.
 */

import { useMemo } from 'react';
import * as THREE from 'three';

interface HorizonGradientProps {
  topColor?: string;
  bottomColor?: string;
  horizonColor?: string;
  radius?: number;
}

export const HorizonGradient = ({
  topColor = '#FAFAF8',
  bottomColor = '#F0EDE8',
  horizonColor = '#E8E4E0',
  radius = 50,
}: HorizonGradientProps) => {
  const uniforms = useMemo(() => ({
    colorTop: { value: new THREE.Color(topColor) },
    colorHorizon: { value: new THREE.Color(horizonColor) },
    colorBottom: { value: new THREE.Color(bottomColor) },
    horizonHeight: { value: 0.15 },
    horizonSharpness: { value: 2.0 },
  }), [topColor, horizonColor, bottomColor]);

  const vertexShader = `
    varying vec3 vWorldPosition;
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform vec3 colorTop;
    uniform vec3 colorHorizon;
    uniform vec3 colorBottom;
    uniform float horizonHeight;
    uniform float horizonSharpness;
    varying vec3 vWorldPosition;
    
    void main() {
      float h = normalize(vWorldPosition).y;
      
      // Smooth transition from bottom to horizon to top
      float belowHorizon = smoothstep(-0.3, horizonHeight, h);
      float aboveHorizon = smoothstep(horizonHeight, 0.6, h);
      
      vec3 color;
      if (h < horizonHeight) {
        color = mix(colorBottom, colorHorizon, belowHorizon);
      } else {
        color = mix(colorHorizon, colorTop, aboveHorizon);
      }
      
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[radius, 32, 32]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
};
