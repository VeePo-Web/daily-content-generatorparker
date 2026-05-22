import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer, RenderPass, ShaderPass, UnrealBloomPass } from 'three/examples/jsm/Addons.js';

interface PostProcessingProps {
  enableBloom?: boolean;
  enableSSAO?: boolean;
  bloomStrength?: number;
  bloomRadius?: number;
  bloomThreshold?: number;
}

/**
 * PostProcessing - Adds film-quality effects to the 3D scene
 * 
 * Effects:
 * - Unreal Bloom: Subtle glow on skin highlights and eye catchlights
 * - Color grading: Warm fashion-editorial tone
 */
export const PostProcessing = ({
  enableBloom = true,
  bloomStrength = 0.15,
  bloomRadius = 0.3,
  bloomThreshold = 0.85,
}: PostProcessingProps) => {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef<EffectComposer | null>(null);
  
  // Initialize effect composer
  useEffect(() => {
    const composer = new EffectComposer(gl);
    
    // Base render pass
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    // Bloom pass - subtle glow for skin highlights
    if (enableBloom) {
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(size.width, size.height),
        bloomStrength,
        bloomRadius,
        bloomThreshold
      );
      composer.addPass(bloomPass);
    }
    
    // Custom color grading shader - warm editorial tone
    const colorGradingShader = {
      uniforms: {
        tDiffuse: { value: null },
        warmth: { value: 0.03 },
        contrast: { value: 1.05 },
        saturation: { value: 1.02 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float warmth;
        uniform float contrast;
        uniform float saturation;
        varying vec2 vUv;
        
        void main() {
          vec4 color = texture2D(tDiffuse, vUv);
          
          // Add warmth (shift towards orange)
          color.r += warmth;
          color.b -= warmth * 0.5;
          
          // Contrast adjustment
          color.rgb = (color.rgb - 0.5) * contrast + 0.5;
          
          // Saturation adjustment
          float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
          color.rgb = mix(vec3(gray), color.rgb, saturation);
          
          // Subtle vignette from shader (additional to CSS)
          vec2 center = vUv - 0.5;
          float vignette = 1.0 - dot(center, center) * 0.3;
          color.rgb *= vignette;
          
          gl_FragColor = color;
        }
      `,
    };
    
    const colorGradingPass = new ShaderPass(colorGradingShader);
    colorGradingPass.renderToScreen = true;
    composer.addPass(colorGradingPass);
    
    composerRef.current = composer;
    
    return () => {
      composer.dispose();
    };
  }, [gl, scene, camera, size, enableBloom, bloomStrength, bloomRadius, bloomThreshold]);
  
  // Update composer on resize
  useEffect(() => {
    if (composerRef.current) {
      composerRef.current.setSize(size.width, size.height);
    }
  }, [size]);
  
  // Render with composer
  useFrame(() => {
    if (composerRef.current) {
      composerRef.current.render();
    }
  }, 1); // Priority 1 to run after other updates
  
  return null;
};

/**
 * Simplified SSAO approximation using contact shadows
 * Full SSAO is expensive; we use enhanced shadow mapping instead
 */
export const EnhancedShadows = () => {
  return (
    <>
      {/* Soft ambient occlusion via additional soft lights */}
      <hemisphereLight 
        args={['#FFEEDD', '#997755', 0.15]} 
        position={[0, 5, 0]}
      />
      
      {/* Ground bounce light for depth */}
      <pointLight
        position={[0, -1, 0]}
        intensity={0.08}
        color="#EEDDCC"
        distance={3}
        decay={2}
      />
    </>
  );
};
