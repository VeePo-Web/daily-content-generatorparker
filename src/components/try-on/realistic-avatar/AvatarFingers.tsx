import { useMemo } from 'react';
import * as THREE from 'three';

interface AvatarFingersProps {
  handLength: number;
  handWidth: number;
  skinTone: string;
  side: 'left' | 'right';
  isMobile?: boolean;
}

/**
 * Anatomical hand with individual fingers and proper proportions
 * Replaces the capsule "mitten" with articulated digits
 */
export const AvatarFingers = ({
  handLength,
  handWidth,
  skinTone,
  side,
  isMobile = false,
}: AvatarFingersProps) => {
  const segments = isMobile ? 6 : 12;
  const mirror = side === 'right' ? -1 : 1;
  
  // Finger proportions relative to hand
  // Index(100%), Middle(105%), Ring(95%), Pinky(80%)
  const fingerLengths = [0.65, 0.72, 0.68, 0.55]; // of handLength
  const fingerWidths = [0.16, 0.17, 0.16, 0.14]; // of handWidth
  const fingerPositions = [-0.3, -0.1, 0.1, 0.3]; // X spread
  
  // Thumb is special
  const thumbLength = handLength * 0.45;
  const thumbWidth = handWidth * 0.2;

  // Palm geometry - flattened capsule
  const palmGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const w = handWidth * 0.5;
    const h = handLength * 0.55;
    
    // Rounded rectangle for palm
    shape.moveTo(-w, -h * 0.3);
    shape.lineTo(-w * 0.9, h * 0.4);
    shape.quadraticCurveTo(-w * 0.5, h * 0.5, 0, h * 0.45);
    shape.quadraticCurveTo(w * 0.5, h * 0.5, w * 0.9, h * 0.4);
    shape.lineTo(w, -h * 0.3);
    shape.quadraticCurveTo(w * 0.3, -h * 0.5, 0, -h * 0.45);
    shape.quadraticCurveTo(-w * 0.3, -h * 0.5, -w, -h * 0.3);
    
    return new THREE.ExtrudeGeometry(shape, {
      depth: handWidth * 0.25,
      bevelEnabled: true,
      bevelThickness: 0.005,
      bevelSize: 0.005,
      bevelSegments: 2,
    });
  }, [handLength, handWidth]);

  // Create a finger with 3 segments (phalanges)
  const Finger = ({ 
    index, 
    length, 
    width, 
    xOffset 
  }: { 
    index: number;
    length: number; 
    width: number; 
    xOffset: number;
  }) => {
    // Phalanx proportions: proximal 40%, middle 30%, distal 30%
    const phalanxLengths = [length * 0.4, length * 0.32, length * 0.28];
    const phalanxWidths = [width, width * 0.85, width * 0.7];
    
    // Slight natural curl
    const curls = [0.05, 0.08, 0.1];
    
    return (
      <group 
        position={[xOffset * mirror, handLength * 0.3, 0]}
        rotation={[curls[0], xOffset * 0.1 * mirror, 0]}
      >
        {/* Proximal phalanx */}
        <mesh position={[0, phalanxLengths[0] / 2, 0]}>
          <capsuleGeometry args={[phalanxWidths[0], phalanxLengths[0], 4, segments]} />
          <meshPhysicalMaterial
            color={skinTone}
            roughness={0.45}
            metalness={0}
            clearcoat={0.1}
          />
        </mesh>
        
        {/* Knuckle joint 1 */}
        <mesh position={[0, phalanxLengths[0], 0]}>
          <sphereGeometry args={[phalanxWidths[0] * 1.1, segments / 2, segments / 2]} />
          <meshPhysicalMaterial color={skinTone} roughness={0.5} />
        </mesh>
        
        <group 
          position={[0, phalanxLengths[0], 0]} 
          rotation={[curls[1], 0, 0]}
        >
          {/* Middle phalanx */}
          <mesh position={[0, phalanxLengths[1] / 2, 0]}>
            <capsuleGeometry args={[phalanxWidths[1], phalanxLengths[1], 4, segments]} />
            <meshPhysicalMaterial color={skinTone} roughness={0.45} clearcoat={0.1} />
          </mesh>
          
          {/* Knuckle joint 2 */}
          <mesh position={[0, phalanxLengths[1], 0]}>
            <sphereGeometry args={[phalanxWidths[1] * 1.05, segments / 2, segments / 2]} />
            <meshPhysicalMaterial color={skinTone} roughness={0.5} />
          </mesh>
          
          <group 
            position={[0, phalanxLengths[1], 0]} 
            rotation={[curls[2], 0, 0]}
          >
            {/* Distal phalanx */}
            <mesh position={[0, phalanxLengths[2] / 2, 0]}>
              <capsuleGeometry args={[phalanxWidths[2], phalanxLengths[2], 4, segments]} />
              <meshPhysicalMaterial color={skinTone} roughness={0.45} clearcoat={0.15} />
            </mesh>
            
            {/* Fingertip */}
            <mesh position={[0, phalanxLengths[2], 0]}>
              <sphereGeometry args={[phalanxWidths[2] * 1.1, segments / 2, segments / 2]} />
              <meshPhysicalMaterial 
                color={skinTone} 
                roughness={0.35} 
                clearcoat={0.2}
              />
            </mesh>
            
            {/* Fingernail */}
            <mesh 
              position={[0, phalanxLengths[2] * 0.85, phalanxWidths[2] * 0.6]}
              rotation={[0.2, 0, 0]}
            >
              <boxGeometry args={[phalanxWidths[2] * 1.5, phalanxLengths[2] * 0.5, 0.002]} />
              <meshPhysicalMaterial 
                color="#FFEEDD"
                roughness={0.15}
                metalness={0.1}
                clearcoat={0.8}
                clearcoatRoughness={0.1}
                transparent
                opacity={0.85}
              />
            </mesh>
          </group>
        </group>
      </group>
    );
  };

  // Thumb with 2 phalanges at different angle
  const Thumb = () => {
    return (
      <group 
        position={[handWidth * 0.45 * mirror, -handLength * 0.15, handWidth * 0.1]}
        rotation={[0.3, 0.8 * mirror, -0.5 * mirror]}
      >
        {/* Metacarpal (in palm) */}
        <mesh position={[0, thumbLength * 0.2, 0]}>
          <capsuleGeometry args={[thumbWidth * 1.1, thumbLength * 0.35, 4, segments]} />
          <meshPhysicalMaterial color={skinTone} roughness={0.5} />
        </mesh>
        
        {/* Joint 1 */}
        <mesh position={[0, thumbLength * 0.4, 0]}>
          <sphereGeometry args={[thumbWidth * 1.15, segments / 2, segments / 2]} />
          <meshPhysicalMaterial color={skinTone} roughness={0.5} />
        </mesh>
        
        <group position={[0, thumbLength * 0.4, 0]} rotation={[0.15, 0, 0]}>
          {/* Proximal phalanx */}
          <mesh position={[0, thumbLength * 0.25, 0]}>
            <capsuleGeometry args={[thumbWidth, thumbLength * 0.4, 4, segments]} />
            <meshPhysicalMaterial color={skinTone} roughness={0.45} clearcoat={0.1} />
          </mesh>
          
          {/* Joint 2 */}
          <mesh position={[0, thumbLength * 0.45, 0]}>
            <sphereGeometry args={[thumbWidth * 1.05, segments / 2, segments / 2]} />
            <meshPhysicalMaterial color={skinTone} roughness={0.5} />
          </mesh>
          
          <group position={[0, thumbLength * 0.45, 0]} rotation={[0.1, 0, 0]}>
            {/* Distal phalanx */}
            <mesh position={[0, thumbLength * 0.15, 0]}>
              <capsuleGeometry args={[thumbWidth * 0.85, thumbLength * 0.25, 4, segments]} />
              <meshPhysicalMaterial color={skinTone} roughness={0.4} clearcoat={0.15} />
            </mesh>
            
            {/* Thumb tip */}
            <mesh position={[0, thumbLength * 0.3, 0]}>
              <sphereGeometry args={[thumbWidth * 0.95, segments / 2, segments / 2]} />
              <meshPhysicalMaterial color={skinTone} roughness={0.35} clearcoat={0.2} />
            </mesh>
            
            {/* Thumbnail */}
            <mesh 
              position={[0, thumbLength * 0.22, thumbWidth * 0.5]}
              rotation={[0.2, 0, 0]}
            >
              <boxGeometry args={[thumbWidth * 1.4, thumbLength * 0.35, 0.002]} />
              <meshPhysicalMaterial 
                color="#FFEEDD"
                roughness={0.15}
                clearcoat={0.8}
                transparent
                opacity={0.85}
              />
            </mesh>
          </group>
        </group>
      </group>
    );
  };

  return (
    <group rotation={[0, 0, 0]}>
      {/* Palm */}
      <mesh 
        geometry={palmGeometry}
        position={[0, handLength * 0.05, -handWidth * 0.1]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <meshPhysicalMaterial
          color={skinTone}
          roughness={0.5}
          metalness={0}
          clearcoat={0.08}
        />
      </mesh>
      
      {/* Four fingers */}
      {fingerLengths.map((lengthRatio, i) => (
        <Finger
          key={i}
          index={i}
          length={handLength * lengthRatio}
          width={handWidth * fingerWidths[i]}
          xOffset={handWidth * fingerPositions[i]}
        />
      ))}
      
      {/* Thumb */}
      <Thumb />
    </group>
  );
};
