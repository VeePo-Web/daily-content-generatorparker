/**
 * Level of Detail (LOD) Tier Hook
 * 
 * Automatically detects device capabilities and returns
 * appropriate quality settings for 3D rendering.
 */

import { useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export type LODTier = 'ultra' | 'high' | 'medium' | 'low';

export interface LODSettings {
  tier: LODTier;
  radialSegments: number;
  heightSegments: number;
  shadowMapSize: number;
  enableSSAO: boolean;
  enableReflections: boolean;
  textureMaxSize: number;
  antialias: boolean;
}

const LOD_TIERS: Record<LODTier, Omit<LODSettings, 'tier'>> = {
  ultra: {
    radialSegments: 48,
    heightSegments: 32,
    shadowMapSize: 2048,
    enableSSAO: true,
    enableReflections: true,
    textureMaxSize: 2048,
    antialias: true,
  },
  high: {
    radialSegments: 32,
    heightSegments: 24,
    shadowMapSize: 1024,
    enableSSAO: true,
    enableReflections: true,
    textureMaxSize: 1024,
    antialias: true,
  },
  medium: {
    radialSegments: 24,
    heightSegments: 16,
    shadowMapSize: 512,
    enableSSAO: false,
    enableReflections: true,
    textureMaxSize: 512,
    antialias: true,
  },
  low: {
    radialSegments: 16,
    heightSegments: 12,
    shadowMapSize: 256,
    enableSSAO: false,
    enableReflections: false,
    textureMaxSize: 256,
    antialias: false,
  },
};

/**
 * Detect GPU capabilities (simplified)
 */
const detectGPUTier = (): LODTier => {
  // Check for WebGPU support (most capable)
  if ('gpu' in navigator) {
    return 'ultra';
  }
  
  // Check WebGL capabilities
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  
  if (gl) {
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      
      // Detect high-end GPUs
      if (
        renderer.includes('NVIDIA') ||
        renderer.includes('AMD') ||
        renderer.includes('Apple M') ||
        renderer.includes('Apple GPU')
      ) {
        return 'high';
      }
    }
    
    // Check max texture size as capability indicator
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    if (maxTextureSize >= 8192) return 'high';
    if (maxTextureSize >= 4096) return 'medium';
  }
  
  return 'medium';
};

/**
 * Hook to get appropriate LOD settings for the current device
 */
export const useLODTier = (): LODSettings => {
  const isMobile = useIsMobile();
  
  const tier = useMemo((): LODTier => {
    // Mobile always uses low for performance
    if (isMobile) return 'low';
    
    // Detect GPU capability
    return detectGPUTier();
  }, [isMobile]);
  
  const settings = useMemo((): LODSettings => {
    return {
      tier,
      ...LOD_TIERS[tier],
    };
  }, [tier]);
  
  return settings;
};

/**
 * Get LOD settings by tier name
 */
export const getLODSettings = (tier: LODTier): LODSettings => {
  return {
    tier,
    ...LOD_TIERS[tier],
  };
};
