import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AvatarBodyConfig } from '../avatar-creator/avatarPresets';
import { RealisticSkinMaterial } from './RealisticSkinMaterial';
import { AvatarFingers } from './AvatarFingers';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface AvatarBodyProps {
  config: AvatarBodyConfig;
  gender: 'male' | 'female' | 'non-binary';
  skinTone: string;
  isMobile?: boolean;
}

/**
 * Realistic human body with anatomical proportions
 * Uses the 8-head fashion scale with parametric adjustments
 * 
 * FIXED: Proper scaling and grounding
 * - Uses meters directly for all measurements
 * - Feet properly grounded at Y=0
 * - Joint spheres overlap to eliminate gaps
 */
export const AvatarBody = ({ config, gender, skinTone, isMobile = false }: AvatarBodyProps) => {
  const torsoRef = useRef<THREE.Mesh>(null);
  const prefersReducedMotion = useReducedMotion();
  const segments = isMobile ? 16 : 32;
  
  // Calculate proportions from measurements (8-head scale)
  // FIXED: All calculations now in meters
  const proportions = useMemo(() => {
    const heightM = config.heightCm / 100;
    const headHeight = heightM / 8;
    
    // Body type adjustments
    const bodyTypeMod = {
      ectomorph: { shoulder: 0.92, hip: 0.9, torso: 1.02, muscle: 0.85 },
      mesomorph: { shoulder: 1.05, hip: 0.95, torso: 1.0, muscle: 1.1 },
      endomorph: { shoulder: 0.98, hip: 1.08, torso: 0.98, muscle: 1.0 },
    }[config.bodyType];
    
    // Gender-specific proportions
    const genderMod = gender === 'female' 
      ? { shoulder: 0.88, hip: 1.05, waist: 0.85 }
      : gender === 'non-binary'
      ? { shoulder: 0.94, hip: 1.0, waist: 0.92 }
      : { shoulder: 1.0, hip: 0.95, waist: 1.0 };
    
    // Convert measurements to meters (FIXED: was using 0.01 which made avatar microscopic)
    // Circumference to diameter to radius: C / PI / 2
    const chestRadius = (config.chestCm / 100) / Math.PI / 2;
    const waistRadius = (config.waistCm / 100) / Math.PI / 2;
    const hipRadius = (config.hipsCm / 100) / Math.PI / 2;
    const shoulderW = (config.shoulderWidthCm || config.chestCm * 0.45) / 100;
    const neckCirc = (config.neckCircumferenceCm || 36) / 100;
    const neckRadius = neckCirc / Math.PI / 2;
    
    // Inseam directly gives leg length in cm
    const inseamM = config.inseamCm / 100;
    // Arm length typically ~33-36% of height
    const armLengthM = (config.armLengthCm || config.heightCm * 0.35) / 100;
    // Torso length from crotch to shoulders
    const torsoLengthM = (config.torsoLengthCm || config.heightCm * 0.30) / 100;
    
    // Muscle definition affects limb thickness (0-100 → 0.85-1.15)
    const muscleMultiplier = 0.85 + (config.muscleDefinition / 100) * 0.3;
    
    return {
      height: heightM,
      headHeight,
      shoulderWidth: shoulderW * bodyTypeMod.shoulder * genderMod.shoulder,
      chestRadius: chestRadius * 1.1, // Slightly larger for visual
      waistRadius: waistRadius * genderMod.waist,
      hipRadius: hipRadius * bodyTypeMod.hip * genderMod.hip,
      armLength: armLengthM,
      legLength: inseamM * 1.02, // Slight adjustment for crotch to ground
      neckRadius: neckRadius,
      torsoLength: torsoLengthM * bodyTypeMod.torso,
      muscleMod: muscleMultiplier * bodyTypeMod.muscle,
    };
  }, [config, gender]);

  // Calculate grounding offset to ensure feet touch Y=0
  const groundingOffset = useMemo(() => {
    // Crotch is at 50% of height (8-head scale)
    const crotchY = proportions.height * 0.5;
    // Feet extend to legLength * 0.98 below crotch (leaving room for foot thickness)
    const footBottomY = crotchY - proportions.legLength * 0.98;
    // Offset needed to bring foot bottom to Y=0
    return -footBottomY;
  }, [proportions]);

  // Subtle breathing animation - FIXED: expands chest, not height
  useFrame((state) => {
    if (prefersReducedMotion || !torsoRef.current) return;
    
    const t = state.clock.getElapsedTime();
    // Natural multi-frequency breathing
    const breathCycle = Math.sin(t * 0.8) * 0.7 + Math.sin(t * 1.6) * 0.3;
    
    // Chest expansion (forward and sideways), NOT upward
    torsoRef.current.scale.z = 1 + breathCycle * 0.008;
    torsoRef.current.scale.x = 1 + breathCycle * 0.005;
    // NO Y scaling!
  });

  // Create torso geometry
  const torsoGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    const numPoints = 32;
    
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      let radius: number;
      
      // Anatomical torso profile
      if (t < 0.15) {
        // Hip region
        const eased = THREE.MathUtils.smoothstep(t / 0.15, 0, 1);
        radius = THREE.MathUtils.lerp(proportions.hipRadius, proportions.hipRadius * 0.95, eased);
      } else if (t < 0.4) {
        // Hip to waist
        const eased = THREE.MathUtils.smootherstep((t - 0.15) / 0.25, 0, 1);
        radius = THREE.MathUtils.lerp(proportions.hipRadius * 0.95, proportions.waistRadius, eased);
      } else if (t < 0.55) {
        // Waist (narrowest)
        radius = proportions.waistRadius;
      } else if (t < 0.8) {
        // Waist to chest
        const eased = THREE.MathUtils.smootherstep((t - 0.55) / 0.25, 0, 1);
        radius = THREE.MathUtils.lerp(proportions.waistRadius, proportions.chestRadius, eased);
      } else {
        // Chest to neck transition
        const eased = THREE.MathUtils.smoothstep((t - 0.8) / 0.2, 0, 1);
        radius = THREE.MathUtils.lerp(proportions.chestRadius, proportions.neckRadius * 1.8, eased);
      }
      
      points.push(new THREE.Vector2(radius, t * proportions.torsoLength));
    }
    
    const geo = new THREE.LatheGeometry(points, segments);
    geo.computeVertexNormals();
    return geo;
  }, [proportions, segments]);

  // Limb thickness based on body proportions
  const armThickness = proportions.shoulderWidth * 0.12 * proportions.muscleMod;
  const legThickness = proportions.hipRadius * 0.7 * proportions.muscleMod;
  
  // Position calculations (8-head scale) - relative to group origin
  const crotchY = proportions.height * 0.5;
  const shoulderY = proportions.height * 0.82;

  // Foot geometry dimensions
  const footLength = legThickness * 2.5;
  const footHeight = legThickness * 0.35;
  const footWidth = legThickness * 0.8;

  return (
    <group position={[0, groundingOffset, 0]}>
      {/* Torso */}
      <mesh 
        ref={torsoRef}
        geometry={torsoGeometry} 
        position={[0, crotchY, 0]}
      >
        <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
      </mesh>
      
      {/* Pelvis (overlapping joint sphere) */}
      <mesh position={[0, crotchY - 0.02, 0]}>
        <sphereGeometry args={[proportions.hipRadius * 0.85, segments / 2, segments / 4, 0, Math.PI * 2, Math.PI * 0.3, Math.PI * 0.5]} />
        <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
      </mesh>
      
      {/* Neck */}
      <mesh position={[0, shoulderY + proportions.torsoLength * 0.05, 0]}>
        <cylinderGeometry args={[proportions.neckRadius * 0.85, proportions.neckRadius * 1.1, proportions.headHeight * 0.5, segments / 2]} />
        <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
      </mesh>
      
      {/* Left Arm */}
      <group position={[-proportions.shoulderWidth / 2 - armThickness * 0.3, shoulderY, 0]} rotation={[0, 0, 0.08]}>
        {/* Shoulder (overlapping joint) */}
        <mesh>
          <sphereGeometry args={[armThickness * 1.3, segments / 2, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
        {/* Upper arm */}
        <mesh position={[0, -proportions.armLength * 0.22, 0]}>
          <cylinderGeometry args={[armThickness * 1.05, armThickness * 0.9, proportions.armLength * 0.42, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
        {/* Elbow (overlapping joint) */}
        <mesh position={[0, -proportions.armLength * 0.45, 0]}>
          <sphereGeometry args={[armThickness * 0.9, segments / 2, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
        {/* Forearm */}
        <mesh position={[0, -proportions.armLength * 0.68, 0]}>
          <cylinderGeometry args={[armThickness * 0.85, armThickness * 0.6, proportions.armLength * 0.40, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
        {/* Wrist (overlapping joint) */}
        <mesh position={[0, -proportions.armLength * 0.88, 0]}>
          <sphereGeometry args={[armThickness * 0.55, segments / 2, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
        {/* Hand with fingers */}
        <group position={[0, -proportions.armLength * 0.92, 0]} rotation={[0.1, 0.05, 0]}>
          <AvatarFingers
            handLength={armThickness * 2.2}
            handWidth={armThickness * 1.4}
            skinTone={skinTone}
            side="left"
            isMobile={isMobile}
          />
        </group>
      </group>
      
      {/* Right Arm (mirrored) */}
      <group position={[proportions.shoulderWidth / 2 + armThickness * 0.3, shoulderY, 0]} rotation={[0, 0, -0.05]}>
        <mesh>
          <sphereGeometry args={[armThickness * 1.3, segments / 2, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
        <mesh position={[0, -proportions.armLength * 0.22, 0]}>
          <cylinderGeometry args={[armThickness * 1.05, armThickness * 0.9, proportions.armLength * 0.42, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
        <mesh position={[0, -proportions.armLength * 0.45, 0]}>
          <sphereGeometry args={[armThickness * 0.9, segments / 2, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
        <mesh position={[0, -proportions.armLength * 0.68, 0]}>
          <cylinderGeometry args={[armThickness * 0.85, armThickness * 0.6, proportions.armLength * 0.40, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
        <mesh position={[0, -proportions.armLength * 0.88, 0]}>
          <sphereGeometry args={[armThickness * 0.55, segments / 2, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
        {/* Hand with fingers */}
        <group position={[0, -proportions.armLength * 0.92, 0]} rotation={[0.1, -0.05, 0]}>
          <AvatarFingers
            handLength={armThickness * 2.2}
            handWidth={armThickness * 1.4}
            skinTone={skinTone}
            side="right"
            isMobile={isMobile}
          />
        </group>
      </group>
      
      {/* Left Leg */}
      <group position={[-proportions.hipRadius * 0.55, crotchY, 0]} rotation={[0.015, 0, 0.015]}>
        {/* Hip joint (overlapping) */}
        <mesh>
          <sphereGeometry args={[legThickness * 1.0, segments / 2, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
        {/* Thigh */}
        <mesh position={[0, -proportions.legLength * 0.22, 0]}>
          <cylinderGeometry args={[legThickness * 1.05, legThickness * 0.85, proportions.legLength * 0.42, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
        {/* Knee (overlapping joint) */}
        <mesh position={[0, -proportions.legLength * 0.45, 0]}>
          <sphereGeometry args={[legThickness * 0.75, segments / 2, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
        {/* Calf */}
        <mesh position={[0, -proportions.legLength * 0.68, 0]}>
          <cylinderGeometry args={[legThickness * 0.72, legThickness * 0.4, proportions.legLength * 0.42, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
        {/* Ankle (overlapping joint) */}
        <mesh position={[0, -proportions.legLength * 0.90, 0]}>
          <sphereGeometry args={[legThickness * 0.38, segments / 2, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
        {/* Foot (anatomical shape) */}
        <group position={[0, -proportions.legLength * 0.95, footLength * 0.25]} rotation={[0.15, 0.05, 0]}>
          <mesh>
            <capsuleGeometry args={[footHeight, footLength, 4, 8]} />
            <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
          </mesh>
        </group>
      </group>
      
      {/* Right Leg (mirrored) */}
      <group position={[proportions.hipRadius * 0.55, crotchY, 0]} rotation={[0, 0, -0.02]}>
        <mesh>
          <sphereGeometry args={[legThickness * 1.0, segments / 2, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
        <mesh position={[0, -proportions.legLength * 0.22, 0]}>
          <cylinderGeometry args={[legThickness * 1.05, legThickness * 0.85, proportions.legLength * 0.42, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
        <mesh position={[0, -proportions.legLength * 0.45, 0]}>
          <sphereGeometry args={[legThickness * 0.75, segments / 2, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
        <mesh position={[0, -proportions.legLength * 0.68, 0]}>
          <cylinderGeometry args={[legThickness * 0.72, legThickness * 0.4, proportions.legLength * 0.42, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
        <mesh position={[0, -proportions.legLength * 0.90, 0]}>
          <sphereGeometry args={[legThickness * 0.38, segments / 2, segments / 2]} />
          <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
        </mesh>
        <group position={[0, -proportions.legLength * 0.95, footLength * 0.25]} rotation={[0.15, -0.05, 0]}>
          <mesh>
            <capsuleGeometry args={[footHeight, footLength, 4, 8]} />
            <RealisticSkinMaterial skinTone={skinTone} isMobile={isMobile} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
