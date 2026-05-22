import { useMemo } from 'react';
import * as THREE from 'three';

interface AvatarEyelidsProps {
  headRadius: number;
  eyeSpacing: number;
  eyeY: number;
  eyeZ: number;
  eyeRadius: number;
  skinTone: string;
  isMobile?: boolean;
}

/**
 * Anatomical eyelids with proper fold structure and eyelashes
 * Creates the critical depth that prevents the "uncanny valley" stare
 */
export const AvatarEyelids = ({
  headRadius,
  eyeSpacing,
  eyeY,
  eyeZ,
  eyeRadius,
  skinTone,
  isMobile = false,
}: AvatarEyelidsProps) => {
  const segments = isMobile ? 16 : 32;
  
  // Create upper eyelid geometry - curved shell over eye
  const upperLidGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const width = eyeRadius * 1.3;
    const height = eyeRadius * 0.5;
    
    // Almond shape
    shape.moveTo(-width, 0);
    shape.quadraticCurveTo(-width * 0.5, height, 0, height);
    shape.quadraticCurveTo(width * 0.5, height, width, 0);
    shape.quadraticCurveTo(width * 0.5, height * 0.2, 0, height * 0.15);
    shape.quadraticCurveTo(-width * 0.5, height * 0.2, -width, 0);
    
    return new THREE.ExtrudeGeometry(shape, {
      depth: eyeRadius * 0.2,
      bevelEnabled: true,
      bevelThickness: 0.002,
      bevelSize: 0.002,
      bevelSegments: isMobile ? 2 : 4,
    });
  }, [eyeRadius, isMobile]);
  
  // Create lower eyelid geometry - thinner crescent
  const lowerLidGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const width = eyeRadius * 1.2;
    const height = eyeRadius * 0.25;
    
    shape.moveTo(-width, 0);
    shape.quadraticCurveTo(-width * 0.5, -height, 0, -height);
    shape.quadraticCurveTo(width * 0.5, -height, width, 0);
    shape.quadraticCurveTo(width * 0.5, -height * 0.4, 0, -height * 0.35);
    shape.quadraticCurveTo(-width * 0.5, -height * 0.4, -width, 0);
    
    return new THREE.ExtrudeGeometry(shape, {
      depth: eyeRadius * 0.12,
      bevelEnabled: true,
      bevelThickness: 0.001,
      bevelSize: 0.001,
      bevelSegments: 2,
    });
  }, [eyeRadius]);
  
  // Eyelash geometry - array of curved lashes
  const eyelashCount = isMobile ? 8 : 16;
  
  // Darker skin tone for eyelid fold shadow
  const shadowColor = useMemo(() => {
    const color = new THREE.Color(skinTone);
    color.multiplyScalar(0.7);
    return `#${color.getHexString()}`;
  }, [skinTone]);
  
  // Eyelash color (dark brown/black)
  const lashColor = '#1A1A1A';

  const EyelashRow = ({ side, isUpper }: { side: 'left' | 'right'; isUpper: boolean }) => {
    const xPos = side === 'left' ? -eyeSpacing : eyeSpacing;
    const lashes = [];
    
    for (let i = 0; i < eyelashCount; i++) {
      const t = i / (eyelashCount - 1);
      const angle = (t - 0.5) * Math.PI * 0.6;
      const lashLength = isUpper 
        ? eyeRadius * (0.12 + Math.sin(t * Math.PI) * 0.08)
        : eyeRadius * 0.06;
      const lashX = Math.sin(angle) * eyeRadius * 1.1;
      const lashY = isUpper 
        ? eyeRadius * 0.4 + Math.cos(angle) * eyeRadius * 0.2
        : -eyeRadius * 0.35 + Math.cos(angle) * eyeRadius * 0.1;
      const rotation = isUpper
        ? [0.3 + Math.sin(t * Math.PI) * 0.2, 0, angle * 0.3]
        : [-0.1, 0, angle * 0.2];
      
      lashes.push(
        <mesh 
          key={i} 
          position={[lashX * (side === 'right' ? -1 : 1), lashY, eyeRadius * 0.9]}
          rotation={rotation as [number, number, number]}
        >
          <cylinderGeometry args={[0.0008, 0.0003, lashLength, 4]} />
          <meshStandardMaterial color={lashColor} roughness={0.8} />
        </mesh>
      );
    }
    
    return (
      <group position={[xPos, eyeY, eyeZ]}>
        {lashes}
      </group>
    );
  };

  const Eyelid = ({ side }: { side: 'left' | 'right' }) => {
    const xPos = side === 'left' ? -eyeSpacing : eyeSpacing;
    const mirror = side === 'right' ? -1 : 1;
    
    return (
      <group position={[xPos, eyeY, eyeZ]}>
        {/* Eye socket depression - creates depth */}
        <mesh position={[0, eyeRadius * 0.1, -eyeRadius * 0.3]}>
          <sphereGeometry args={[eyeRadius * 1.6, segments / 2, segments / 2]} />
          <meshStandardMaterial 
            color={shadowColor}
            roughness={0.9}
            transparent
            opacity={0.4}
          />
        </mesh>
        
        {/* Upper eyelid */}
        <mesh 
          geometry={upperLidGeometry}
          position={[0, eyeRadius * 0.15, eyeRadius * 0.6]}
          rotation={[0.4, 0, 0]}
          scale={[mirror, 1, 1]}
        >
          <meshPhysicalMaterial
            color={skinTone}
            roughness={0.5}
            metalness={0}
            clearcoat={0.1}
          />
        </mesh>
        
        {/* Upper eyelid crease - adds realism */}
        <mesh position={[0, eyeRadius * 0.55, eyeRadius * 0.5]}>
          <torusGeometry args={[eyeRadius * 1.0, 0.003, 4, 24, Math.PI]} />
          <meshStandardMaterial 
            color={shadowColor}
            roughness={0.8}
            transparent
            opacity={0.5}
          />
        </mesh>
        
        {/* Lower eyelid */}
        <mesh 
          geometry={lowerLidGeometry}
          position={[0, -eyeRadius * 0.3, eyeRadius * 0.7]}
          rotation={[-0.1, 0, 0]}
          scale={[mirror, 1, 1]}
        >
          <meshPhysicalMaterial
            color={skinTone}
            roughness={0.5}
            metalness={0}
            clearcoat={0.1}
          />
        </mesh>
        
        {/* Lower eyelid rim - waterline */}
        <mesh position={[0, -eyeRadius * 0.38, eyeRadius * 0.85]}>
          <torusGeometry args={[eyeRadius * 0.9, 0.0015, 4, 24, Math.PI]} />
          <meshStandardMaterial 
            color="#FFB4B4"
            roughness={0.3}
          />
        </mesh>
      </group>
    );
  };

  return (
    <group>
      <Eyelid side="left" />
      <Eyelid side="right" />
      <EyelashRow side="left" isUpper />
      <EyelashRow side="right" isUpper />
      {!isMobile && (
        <>
          <EyelashRow side="left" isUpper={false} />
          <EyelashRow side="right" isUpper={false} />
        </>
      )}
    </group>
  );
};
