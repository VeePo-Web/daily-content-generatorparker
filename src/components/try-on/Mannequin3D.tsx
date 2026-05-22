import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTryOnState } from '@/hooks/useTryOnState';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  getBodyProportions, 
  MannequinProportions,
  EIGHT_HEAD_SCALE,
  getScaledBodyPositions,
} from './utils/measurementToProportions';
import { calculateGroundingOffset, getHeightScale } from './utils/groundingSystem';

/**
 * WORLD-CLASS MANNEQUIN 3D
 * 
 * Museum-quality fashion mannequin with:
 * - Sculpted anatomical forms (bezier curves, not cylinders)
 * - Seamless joint transitions (no visible spheres)
 * - Fashion contrapposto stance
 * - Realistic breathing animation
 * - Premium matte ceramic material
 * 
 * Uses 8-HEAD FASHION SCALE for industry-standard proportions
 */

interface MannequinProps {
  position?: [number, number, number];
}

// ============================================
// CONFIGURATION
// ============================================

// Fashion pose with subtle weight shift
const FASHION_POSE = {
  pelvisTiltZ: 0.015,          // Subtle hip tilt
  leftLegRelaxAngle: 0.02,     // Slight bend in relaxed leg
  leftArmAngle: 0.08,          // Natural arm hang
  rightArmAngle: -0.05,        // Slight asymmetry
  headTilt: 0.01,              // Subtle head tilt
};

// LOD settings for performance
const LOD = {
  desktop: { radialSegments: 32, heightSegments: 24 },
  mobile: { radialSegments: 16, heightSegments: 12 },
};

// Default ceramic tone for mannequin aesthetic
const DEFAULT_CERAMIC_TONE = '#D4D4D4';

// ============================================
// PREMIUM MATERIAL - Museum Ceramic / Skin SSS
// ============================================

const SkinMaterial = ({ skinTone }: { skinTone: string }) => {
  const isDefaultCeramic = skinTone === DEFAULT_CERAMIC_TONE || skinTone === '#D4A574';
  
  if (isDefaultCeramic) {
    // Premium matte ceramic finish - museum quality
    return (
      <meshPhysicalMaterial
        color="#E8E4E0"
        roughness={0.72}
        metalness={0.0}
        clearcoat={0.03}
        clearcoatRoughness={0.8}
        envMapIntensity={0.15}
      />
    );
  }
  
  // Realistic skin with subsurface scattering
  return (
    <meshPhysicalMaterial
      color={skinTone}
      roughness={0.55}
      metalness={0.0}
      transmission={0.08}
      thickness={0.15}
      ior={1.35}
      clearcoat={0.05}
      clearcoatRoughness={0.6}
    />
  );
};

// ============================================
// GEOMETRY UTILITIES
// ============================================

// Create smooth variable-radius tube geometry
const createVariableRadiusTube = (
  curve: THREE.Curve<THREE.Vector3>,
  tubularSegments: number,
  radiusFunction: (t: number) => number,
  radialSegments: number
): THREE.BufferGeometry => {
  const frames = curve.computeFrenetFrames(tubularSegments, false);
  const vertices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= tubularSegments; i++) {
    const t = i / tubularSegments;
    const P = curve.getPoint(t);
    const N = frames.normals[i];
    const B = frames.binormals[i];
    const radius = radiusFunction(t);

    for (let j = 0; j <= radialSegments; j++) {
      const v = (j / radialSegments) * Math.PI * 2;
      const sin = Math.sin(v);
      const cos = -Math.cos(v);

      const normal = new THREE.Vector3(
        cos * N.x + sin * B.x,
        cos * N.y + sin * B.y,
        cos * N.z + sin * B.z
      ).normalize();

      vertices.push(
        P.x + radius * normal.x,
        P.y + radius * normal.y,
        P.z + radius * normal.z
      );
      normals.push(normal.x, normal.y, normal.z);
      uvs.push(t, j / radialSegments);
    }
  }

  for (let i = 0; i < tubularSegments; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = i * (radialSegments + 1) + j;
      const b = a + radialSegments + 1;
      const c = a + 1;
      const d = b + 1;
      indices.push(a, b, c, b, d, c);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  
  return geometry;
};

// ============================================
// SCULPTED TORSO - Anatomical Form
// ============================================

