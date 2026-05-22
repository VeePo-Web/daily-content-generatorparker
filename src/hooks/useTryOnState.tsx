import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import type { AvatarConfig } from '@/components/try-on/avatar-creator/avatarPresets';

export interface EquippedItem {
  productId: string;
  variantId?: string;
  size: string;
  color: string;
  price: number;
  name: string;
  imageUrl?: string;
  textureUrl?: string;  // Flat-front image optimized for 3D texturing
  modelUrl?: string;
  productImages?: Array<{
    image_url: string;
    is_primary?: boolean;
  }>;
}

export interface BodyMeasurements {
  heightCm: number;
  weightKg: number;
  chestCm: number;
  waistCm: number;
  hipsCm: number;
  inseamCm: number;
}

export interface TryOnState {
  avatarGender: 'male' | 'female';
  avatarBodyType: 'slim' | 'athletic' | 'average' | 'curvy';
  avatarSkinTone: string;
  equippedItems: {
    head: EquippedItem | null;
    top: EquippedItem | null;
    outerwear: EquippedItem | null;
    bottom: EquippedItem | null;
    footwear: EquippedItem | null;
  };
  activeSlot: string | null;
  isLoading: boolean;
  // New measurement-based customization
  measurements: BodyMeasurements;
  unitSystem: 'metric' | 'imperial';
  useDetailedMeasurements: boolean;
  // NEW: Realistic Avatar System
  customAvatar: AvatarConfig | null;
  avatarMode: 'mannequin' | 'realistic';
  showAvatarWizard: boolean;
}

interface TryOnContextType extends TryOnState {
  setAvatarGender: (gender: 'male' | 'female') => void;
  setAvatarBodyType: (bodyType: 'slim' | 'athletic' | 'average' | 'curvy') => void;
  setAvatarSkinTone: (tone: string) => void;
  equipItem: (slot: keyof TryOnState['equippedItems'], item: EquippedItem) => void;
  unequipItem: (slot: keyof TryOnState['equippedItems']) => void;
  clearAllItems: () => void;
  setActiveSlot: (slot: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  getTotalPrice: () => number;
  getEquippedCount: () => number;
  // New measurement methods
  setMeasurements: (measurements: BodyMeasurements) => void;
  setUnitSystem: (unit: 'metric' | 'imperial') => void;
  setUseDetailedMeasurements: (use: boolean) => void;
  // NEW: Avatar methods
  setCustomAvatar: (avatar: AvatarConfig | null) => void;
  setAvatarMode: (mode: 'mannequin' | 'realistic') => void;
  setShowAvatarWizard: (show: boolean) => void;
}

const TryOnContext = createContext<TryOnContextType | undefined>(undefined);

const defaultMeasurements: BodyMeasurements = {
  heightCm: 170,
  weightKg: 70,
  chestCm: 96,
  waistCm: 82,
  hipsCm: 98,
  inseamCm: 76,
};

const AVATAR_STORAGE_KEY = 'loj-custom-avatar';

const defaultState: TryOnState = {
  avatarGender: 'male',
  avatarBodyType: 'average',
  avatarSkinTone: '#D4A574',
  equippedItems: {
    head: null,
    top: null,
    outerwear: null,
    bottom: null,
    footwear: null,
  },
  activeSlot: null,
  isLoading: false,
  measurements: defaultMeasurements,
  unitSystem: 'metric',
  useDetailedMeasurements: false,
  // NEW: Avatar defaults
  customAvatar: null,
  avatarMode: 'mannequin',
  showAvatarWizard: false,
};

export const TryOnProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<TryOnState>(defaultState);

