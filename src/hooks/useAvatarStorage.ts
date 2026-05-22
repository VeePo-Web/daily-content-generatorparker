import { useCallback, useEffect, useState } from 'react';
import { AvatarConfig } from '@/components/try-on/avatar-creator/avatarPresets';

const AVATAR_STORAGE_KEY = 'loj-custom-avatar';

/**
 * Hook for persisting avatar configuration to localStorage
 * with optional Supabase sync for logged-in users (future enhancement)
 */
export const useAvatarStorage = () => {
  const [savedAvatar, setSavedAvatar] = useState<AvatarConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load avatar from storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AVATAR_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AvatarConfig;
        // Restore Date object
        parsed.createdAt = new Date(parsed.createdAt);
        setSavedAvatar(parsed);
      }
    } catch (error) {
      console.error('[useAvatarStorage] Failed to load avatar:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveAvatar = useCallback((avatar: AvatarConfig) => {
    try {
      localStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify(avatar));
      setSavedAvatar(avatar);
      
      // TODO: Sync to Supabase if user is logged in
      // This would use a saved_avatars table with RLS
      
      return true;
    } catch (error) {
      console.error('[useAvatarStorage] Failed to save avatar:', error);
      return false;
    }
  }, []);

  const deleteAvatar = useCallback(() => {
    try {
      localStorage.removeItem(AVATAR_STORAGE_KEY);
      setSavedAvatar(null);
      
      // TODO: Delete from Supabase if synced
      
      return true;
    } catch (error) {
      console.error('[useAvatarStorage] Failed to delete avatar:', error);
      return false;
    }
  }, []);

  const hasAvatar = savedAvatar !== null;

  return {
    savedAvatar,
    hasAvatar,
    isLoading,
    saveAvatar,
    deleteAvatar,
  };
};