const createSculptedTorsoGeometry = (
  props: MannequinProportions, 
  positions: ReturnType<typeof getScaledBodyPositions>,
  segments: { radialSegments: number; heightSegments: number },
  gender: 'male' | 'female'
): THREE.BufferGeometry => {
  const points: THREE.Vector2[] = [];
  const numPoints = segments.heightSegments * 2;
  
  const torsoHeight = positions.shoulderLine - positions.crotchLine;
  
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    let radius: number;
    let zOffset = 0;
    
    // Anatomical torso profile using bezier-like interpolation
    if (t < 0.12) {
      // Hips - wider at bottom
      const localT = t / 0.12;
      const eased = THREE.MathUtils.smoothstep(localT, 0, 1);
      radius = THREE.MathUtils.lerp(
        props.hipWidth / 2, 
        props.hipWidth / 2 * (gender === 'female' ? 0.98 : 0.95), 
        eased
      );
    } else if (t < 0.35) {
      // Hips to waist - dramatic narrowing
      const localT = (t - 0.12) / 0.23;
      const eased = THREE.MathUtils.smootherstep(localT, 0, 1);
      const hipPoint = props.hipWidth / 2 * (gender === 'female' ? 0.98 : 0.95);
      radius = THREE.MathUtils.lerp(hipPoint, props.waistWidth / 2, eased);
    } else if (t < 0.55) {
      // Waist - narrowest point
      const localT = (t - 0.35) / 0.20;
      const waistCurve = Math.sin(localT * Math.PI) * 0.01; // Subtle curve
      radius = props.waistWidth / 2 + waistCurve;
    } else if (t < 0.75) {
      // Waist to chest - expanding ribcage
      const localT = (t - 0.55) / 0.20;
      const eased = THREE.MathUtils.smootherstep(localT, 0, 1);
      radius = THREE.MathUtils.lerp(props.waistWidth / 2, props.chestDepth, eased);
      // Add subtle chest/pectoral curve
      zOffset = Math.sin(localT * Math.PI) * 0.008;
    } else if (t < 0.90) {
      // Chest region - widest point
      const localT = (t - 0.75) / 0.15;
      const chestMax = Math.max(props.chestDepth, props.shoulderWidth / 2 * 0.85);
      radius = THREE.MathUtils.lerp(props.chestDepth, chestMax, localT * 0.3);
    } else {
      // Chest to shoulders - tapering toward neck
      const localT = (t - 0.90) / 0.10;
      const eased = THREE.MathUtils.smoothstep(localT, 0, 1);
      const neckRadius = props.shoulderWidth * 0.14;
      const chestMax = Math.max(props.chestDepth, props.shoulderWidth / 2 * 0.85);
      radius = THREE.MathUtils.lerp(chestMax * 0.6, neckRadius, eased);
    }
    
    const y = t * torsoHeight;
    points.push(new THREE.Vector2(radius, y));
  }
  
  const geometry = new THREE.LatheGeometry(points, segments.radialSegments);
  geometry.computeVertexNormals();
  return geometry;
};

// ============================================
// SCULPTED PELVIS - Smooth Hip Transition
// ============================================

const createSculptedPelvisGeometry = (
  props: MannequinProportions,
  segments: { radialSegments: number },
  gender: 'male' | 'female'
): THREE.BufferGeometry => {
  const points: THREE.Vector2[] = [];
  const numPoints = 16;
  const pelvisHeight = 0.10;
  
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    // Smooth organic curve from leg junction to torso
    const eased = THREE.MathUtils.smootherstep(t, 0, 1);
    
    // Bottom is wider for leg attachments, top matches torso hips
    const bottomRadius = props.hipWidth / 2 + 0.02;
    const topRadius = props.hipWidth / 2;
    
    // Add subtle anatomical hip bone suggestion
    const hipBoneBulge = Math.sin(t * Math.PI * 2) * 0.005 * (gender === 'female' ? 1.2 : 0.8);
    
    const radius = THREE.MathUtils.lerp(bottomRadius, topRadius, eased) + hipBoneBulge;
    const y = t * pelvisHeight;
    points.push(new THREE.Vector2(radius, y));
  }
  
  const geometry = new THREE.LatheGeometry(points, segments.radialSegments);
  geometry.computeVertexNormals();
  return geometry;
};

// ============================================
// ANATOMICAL ARM - Bezier Curve with Muscle Taper
// ============================================