  // Load saved avatar from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AVATAR_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AvatarConfig;
        parsed.createdAt = new Date(parsed.createdAt);
        setState(prev => ({ 
          ...prev, 
          customAvatar: parsed,
          avatarMode: 'realistic', // Auto-switch to realistic if avatar exists
        }));
      }
    } catch (error) {
      console.error('[TryOnProvider] Failed to load saved avatar:', error);
    }
  }, []);

  const setAvatarGender = useCallback((gender: 'male' | 'female') => {
    setState(prev => ({ ...prev, avatarGender: gender }));
  }, []);

  const setAvatarBodyType = useCallback((bodyType: 'slim' | 'athletic' | 'average' | 'curvy') => {
    setState(prev => ({ ...prev, avatarBodyType: bodyType }));
  }, []);

  const setAvatarSkinTone = useCallback((tone: string) => {
    setState(prev => ({ ...prev, avatarSkinTone: tone }));
  }, []);

  const equipItem = useCallback((slot: keyof TryOnState['equippedItems'], item: EquippedItem) => {
    setState(prev => ({
      ...prev,
      equippedItems: {
        ...prev.equippedItems,
        [slot]: item,
      },
    }));
  }, []);

  const unequipItem = useCallback((slot: keyof TryOnState['equippedItems']) => {
    setState(prev => ({
      ...prev,
      equippedItems: {
        ...prev.equippedItems,
        [slot]: null,
      },
    }));
  }, []);

  const clearAllItems = useCallback(() => {
    setState(prev => ({
      ...prev,
      equippedItems: {
        head: null,
        top: null,
        outerwear: null,
        bottom: null,
        footwear: null,
      },
    }));
  }, []);

  const setActiveSlot = useCallback((slot: string | null) => {
    setState(prev => ({ ...prev, activeSlot: slot }));
  }, []);

  const setIsLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const getTotalPrice = useCallback(() => {
    return Object.values(state.equippedItems).reduce((total, item) => {
      return total + (item?.price || 0);
    }, 0);
  }, [state.equippedItems]);

  const getEquippedCount = useCallback(() => {
    return Object.values(state.equippedItems).filter(Boolean).length;
  }, [state.equippedItems]);

  // New measurement methods
  const setMeasurements = useCallback((measurements: BodyMeasurements) => {
    setState(prev => ({ ...prev, measurements }));
  }, []);

  const setUnitSystem = useCallback((unitSystem: 'metric' | 'imperial') => {
    setState(prev => ({ ...prev, unitSystem }));
  }, []);

  const setUseDetailedMeasurements = useCallback((useDetailedMeasurements: boolean) => {
    setState(prev => ({ ...prev, useDetailedMeasurements }));
  }, []);

  // NEW: Avatar methods
  const setCustomAvatar = useCallback((avatar: AvatarConfig | null) => {
    setState(prev => ({ ...prev, customAvatar: avatar }));
    // Persist to localStorage
    if (avatar) {
      try {
        localStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify(avatar));
      } catch (error) {
        console.error('[TryOnProvider] Failed to save avatar:', error);
      }
    } else {
      localStorage.removeItem(AVATAR_STORAGE_KEY);
    }
  }, []);

  const setAvatarMode = useCallback((avatarMode: 'mannequin' | 'realistic') => {
    setState(prev => ({ ...prev, avatarMode }));
  }, []);

  const setShowAvatarWizard = useCallback((showAvatarWizard: boolean) => {
    setState(prev => ({ ...prev, showAvatarWizard }));
  }, []);

  return (
    <TryOnContext.Provider
      value={{
        ...state,
        setAvatarGender,
        setAvatarBodyType,
        setAvatarSkinTone,
        equipItem,
        unequipItem,
        clearAllItems,
        setActiveSlot,
        setIsLoading,
        getTotalPrice,
        getEquippedCount,
        setMeasurements,
        setUnitSystem,
        setUseDetailedMeasurements,
        setCustomAvatar,
        setAvatarMode,
        setShowAvatarWizard,
      }}
    >
      {children}
    </TryOnContext.Provider>
  );
};

export const useTryOnState = () => {
  const context = useContext(TryOnContext);
  if (!context) {
    throw new Error('useTryOnState must be used within a TryOnProvider');
  }
  return context;
};
