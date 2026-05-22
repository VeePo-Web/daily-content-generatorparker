import { useState, useEffect, useCallback } from 'react';
import { BodyMeasurements, defaultMeasurements } from '../utils/measurementToProportions';

const STORAGE_KEY = 'loj_body_profiles';
const MAX_PROFILES = 5;

export interface SavedProfile {
  id: string;
  name: string;
  measurements: BodyMeasurements;
  gender: 'male' | 'female';
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfilesData {
  profiles: SavedProfile[];
  activeProfileId: string | null;
}

const generateId = () => `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const getStoredData = (): ProfilesData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Handle legacy format (single measurements object)
      if (parsed.measurements && !parsed.profiles) {
        const legacyProfile: SavedProfile = {
          id: generateId(),
          name: 'My Measurements',
          measurements: parsed.measurements,
          gender: parsed.gender || 'female',
          isDefault: true,
          createdAt: parsed.savedAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return { profiles: [legacyProfile], activeProfileId: legacyProfile.id };
      }
      return parsed as ProfilesData;
    }
  } catch (e) {
    console.error('Failed to load profiles:', e);
  }
  return { profiles: [], activeProfileId: null };
};

const saveStoredData = (data: ProfilesData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save profiles:', e);
  }
};

export const useBodyProfiles = () => {
  const [data, setData] = useState<ProfilesData>(() => getStoredData());
  const [isLoaded, setIsLoaded] = useState(false);

  // Load on mount
  useEffect(() => {
    const stored = getStoredData();
    setData(stored);
    setIsLoaded(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (isLoaded) {
      saveStoredData(data);
    }
  }, [data, isLoaded]);

  // Get all profiles
  const profiles = data.profiles;

  // Get active profile
  const activeProfile = profiles.find(p => p.id === data.activeProfileId) || null;

  // Get default profile
  const defaultProfile = profiles.find(p => p.isDefault) || null;

  // Create new profile
  const createProfile = useCallback((
    name: string,
    measurements: BodyMeasurements,
    gender: 'male' | 'female'
  ): SavedProfile | null => {
    if (data.profiles.length >= MAX_PROFILES) {
      return null;
    }

    const now = new Date().toISOString();
    const newProfile: SavedProfile = {
      id: generateId(),
      name,
      measurements,
      gender,
      isDefault: data.profiles.length === 0, // First profile is default
      createdAt: now,
      updatedAt: now,
    };

    setData(prev => ({
      ...prev,
      profiles: [...prev.profiles, newProfile],
      activeProfileId: newProfile.id,
    }));

    return newProfile;
  }, [data.profiles.length]);

  // Update existing profile
  const updateProfile = useCallback((
    profileId: string,
    updates: Partial<Pick<SavedProfile, 'name' | 'measurements' | 'gender'>>
  ) => {
    setData(prev => ({
      ...prev,
      profiles: prev.profiles.map(p =>
        p.id === profileId
          ? { ...p, ...updates, updatedAt: new Date().toISOString() }
          : p
      ),
    }));
  }, []);

  // Delete profile
  const deleteProfile = useCallback((profileId: string) => {
    setData(prev => {
      const filtered = prev.profiles.filter(p => p.id !== profileId);
      // If deleting the active profile, clear it
      const newActiveId = prev.activeProfileId === profileId ? null : prev.activeProfileId;
      // If deleting the default, make first remaining profile default
      const wasDefault = prev.profiles.find(p => p.id === profileId)?.isDefault;
      if (wasDefault && filtered.length > 0) {
        filtered[0].isDefault = true;
      }
      return { profiles: filtered, activeProfileId: newActiveId };
    });
  }, []);

  // Set profile as default
  const setDefaultProfile = useCallback((profileId: string) => {
    setData(prev => ({
      ...prev,
      profiles: prev.profiles.map(p => ({
        ...p,
        isDefault: p.id === profileId,
      })),
    }));
  }, []);

  // Set active profile
  const setActiveProfile = useCallback((profileId: string | null) => {
    setData(prev => ({
      ...prev,
      activeProfileId: profileId,
    }));
  }, []);

  // Export profile as JSON string
  const exportProfile = useCallback((profileId: string): string | null => {
    const profile = data.profiles.find(p => p.id === profileId);
    if (!profile) return null;
    return JSON.stringify({
      name: profile.name,
      measurements: profile.measurements,
      gender: profile.gender,
    });
  }, [data.profiles]);

  // Import profile from JSON string
  const importProfile = useCallback((jsonString: string): SavedProfile | null => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.measurements && parsed.name) {
        return createProfile(
          parsed.name,
          parsed.measurements,
          parsed.gender || 'female'
        );
      }
    } catch (e) {
      console.error('Failed to import profile:', e);
    }
    return null;
  }, [createProfile]);

  // Check if can add more profiles
  const canAddProfile = data.profiles.length < MAX_PROFILES;

  return {
    profiles,
    activeProfile,
    defaultProfile,
    isLoaded,
    canAddProfile,
    maxProfiles: MAX_PROFILES,
    createProfile,
    updateProfile,
    deleteProfile,
    setDefaultProfile,
    setActiveProfile,
    exportProfile,
    importProfile,
  };
};
