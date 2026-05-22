/**
 * Studio Backdrop - Curved Cyclorama (Infinity Cove)
 * 
 * Creates the seamless curved backdrop that real photo studios use.
 * The "L-shaped" profile curves from floor to wall with no visible seam.
 */

import { useMemo } from 'react';
import * as THREE from 'three';

interface StudioBackdropProps {
  color?: string;
  width?: number;
  height?: number;
  depth?: number;
  curveRadius?: number;
}

export const StudioBackdrop = ({
  color = '#F8F6F3',
  width = 12,
  height = 6,
  depth = 6,
  curveRadius = 1.5,
}: StudioBackdropProps) => {
  const geometry = useMemo(() => {
    // Create the cyclorama profile (L-shape with curved corner)
    const shape = new THREE.Shape();
    const segments = 32;
    
    // Start at front-left floor
    shape.moveTo(-width / 2, 0);
    
    // Floor extends back to curve start
    shape.lineTo(-width / 2, -depth + curveRadius);
    
    // Curved transition from floor to wall
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * (Math.PI / 2);
      const x = -width / 2;
      const y = -depth + curveRadius - Math.cos(angle) * curveRadius;
      const z = Math.sin(angle) * curveRadius;
      
      if (i === 0) continue; // Skip first point (already at line end)
      
      // We're building a 2D shape, so we use the curve in 2D
      // The shape will be extruded along the width
    }
    
    // For simplicity, use a curved path and extrude
    const points: THREE.Vector2[] = [];
    
    // Floor section
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      points.push(new THREE.Vector2(t * (depth - curveRadius), 0));
    }
    
    // Curve section (quarter circle)
    for (let i = 1; i <= segments; i++) {
      const angle = (i / segments) * (Math.PI / 2);
      const x = depth - curveRadius + Math.sin(angle) * curveRadius;
      const y = (1 - Math.cos(angle)) * curveRadius;
      points.push(new THREE.Vector2(x, y));
    }
    
    // Wall section going up
    for (let i = 1; i <= 10; i++) {
      const t = i / 10;
      const y = curveRadius + t * (height - curveRadius);
      points.push(new THREE.Vector2(depth, y));
    }
    
    // Create the geometry by lofting the profile
    const curveShape = new THREE.Shape(points);
    
    const extrudeSettings = {
      depth: width,
      bevelEnabled: false,
      steps: 1,
    };
    
    const geo = new THREE.ExtrudeGeometry(curveShape, extrudeSettings);
    
    // Rotate and position to be behind the avatar
    geo.rotateX(-Math.PI / 2);
    geo.rotateY(Math.PI);
    geo.translate(width / 2, 0, -depth);
    
    return geo;
  }, [width, height, depth, curveRadius]);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial
        color={color}
        roughness={0.85}
        metalness={0}
        side={THREE.BackSide}
      />
    </mesh>
  );
};
