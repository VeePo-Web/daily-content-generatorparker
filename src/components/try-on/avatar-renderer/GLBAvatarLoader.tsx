import { useEffect, useMemo, useRef, Suspense } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface GLBAvatarLoaderProps {
  url: string;
  position?: [number, number, number];
}

/**
 * GLBAvatarLoader - Loads and renders GLB/GLTF avatar models
 * 
 * Handles:
 * - Auto-grounding (feet touch Y=0)
 * - Skin material enhancement with SSS
 * - Proper scaling for fashion proportions
 */
export const GLBAvatarLoader = ({ url, position = [0, 0, 0] }: GLBAvatarLoaderProps) => {
  const { scene } = useGLTF(url);
  const avatarRef = useRef<THREE.Group>(null);
  
  // Calculate grounding offset so feet touch Y=0
  const groundingOffset = useMemo(() => {
    if (!scene) return 0;
    const box = new THREE.Box3().setFromObject(scene);
    return -box.min.y;
  }, [scene]);
  
  // Clone the scene to avoid shared state issues
  const clonedScene = useMemo(() => {
    return scene.clone(true);
  }, [scene]);
  
  // Apply skin material enhancements
  useEffect(() => {
    if (!clonedScene) return;
    
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const material = child.material as THREE.MeshStandardMaterial;
        const matName = material.name?.toLowerCase() || '';
        
        // Enhance skin materials with subsurface scattering simulation
        if (matName.includes('skin') || matName.includes('body') || matName.includes('face')) {
          child.material = new THREE.MeshPhysicalMaterial({
            color: material.color || new THREE.Color('#E5BC9A'),
            map: material.map,
            normalMap: material.normalMap,
            roughness: 0.45,
            metalness: 0,
            transmission: 0.12,
            thickness: 0.25,
            ior: 1.38,
            sheen: 0.2,
            sheenRoughness: 0.4,
            sheenColor: new THREE.Color('#FFE4C4'),
            clearcoat: 0.05,
            clearcoatRoughness: 0.7,
            envMapIntensity: 0.25,
          });
        }
        
        // Enhance eye materials
        if (matName.includes('eye') || matName.includes('cornea')) {
          child.material = new THREE.MeshPhysicalMaterial({
            color: material.color || new THREE.Color('#FFFFFF'),
            map: material.map,
            roughness: 0.05,
            metalness: 0,
            clearcoat: 1,
            clearcoatRoughness: 0.05,
            envMapIntensity: 1.5,
          });
        }
        
        // Enhance hair materials
        if (matName.includes('hair')) {
          child.material = new THREE.MeshStandardMaterial({
            color: material.color,
            map: material.map,
            roughness: 0.65,
            metalness: 0.05,
            transparent: true,
            alphaTest: 0.5,
          });
        }
      }
    });
  }, [clonedScene]);
  
  return (
    <group 
      ref={avatarRef} 
      position={[position[0], position[1] + groundingOffset, position[2]]}
    >
      <primitive object={clonedScene} />
    </group>
  );
};

// Preload helper for GLB models
export const preloadGLBAvatar = (url: string) => {
  useGLTF.preload(url);
};
