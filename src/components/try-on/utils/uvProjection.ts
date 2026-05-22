import * as THREE from 'three';

/**
 * UV Projection Utilities for Garment Textures
 * 
 * These utilities transform the default cylindrical UV mapping from LatheGeometry
 * into front-projection UVs suitable for displaying product graphics.
 */

interface ProjectionConfig {
  projectionWidth: number;    // Width of the projection zone in world units
  projectionHeight: number;   // Height of the projection zone
  offsetY: number;            // Vertical offset from center
  fadeEdge: number;           // How much to fade at edges (0-1)
}

const defaultProjectionConfigs: Record<string, ProjectionConfig> = {
  hoodie: {
    projectionWidth: 0.40,
    projectionHeight: 0.50,
    offsetY: 0.02,
    fadeEdge: 0.05,
  },
  crewneck: {
    projectionWidth: 0.36,
    projectionHeight: 0.45,
    offsetY: 0.02,
    fadeEdge: 0.05,
  },
  tshirt: {
    projectionWidth: 0.34,
    projectionHeight: 0.42,
    offsetY: 0.03,
    fadeEdge: 0.05,
  },
  jacket: {
    projectionWidth: 0.38,
    projectionHeight: 0.48,
    offsetY: 0.03,
    fadeEdge: 0.06,
  },
};

/**
 * Apply front-facing planar projection to a LatheGeometry
 * This makes texture graphics appear on the front of the garment only
 */
export const applyFrontProjectionUVs = (
  geometry: THREE.BufferGeometry,
  garmentType: string = 'hoodie',
  customConfig?: Partial<ProjectionConfig>
): void => {
  const config = {
    ...defaultProjectionConfigs[garmentType] || defaultProjectionConfigs.hoodie,
    ...customConfig,
  };

  const positionAttribute = geometry.attributes.position;
  const uvAttribute = geometry.attributes.uv;

  if (!positionAttribute || !uvAttribute) {
    console.warn('Geometry missing position or uv attributes');
    return;
  }

  const positions = positionAttribute.array as Float32Array;
  const uvs = new Float32Array(uvAttribute.count * 2);

  for (let i = 0; i < uvAttribute.count; i++) {
    const x = positions[i * 3];
    const y = positions[i * 3 + 1];
    const z = positions[i * 3 + 2];

    // Only texture the front half of the garment (z > 0)
    if (z < -0.01) {
      // Back side - set UVs outside visible range (will show base color)
      uvs[i * 2] = -1;
      uvs[i * 2 + 1] = -1;
    } else {
      // Front side - planar projection based on x,y position
      // Map x to u: center of garment is u=0.5
      const u = (x / config.projectionWidth) * 0.5 + 0.5;
      
      // Map y to v: adjust for vertical offset
      // y is typically negative (below origin), we need to flip and offset
      const normalizedY = (y + config.offsetY) / config.projectionHeight;
      const v = normalizedY * 0.5 + 0.5;

      // Clamp to valid UV range for clean edges
      uvs[i * 2] = Math.max(0, Math.min(1, u));
      uvs[i * 2 + 1] = Math.max(0, Math.min(1, v));
    }
  }

  // Update the UV attribute
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.attributes.uv.needsUpdate = true;
};

/**
 * Create a dedicated texture mesh that sits slightly in front of the body
 * This provides cleaner texture display without UV distortion
 */
export const createFrontTexturePlane = (
  width: number,
  height: number,
  yOffset: number = 0
): THREE.PlaneGeometry => {
  const geometry = new THREE.PlaneGeometry(width, height, 1, 1);
  
  // Position slightly in front of body surface
  const positions = geometry.attributes.position.array as Float32Array;
  for (let i = 0; i < positions.length; i += 3) {
    positions[i + 2] = 0.12; // Push forward in Z
    positions[i + 1] += yOffset; // Apply Y offset
  }
  geometry.attributes.position.needsUpdate = true;
  
  return geometry;
};

/**
 * Calculate UV coordinates for a curved surface that wraps around the torso
 * This creates a more natural draping effect for the texture
 */
export const createCurvedProjectionUVs = (
  geometry: THREE.BufferGeometry,
  curvature: number = 0.15
): void => {
  const positionAttribute = geometry.attributes.position;
  const uvAttribute = geometry.attributes.uv;

  if (!positionAttribute || !uvAttribute) return;

  const positions = positionAttribute.array as Float32Array;
  const uvs = new Float32Array(uvAttribute.count * 2);

  // Find bounds for normalization
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  for (let i = 0; i < positionAttribute.count; i++) {
    const x = positions[i * 3];
    const y = positions[i * 3 + 1];
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }

  const width = maxX - minX;
  const height = maxY - minY;

  for (let i = 0; i < uvAttribute.count; i++) {
    const x = positions[i * 3];
    const y = positions[i * 3 + 1];
    const z = positions[i * 3 + 2];

    // Check if front-facing
    if (z < 0) {
      uvs[i * 2] = -1;
      uvs[i * 2 + 1] = -1;
    } else {
      // Account for curvature - vertices further from center Z are at edges
      const curveFactor = 1 - (Math.abs(x) * curvature);
      
      const u = ((x - minX) / width) * curveFactor + (1 - curveFactor) * 0.5;
      const v = (y - minY) / height;

      uvs[i * 2] = Math.max(0, Math.min(1, u));
      uvs[i * 2 + 1] = Math.max(0, Math.min(1, v));
    }
  }

  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
};

export default {
  applyFrontProjectionUVs,
  createFrontTexturePlane,
  createCurvedProjectionUVs,
};
