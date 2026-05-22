import { useMemo } from 'react';
import { AvatarConfig } from '../avatar-creator/avatarPresets';
import { AvatarBody } from './AvatarBody';
import { AvatarHead } from './AvatarHead';
import { useIsMobile } from '@/hooks/use-mobile';

interface RealisticAvatarProps {
  config: AvatarConfig;
  position?: [number, number, number];
}

/**
 * RealisticAvatar - Complete human avatar with body, face, and hair
 * 
 * Uses AvatarConfig to render a photorealistic human figure
 * that replaces the abstract mannequin for a more personal experience.
 */
export const RealisticAvatar = ({ config, position = [0, 0, 0] }: RealisticAvatarProps) => {
  const isMobile = useIsMobile();
  
  // Calculate head position based on body height
  const headY = useMemo(() => {
    const heightM = config.body.heightCm / 100;
    return heightM * 0.92; // Head center at ~92% of height
  }, [config.body.heightCm]);
  
  const headRadius = useMemo(() => {
    const heightM = config.body.heightCm / 100;
    return heightM / 8 / 2; // 8-head scale, radius is half of head height
  }, [config.body.heightCm]);

  return (
    <group position={position}>
      {/* Body */}
      <AvatarBody
        config={config.body}
        gender={config.gender}
        skinTone={config.skinTone}
        isMobile={isMobile}
      />
      
      {/* Head with face and hair */}
      <group position={[0, headY, 0]}>
        <AvatarHead
          skinTone={config.skinTone}
          faceConfig={config.face}
          hairConfig={config.hair}
          headRadius={headRadius}
          isMobile={isMobile}
        />
      </group>
    </group>
  );
};