const createAnatomicalArmGeometry = (
  armLength: number,
  armThickness: number,
  radialSegments: number
): THREE.BufferGeometry => {
  // Arm path with natural slight S-curve
  const armCurve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(-0.008, -armLength * 0.35, 0.005),
    new THREE.Vector3(0.005, -armLength * 0.65, -0.003),
    new THREE.Vector3(0, -armLength * 0.92, 0) // Leave room for hand
  );

  // Radius function with bicep bulge and forearm taper
  const radiusFunction = (t: number): number => {
    // Shoulder to bicep: slight expansion
    if (t < 0.35) {
      const localT = t / 0.35;
      const bicepBulge = Math.sin(localT * Math.PI * 0.8) * armThickness * 0.15;
      return armThickness + bicepBulge;
    }
    // Bicep to elbow: slight narrowing
    if (t < 0.50) {
      const localT = (t - 0.35) / 0.15;
      return THREE.MathUtils.lerp(armThickness * 1.05, armThickness * 0.9, localT);
    }
    // Elbow region: narrowest point
    if (t < 0.55) {
      return armThickness * 0.88;
    }
    // Forearm: slight swell then taper to wrist
    if (t < 0.80) {
      const localT = (t - 0.55) / 0.25;
      const forearmSwell = Math.sin(localT * Math.PI) * armThickness * 0.08;
      const taper = THREE.MathUtils.lerp(armThickness * 0.88, armThickness * 0.65, localT);
      return taper + forearmSwell * (1 - localT);
    }
    // Wrist taper
    const localT = (t - 0.80) / 0.20;
    return THREE.MathUtils.lerp(armThickness * 0.65, armThickness * 0.45, localT);
  };

  return createVariableRadiusTube(armCurve, 20, radiusFunction, radialSegments);
};

// ============================================
// ANATOMICAL LEG - Bezier Curve with Muscle Definition
// ============================================

const createAnatomicalLegGeometry = (
  legLength: number,
  legThickness: number,
  radialSegments: number
): THREE.BufferGeometry => {
  // Leg path with natural subtle curve
  const legCurve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.003, -legLength * 0.25, 0.008),
    new THREE.Vector3(-0.003, -legLength * 0.70, -0.005),
    new THREE.Vector3(0, -legLength * 0.94, 0) // Leave room for foot
  );

  // Radius function with thigh muscle, knee, and calf definition
  const radiusFunction = (t: number): number => {
    // Hip to upper thigh: muscular swell
    if (t < 0.20) {
      const localT = t / 0.20;
      const thighSwell = Math.sin(localT * Math.PI * 0.6) * legThickness * 0.12;
      return legThickness + thighSwell;
    }
    // Upper thigh: peak muscle then gradual taper
    if (t < 0.45) {
      const localT = (t - 0.20) / 0.25;
      const eased = THREE.MathUtils.smoothstep(localT, 0, 1);
      return THREE.MathUtils.lerp(legThickness * 1.08, legThickness * 0.88, eased);
    }
    // Knee region: narrowest
    if (t < 0.55) {
      const localT = (t - 0.45) / 0.10;
      const kneeDip = Math.sin(localT * Math.PI) * legThickness * 0.05;
      return legThickness * 0.82 - kneeDip;
    }
    // Calf: muscle swell
    if (t < 0.75) {
      const localT = (t - 0.55) / 0.20;
      const calfSwell = Math.sin(localT * Math.PI) * legThickness * 0.10;
      return legThickness * 0.78 + calfSwell;
    }
    // Calf to ankle: dramatic taper
    const localT = (t - 0.75) / 0.25;
    const eased = THREE.MathUtils.smootherstep(localT, 0, 1);
    return THREE.MathUtils.lerp(legThickness * 0.75, legThickness * 0.35, eased);
  };

  return createVariableRadiusTube(legCurve, 24, radiusFunction, radialSegments);
};

// ============================================
// ANATOMICAL FOOT
// ============================================

const createAnatomicalFootGeometry = (
  legThickness: number,
  radialSegments: number
): THREE.BufferGeometry => {
  // Foot profile - heel to toe
  const footCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.025, -0.015),    // Heel back
    new THREE.Vector3(0, 0.015, 0.02),      // Arch
    new THREE.Vector3(0, 0.012, 0.06),      // Ball
    new THREE.Vector3(0, 0.018, 0.10),      // Toe tip
  ]);

  const ankleRadius = legThickness * 0.35;
  
  // Foot cross-section varies along length
  const radiusFunction = (t: number): number => {
    if (t < 0.15) {
      // Heel: rounded
      return ankleRadius * 0.9;
    }
    if (t < 0.4) {
      // Arch: narrower
      const localT = (t - 0.15) / 0.25;
      return THREE.MathUtils.lerp(ankleRadius * 0.9, ankleRadius * 0.75, localT);
    }
    if (t < 0.7) {
      // Ball of foot: wider
      const localT = (t - 0.4) / 0.3;
      const swell = Math.sin(localT * Math.PI) * ankleRadius * 0.15;
      return ankleRadius * 0.8 + swell;
    }
    // Toes: taper
    const localT = (t - 0.7) / 0.3;
    return THREE.MathUtils.lerp(ankleRadius * 0.85, ankleRadius * 0.4, localT);
  };

  return createVariableRadiusTube(footCurve, 16, radiusFunction, radialSegments);
};

