import { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';

interface TextureConfig {
  repeat: [number, number];
  offset: [number, number];
  rotation: number;
  wrapS: THREE.Wrapping;
  wrapT: THREE.Wrapping;
}

// Global texture cache with reference counting
interface CachedTexture {
  texture: THREE.Texture;
  refCount: number;
}

const textureCache = new Map<string, CachedTexture>();

const getCacheKey = (url: string, garmentType: string) => `${url}::${garmentType}`;

// Garment-specific UV configurations for optimal texture display
const garmentTextureConfigs: Record<string, TextureConfig> = {
  hoodie: {
    repeat: [1, 1],
    offset: [0, 0],
    rotation: 0,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
  },
  crewneck: {
    repeat: [1, 1],
    offset: [0, 0],
    rotation: 0,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
  },
  tshirt: {
    repeat: [1, 1],
    offset: [0, 0],
    rotation: 0,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
  },
  tank: {
    repeat: [1, 1],
    offset: [0, 0],
    rotation: 0,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
  },
  jacket: {
    repeat: [1, 1],
    offset: [0, 0],
    rotation: 0,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
  },
  pants: {
    repeat: [2, 1],
    offset: [0, 0],
    rotation: 0,
    wrapS: THREE.RepeatWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
  },
  shorts: {
    repeat: [1.5, 1],
    offset: [0, 0],
    rotation: 0,
    wrapS: THREE.RepeatWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
  },
};

const defaultConfig: TextureConfig = {
  repeat: [1, 1],
  offset: [0, 0],
  rotation: 0,
  wrapS: THREE.ClampToEdgeWrapping,
  wrapT: THREE.ClampToEdgeWrapping,
};

/**
 * Custom hook for loading and configuring garment textures
 * Uses THREE.TextureLoader with global caching and reference counting
 */
export const useGarmentTexture = (
  imageUrl: string | undefined,
  garmentType: string = 'hoodie'
): THREE.Texture | null => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const cacheKeyRef = useRef<string | null>(null);
  const config = garmentTextureConfigs[garmentType] || defaultConfig;

  useEffect(() => {
    if (!imageUrl) {
      setTexture(null);
      return;
    }
    
    // Resolve URL - handle both absolute and relative paths
    const resolvedUrl = imageUrl.startsWith('http') 
      ? imageUrl 
      : imageUrl.startsWith('/') 
        ? imageUrl 
        : `/${imageUrl}`;
    
    const cacheKey = getCacheKey(resolvedUrl, garmentType);
    cacheKeyRef.current = cacheKey;
    
    // Check cache first
    const cached = textureCache.get(cacheKey);
    if (cached) {
      cached.refCount++;
      setTexture(cached.texture);
      return;
    }
    
    // Load new texture
    const loader = new THREE.TextureLoader();

    loader.load(
      resolvedUrl,
      (loadedTexture) => {
        // Configure texture properties
        loadedTexture.wrapS = config.wrapS;
        loadedTexture.wrapT = config.wrapT;
        loadedTexture.repeat.set(config.repeat[0], config.repeat[1]);
        loadedTexture.offset.set(config.offset[0], config.offset[1]);
        loadedTexture.rotation = config.rotation;
        loadedTexture.center.set(0.5, 0.5);
        
        // High quality filtering
        loadedTexture.minFilter = THREE.LinearMipmapLinearFilter;
        loadedTexture.magFilter = THREE.LinearFilter;
        loadedTexture.anisotropy = 16;
        
        // Ensure correct color space
        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        
        loadedTexture.needsUpdate = true;
        
        // Add to cache
        textureCache.set(cacheKey, { texture: loadedTexture, refCount: 1 });
        
        setTexture(loadedTexture);
      },
      undefined,
      (err) => {
        console.error('[Texture] Failed to load:', resolvedUrl, err);
        setTexture(null);
      }
    );

    return () => {
      // Decrement reference count on cleanup
      const key = cacheKeyRef.current;
      if (key) {
        const cached = textureCache.get(key);
        if (cached) {
          cached.refCount--;
          if (cached.refCount <= 0) {
            cached.texture.dispose();
            textureCache.delete(key);
          }
        }
      }
    };
  }, [imageUrl, garmentType, config]);

  return texture;
};

/**
 * Get the best texture image URL for a product
 * Prioritizes flat-front images for texture mapping
 */
export const getTextureImageUrl = (
  productImages: Array<{ image_url: string; is_primary?: boolean }> | undefined,
  productName: string
): string | undefined => {
  if (!productImages || productImages.length === 0) return undefined;

  // Priority 1: Look for flat-front or flat-lay images (best for texturing)
  const flatImage = productImages.find(img => 
    img.image_url.toLowerCase().includes('flat') ||
    img.image_url.toLowerCase().includes('front')
  );
  if (flatImage) return flatImage.image_url;

  // Priority 2: Use primary image
  const primaryImage = productImages.find(img => img.is_primary);
  if (primaryImage) return primaryImage.image_url;

  // Priority 3: First image
  return productImages[0]?.image_url;
};

export default useGarmentTexture;
