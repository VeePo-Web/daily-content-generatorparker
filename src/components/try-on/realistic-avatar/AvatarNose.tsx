import { useMemo } from 'react';
import * as THREE from 'three';

interface AvatarNoseProps {
  headRadius: number;
  noseWidth: number; // 0-100 from face config
  skinTone: string;
  isMobile?: boolean;
}

/**
 * Anatomical nose with bridge, tip, nostrils, and columella
 * Creates proper 3D projection instead of subtle bump
 */
export const AvatarNose = ({
  headRadius,
  noseWidth,
  skinTone,
  isMobile = false,
}: AvatarNoseProps) => {
  const segments = isMobile ? 12 : 24;
  const widthMod = 0.8 + (noseWidth / 100) * 0.4; // 0.8 to 1.2

  // Nose bridge geometry using lathe
  const bridgeGeometry = useMemo(() => {
    const points: THREE.Vector2[] = [];
    const length = headRadius * 0.28;
    const width = headRadius * 0.035 * widthMod;
    
    // Profile from bridge to tip
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      let radius: number;
      
      if (t < 0.3) {
        // Upper bridge - narrow
        radius = width * (0.6 + t * 0.5);
      } else if (t < 0.7) {
        // Mid bridge - straight
        radius = width * (0.75 + (t - 0.3) * 0.4);
      } else {
        // Tip - rounded bulge
        const tipT = (t - 0.7) / 0.3;
        radius = width * (0.91 + Math.sin(tipT * Math.PI) * 0.35);
      }
      
      points.push(new THREE.Vector2(radius, t * length));
    }
    
    const geo = new THREE.LatheGeometry(points, segments);
    geo.computeVertexNormals();
    return geo;
  }, [headRadius, widthMod, segments]);

  // Nostril geometry
  const nostrilGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const w = headRadius * 0.025 * widthMod;
    const h = headRadius * 0.018;
    
    // Teardrop/comma shape for nostril opening
    shape.moveTo(0, 0);
    shape.bezierCurveTo(w, h * 0.5, w, h, 0, h * 1.2);
    shape.bezierCurveTo(-w * 0.3, h, -w * 0.3, 0, 0, 0);
    
    return new THREE.ExtrudeGeometry(shape, {
      depth: headRadius * 0.015,
      bevelEnabled: true,
      bevelThickness: 0.002,
      bevelSize: 0.002,
      bevelSegments: 2,
    });
  }, [headRadius, widthMod]);

  // Alar (nostril wing) geometry
  const alarGeometry = useMemo(() => {
    return new THREE.SphereGeometry(
      headRadius * 0.028 * widthMod,
      segments / 2,
      segments / 2,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.6
    );
  }, [headRadius, widthMod, segments]);

  const noseY = headRadius * 0.02;
  const noseZ = headRadius * 0.85;

  // Darker tone for nostril interior
  const nostrilColor = useMemo(() => {
    const color = new THREE.Color(skinTone);
    color.multiplyScalar(0.4);
    return `#${color.getHexString()}`;
  }, [skinTone]);

  return (
    <group position={[0, noseY, noseZ]}>
      {/* Nose bridge */}
      <mesh 
        geometry={bridgeGeometry}
        position={[0, headRadius * 0.05, -headRadius * 0.02]}
        rotation={[-Math.PI / 2 + 0.3, 0, 0]}
      >
        <meshPhysicalMaterial
          color={skinTone}
          roughness={0.4}
          metalness={0}
          clearcoat={0.15}
          clearcoatRoughness={0.6}
        />
      </mesh>
      
      {/* Nose tip - more pronounced sphere */}
      <mesh position={[0, -headRadius * 0.08, headRadius * 0.03]}>
        <sphereGeometry args={[headRadius * 0.04 * widthMod, segments, segments / 2]} />
        <meshPhysicalMaterial
          color={skinTone}
          roughness={0.35}
          metalness={0}
          clearcoat={0.2}
        />
      </mesh>
      
      {/* Columella (between nostrils) */}
      <mesh position={[0, -headRadius * 0.1, headRadius * 0.015]} rotation={[-0.3, 0, 0]}>
        <cylinderGeometry args={[headRadius * 0.012, headRadius * 0.015, headRadius * 0.04, 6]} />
        <meshPhysicalMaterial color={skinTone} roughness={0.5} />
      </mesh>
      
      {/* Left alar (nostril wing) */}
      <mesh 
        geometry={alarGeometry}
        position={[-headRadius * 0.035 * widthMod, -headRadius * 0.09, 0]}
        rotation={[0.3, 0.2, 0]}
      >
        <meshPhysicalMaterial color={skinTone} roughness={0.45} />
      </mesh>
      
      {/* Right alar */}
      <mesh 
        geometry={alarGeometry}
        position={[headRadius * 0.035 * widthMod, -headRadius * 0.09, 0]}
        rotation={[0.3, -0.2, 0]}
      >
        <meshPhysicalMaterial color={skinTone} roughness={0.45} />
      </mesh>
      
      {/* Left nostril opening */}
      <mesh 
        geometry={nostrilGeometry}
        position={[-headRadius * 0.025 * widthMod, -headRadius * 0.1, -headRadius * 0.01]}
        rotation={[-0.5, 0.3, 0]}
      >
        <meshStandardMaterial color={nostrilColor} roughness={0.9} />
      </mesh>
      
      {/* Right nostril opening */}
      <mesh 
        geometry={nostrilGeometry}
        position={[headRadius * 0.025 * widthMod, -headRadius * 0.1, -headRadius * 0.01]}
        rotation={[-0.5, -0.3, 0]}
        scale={[-1, 1, 1]}
      >
        <meshStandardMaterial color={nostrilColor} roughness={0.9} />
      </mesh>
      
      {/* Septum base */}
      <mesh position={[0, -headRadius * 0.11, -headRadius * 0.008]}>
        <boxGeometry args={[headRadius * 0.015, headRadius * 0.02, headRadius * 0.012]} />
        <meshPhysicalMaterial color={skinTone} roughness={0.5} />
      </mesh>
    </group>
  );
};