// ============================================
// FASHION MANNEQUIN HEAD - Abstracted Egg Form
// ============================================

const createMannequinHeadGeometry = (headRadius: number): THREE.BufferGeometry => {
  const geometry = new THREE.SphereGeometry(headRadius * 0.9, 32, 24);
  
  // Morph to elegant egg shape with subtle facial plane
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    let x = positions.getX(i);
    let y = positions.getY(i);
    let z = positions.getZ(i);
    
    // Elongate vertically (egg shape)
    const heightFactor = 1 + (y / headRadius) * 0.06;
    y *= heightFactor;
    
    // Narrow sides slightly
    x *= 0.94;
    
    // Flatten back slightly, subtle face plane in front
    const faceFlatten = z > 0 ? 0.96 : 0.92;
    z *= faceFlatten;
    
    // Subtle brow ridge suggestion
    if (y > headRadius * 0.2 && y < headRadius * 0.4 && z > 0) {
      z += 0.003;
    }
    
    // Subtle chin definition
    if (y < -headRadius * 0.4 && z > 0) {
      z += (Math.abs(y + headRadius * 0.4) / (headRadius * 0.5)) * 0.008;
      y -= 0.005;
    }
    
    positions.setXYZ(i, x, y, z);
  }
  
  geometry.computeVertexNormals();
  return geometry;
};

// ============================================
// SEAMLESS NECK - Smooth Transition
// ============================================

const createNeckGeometry = (
  proportions: MannequinProportions,
  positions: ReturnType<typeof getScaledBodyPositions>,
  radialSegments: number
): THREE.BufferGeometry => {
  const neckLength = positions.headBottom - positions.neckBase;
  const neckRadius = proportions.shoulderWidth * 0.11;
  
  const points: THREE.Vector2[] = [];
  const numPoints = 12;
  
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const eased = THREE.MathUtils.smoothstep(t, 0, 1);
    
    // Taper from shoulders to head
    const bottomRadius = neckRadius * 1.1;
    const topRadius = neckRadius * 0.85;
    const radius = THREE.MathUtils.lerp(bottomRadius, topRadius, eased);
    
    const y = t * neckLength;
    points.push(new THREE.Vector2(radius, y));
  }
  
  const geometry = new THREE.LatheGeometry(points, radialSegments);
  geometry.computeVertexNormals();
  return geometry;
};

// ============================================
// COMPONENT: HEAD
// ============================================

const Head = ({ 
  skinTone, 
  positions,
  segments 
}: { 
  skinTone: string; 
  positions: ReturnType<typeof getScaledBodyPositions>;
  segments: { radialSegments: number };
}) => {
  const headHeight = positions.headTop - positions.headBottom;
  const headRadius = headHeight / 2;
  const headCenterY = positions.headBottom + headRadius;
  
  const geometry = useMemo(
    () => createMannequinHeadGeometry(headRadius),
    [headRadius]
  );
  
  return (
    <group 
      position={[0, headCenterY, 0]} 
      rotation={[0, 0, FASHION_POSE.headTilt]}
    >
      <mesh geometry={geometry}>
        <SkinMaterial skinTone={skinTone} />
      </mesh>
    </group>
  );
};

// ============================================
// COMPONENT: NECK
// ============================================

const Neck = ({ 
  skinTone, 
  proportions, 
  positions,
  segments
}: { 
  skinTone: string; 
  proportions: MannequinProportions;
  positions: ReturnType<typeof getScaledBodyPositions>;
  segments: { radialSegments: number };
}) => {
  const geometry = useMemo(
    () => createNeckGeometry(proportions, positions, segments.radialSegments),
    [proportions, positions, segments.radialSegments]
  );
  
  return (
    <mesh position={[0, positions.neckBase, 0]} geometry={geometry}>
      <SkinMaterial skinTone={skinTone} />
    </mesh>
  );
};

