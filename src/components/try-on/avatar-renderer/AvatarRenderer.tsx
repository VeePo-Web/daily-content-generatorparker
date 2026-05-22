import { Suspense } from 'react';
import { AvatarConfig } from '../avatar-creator/avatarPresets';
import { GLBAvatarLoader } from './GLBAvatarLoader';
import { LoadingAvatar } from './LoadingAvatar';
import { RealisticAvatar } from '../realistic-avatar';

interface AvatarRendererProps {
  config: AvatarConfig;
  position?: [number, number, number];
}

/**
 * AvatarRenderer - Smart router for avatar rendering
 * 
 * Priority order:
 * 1. GLB URL (Ready Player Me or custom upload)
 * 2. Pre-made GLB from library (when available)
 * 3. Enhanced procedural avatar (fallback)
 */
export const AvatarRenderer = ({ config, position = [0, 0, 0] }: AvatarRendererProps) => {
  // Priority 1: Ready Player Me or custom GLB URL
  if (config.glbUrl) {
    return (
      <Suspense fallback={<LoadingAvatar position={position} />}>
        <GLBAvatarLoader url={config.glbUrl} position={position} />
      </Suspense>
    );
  }
  
  // Priority 2: Pre-made GLB from library (future enhancement)
  // For now, we check if there's a predefined GLB path
  const preloadedGLBs: Record<string, string> = {
    // Will be populated when GLB models are added
    // 'alex': '/avatars/alex.glb',
    // 'jordan': '/avatars/jordan.glb',
  };
  
  if (config.method === 'library' && preloadedGLBs[config.id]) {
    return (
      <Suspense fallback={<LoadingAvatar position={position} />}>
        <GLBAvatarLoader url={preloadedGLBs[config.id]} position={position} />
      </Suspense>
    );
  }
  
  // Priority 3: Enhanced procedural avatar
  return (
    <RealisticAvatar config={config} position={position} />
  );
};