// ============================================
// COMPONENT: TORSO
// ============================================

const Torso = ({ 
  skinTone, 
  proportions, 
  positions,
  segments,
  gender,
  torsoRef
}: { 
  skinTone: string; 
  proportions: MannequinProportions;
  positions: ReturnType<typeof getScaledBodyPositions>;
  segments: { radialSegments: number; heightSegments: number };
  gender: 'male' | 'female';
  torsoRef: React.RefObject<THREE.Mesh>;
}) => {
  const geometry = useMemo(
    () => createSculptedTorsoGeometry(proportions, positions, segments, gender), 
    [proportions, positions, segments, gender]
  );
  
  return (
    <mesh 
      ref={torsoRef}
      position={[0, positions.crotchLine, 0]} 
      geometry={geometry}
    >
      <SkinMaterial skinTone={skinTone} />
    </mesh>
  );
};

// ============================================
// COMPONENT: PELVIS
// ============================================

const Pelvis = ({ 
  skinTone, 
  proportions, 
  positions,
  segments,
  gender
}: { 
  skinTone: string; 
  proportions: MannequinProportions;
  positions: ReturnType<typeof getScaledBodyPositions>;
  segments: { radialSegments: number };
  gender: 'male' | 'female';
}) => {
  const pelvisHeight = 0.10;
  const geometry = useMemo(
    () => createSculptedPelvisGeometry(proportions, segments, gender), 
    [proportions, segments, gender]
  );
  
  return (
    <group rotation={[0, 0, FASHION_POSE.pelvisTiltZ]}>
      <mesh position={[0, positions.crotchLine - pelvisHeight, 0]} geometry={geometry}>
        <SkinMaterial skinTone={skinTone} />
      </mesh>
    </group>
  );
};

// ============================================
// COMPONENT: ARM (Anatomical)
// ============================================

const Arm = ({ 
  side, 
  skinTone, 
  proportions,
  positions,
  segments
}: { 
  side: 'left' | 'right'; 
  skinTone: string; 
  proportions: MannequinProportions;
  positions: ReturnType<typeof getScaledBodyPositions>;
  segments: { radialSegments: number };
}) => {
  const sign = side === 'left' ? -1 : 1;
  const xPos = sign * (proportions.shoulderWidth / 2 + proportions.armThickness * 0.2);
  
  // Asymmetric arm angles for natural stance
  const armAngle = sign * (side === 'left' ? FASHION_POSE.leftArmAngle : FASHION_POSE.rightArmAngle);
  
  // Calculate hand position
  const handLength = proportions.armLength * 0.08;
  const handY = -proportions.armLength * 0.92 - handLength / 2;
  
  const armGeometry = useMemo(
    () => createAnatomicalArmGeometry(proportions.armLength, proportions.armThickness, segments.radialSegments),
    [proportions.armLength, proportions.armThickness, segments.radialSegments]
  );
  
  return (
    <group position={[xPos, positions.shoulderLine, 0]} rotation={[0, 0, armAngle]}>
      {/* Anatomical arm - single smooth mesh */}
      <mesh geometry={armGeometry}>
        <SkinMaterial skinTone={skinTone} />
      </mesh>
      
      {/* Hand - simplified capsule */}
      <mesh position={[0, handY, 0]}>
        <capsuleGeometry args={[proportions.armThickness * 0.4, handLength * 0.8, 6, 12]} />
        <SkinMaterial skinTone={skinTone} />
      </mesh>
    </group>
  );
};

// ============================================
// COMPONENT: LEG (Anatomical)
// ============================================

const Leg = ({ 
  side, 
  skinTone, 
  proportions,
  positions,
  segments
}: { 
  side: 'left' | 'right'; 
  skinTone: string; 
  proportions: MannequinProportions;
  positions: ReturnType<typeof getScaledBodyPositions>;
  segments: { radialSegments: number };
}) => {
  const sign = side === 'left' ? -1 : 1;
  const xPos = sign * 0.085;
  
  // Slight weight shift - right leg straighter, left slightly bent
  const legAngle = side === 'left' ? FASHION_POSE.leftLegRelaxAngle : 0;
  
  const legGeometry = useMemo(
    () => createAnatomicalLegGeometry(proportions.legLength, proportions.legThickness, segments.radialSegments),
    [proportions.legLength, proportions.legThickness, segments.radialSegments]
  );
  
  const footGeometry = useMemo(
    () => createAnatomicalFootGeometry(proportions.legThickness, segments.radialSegments),
    [proportions.legThickness, segments.radialSegments]
  );
  
  // Foot position at bottom of leg
  const footY = -proportions.legLength * 0.94;
  
  return (
    <group 
      position={[xPos, positions.crotchLine, 0]} 
      rotation={[legAngle, 0, 0]}
    >
      {/* Anatomical leg - single smooth mesh */}
      <mesh geometry={legGeometry}>
        <SkinMaterial skinTone={skinTone} />
      </mesh>
      
      {/* Anatomical foot */}
      <mesh 
        position={[0, footY, 0.04]} 
        rotation={[0.1, sign * 0.05, 0]}
        geometry={footGeometry}
      >
        <SkinMaterial skinTone={skinTone} />
      </mesh>
    </group>
  );
};

// ============================================
// MAIN MANNEQUIN COMPONENT
// ============================================

export const Mannequin3D = ({ position = [0, 0, 0] }: MannequinProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Mesh>(null);
  
  const { 
    avatarGender, 
    avatarBodyType, 
    avatarSkinTone, 
    measurements, 
    useDetailedMeasurements 
  } = useTryOnState();
  
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  
  // LOD based on device
  const segments = useMemo(() => isMobile ? LOD.mobile : LOD.desktop, [isMobile]);
  
  // Get proportions from unified source
  const proportions = useMemo(
    () => getBodyProportions(avatarBodyType, avatarGender, measurements, useDetailedMeasurements),
    [avatarBodyType, avatarGender, measurements, useDetailedMeasurements]
  );
  
  // Get scaled body positions
  const positions = useMemo(
    () => getScaledBodyPositions(proportions.height),
    [proportions.height]
  );

  // Height scale for overall sizing
  const heightScale = useMemo(() => {
    return getHeightScale(proportions);
  }, [proportions]);

  // FIXED: Proper grounding offset using new grounding system
  // This ensures feet always touch the floor at Y=0
  const groundingOffset = useMemo(() => {
    return calculateGroundingOffset(proportions);
  }, [proportions]);

  // Enhanced breathing animation - chest expansion, not height (FIXED!)
  useFrame((state) => {
    if (reducedMotion) return;
    
    const t = state.clock.getElapsedTime();
    // Natural multi-frequency breathing
    const breathCycle = Math.sin(t * 0.8) * 0.7 + Math.sin(t * 1.6) * 0.3;
    
    // Chest expands OUTWARD (Z and X), NOT upward
    if (torsoRef.current) {
      torsoRef.current.scale.z = 1 + breathCycle * 0.008; // Primary Z expansion (forward)
      torsoRef.current.scale.x = 1 + breathCycle * 0.005; // Slight X expansion
      // NO Y scaling - this was the bug!
    }
  });

  return (
    <group 
      ref={groupRef} 
      position={[position[0], position[1] + groundingOffset, position[2]]} 
      scale={[heightScale, heightScale, heightScale]}
    >
      {/* Head */}
      <Head 
        skinTone={avatarSkinTone} 
        positions={positions}
        segments={segments}
      />
      
      {/* Neck */}
      <Neck 
        skinTone={avatarSkinTone} 
        proportions={proportions} 
        positions={positions}
        segments={segments}
      />
      
      {/* Torso - with ref for breathing animation */}
      <Torso 
        skinTone={avatarSkinTone} 
        proportions={proportions} 
        positions={positions}
        segments={segments}
        gender={avatarGender}
        torsoRef={torsoRef}
      />
      
      {/* Pelvis with fashion pose tilt */}
      <Pelvis 
        skinTone={avatarSkinTone} 
        proportions={proportions} 
        positions={positions}
        segments={segments}
        gender={avatarGender}
      />
      
      {/* Arms with natural asymmetric hang */}
      <Arm 
        side="left" 
        skinTone={avatarSkinTone} 
        proportions={proportions} 
        positions={positions}
        segments={segments}
      />
      <Arm 
        side="right" 
        skinTone={avatarSkinTone} 
        proportions={proportions} 
        positions={positions}
        segments={segments}
      />
      
      {/* Legs with subtle contrapposto */}
      <Leg 
        side="left" 
        skinTone={avatarSkinTone} 
        proportions={proportions} 
        positions={positions}
        segments={segments}
      />
      <Leg 
        side="right" 
        skinTone={avatarSkinTone} 
        proportions={proportions} 
        positions={positions}
        segments={segments}
      />
    </group>
  );
};
