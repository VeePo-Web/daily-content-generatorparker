/**
 * Avatar Presets - 12 Diverse Pre-Made Avatars
 * 
 * Inclusive representation across genders, body types, skin tones, and heights.
 */

export interface AvatarBodyConfig {
  heightCm: number;
  weightKg: number;
  chestCm: number;
  waistCm: number;
  hipsCm: number;
  inseamCm: number;
  shoulderWidthCm: number;
  armLengthCm: number;
  neckCircumferenceCm: number;
  torsoLengthCm: number;
  bodyType: 'ectomorph' | 'mesomorph' | 'endomorph';
  muscleDefinition: number; // 0-100
}

export interface AvatarFaceConfig {
  faceShape: 'oval' | 'round' | 'square' | 'heart' | 'oblong';
  jawWidth: number; // 0-100
  cheekboneHeight: number; // 0-100
  foreheadHeight: number; // 0-100
  chinLength: number; // 0-100
  eyeSize: number; // 0-100
  noseWidth: number; // 0-100
  lipFullness: number; // 0-100
  facialHair: 'none' | 'stubble' | 'beard' | 'goatee';
  hasGlasses: boolean;
  glassesStyle: 'round' | 'square' | 'aviator' | 'cat-eye';
}

export interface AvatarHairConfig {
  style: 'bald' | 'buzz' | 'short' | 'medium' | 'long' | 'ponytail' | 'braids' | 'afro' | 'curly';
  color: string;
  hairline: 'full' | 'receding' | 'widows-peak';
}

export interface AvatarConfig {
  id: string;
  name: string;
  createdAt: Date;
  method: 'photo' | 'manual' | 'library' | 'readyplayerme' | 'ai-generated';
  gender: 'male' | 'female' | 'non-binary';
  skinTone: string;
  body: AvatarBodyConfig;
  face: AvatarFaceConfig;
  hair: AvatarHairConfig;
  /** GLB URL for Ready Player Me or custom uploaded avatars */
  glbUrl?: string;
}

// Extended skin tone palette - 20 diverse tones
export const SKIN_TONES = [
  // Very Light
  { id: 'porcelain', hex: '#FDEEE0', name: 'Porcelain' },
  { id: 'ivory', hex: '#F8E4D4', name: 'Ivory' },
  { id: 'fair', hex: '#F5DEC4', name: 'Fair' },
  // Light
  { id: 'light', hex: '#EECDAD', name: 'Light' },
  { id: 'peach', hex: '#E8C4A8', name: 'Peach' },
  { id: 'cream', hex: '#E5BC9A', name: 'Cream' },
  // Light-Medium
  { id: 'beige', hex: '#D4A574', name: 'Beige' },
  { id: 'sand', hex: '#D09E6C', name: 'Sand' },
  { id: 'honey', hex: '#C99760', name: 'Honey' },
  // Medium
  { id: 'caramel', hex: '#C08050', name: 'Caramel' },
  { id: 'tan', hex: '#B07848', name: 'Tan' },
  { id: 'amber', hex: '#A87040', name: 'Amber' },
  // Medium-Dark
  { id: 'bronze', hex: '#986038', name: 'Bronze' },
  { id: 'copper', hex: '#885830', name: 'Copper' },
  { id: 'sienna', hex: '#7A4F28', name: 'Sienna' },
  // Dark
  { id: 'chestnut', hex: '#6B4520', name: 'Chestnut' },
  { id: 'cocoa', hex: '#5C3D18', name: 'Cocoa' },
  { id: 'espresso', hex: '#4D3510', name: 'Espresso' },
  // Deep
  { id: 'mahogany', hex: '#3E2D0A', name: 'Mahogany' },
  { id: 'ebony', hex: '#2F2508', name: 'Ebony' },
];

// Hair colors
export const HAIR_COLORS = [
  // Natural
  { id: 'black', hex: '#1A1A1A', name: 'Black' },
  { id: 'dark-brown', hex: '#3D2314', name: 'Dark Brown' },
  { id: 'brown', hex: '#5D3A1A', name: 'Brown' },
  { id: 'light-brown', hex: '#8B5A2B', name: 'Light Brown' },
  { id: 'auburn', hex: '#923E23', name: 'Auburn' },
  { id: 'red', hex: '#A54B2A', name: 'Red' },
  { id: 'strawberry', hex: '#C47D4E', name: 'Strawberry' },
  { id: 'blonde', hex: '#D4A65A', name: 'Blonde' },
  { id: 'platinum', hex: '#E8D9B5', name: 'Platinum' },
  { id: 'gray', hex: '#9E9E9E', name: 'Gray' },
  { id: 'white', hex: '#E8E8E8', name: 'White' },
  // Fashion colors
  { id: 'purple', hex: '#6B3FA0', name: 'Purple' },
  { id: 'blue', hex: '#2E5A8C', name: 'Blue' },
  { id: 'pink', hex: '#D64D7D', name: 'Pink' },
  { id: 'green', hex: '#2E7D5A', name: 'Green' },
];

// Default face config
const defaultFace: AvatarFaceConfig = {
  faceShape: 'oval',
  jawWidth: 50,
  cheekboneHeight: 50,
  foreheadHeight: 50,
  chinLength: 50,
  eyeSize: 50,
  noseWidth: 50,
  lipFullness: 50,
  facialHair: 'none',
  hasGlasses: false,
  glassesStyle: 'round',
};

// 12 Diverse Pre-Made Avatars
export const AVATAR_PRESETS: AvatarConfig[] = [
  // Male Avatars
  {
    id: 'alex',
    name: 'Alex',
    createdAt: new Date(),
    method: 'library',
    gender: 'male',
    skinTone: '#F5DEC4',
    body: {
      heightCm: 178,
      weightKg: 75,
      chestCm: 98,
      waistCm: 82,
      hipsCm: 96,
      inseamCm: 80,
      shoulderWidthCm: 46,
      armLengthCm: 62,
      neckCircumferenceCm: 38,
      torsoLengthCm: 48,
      bodyType: 'mesomorph',
      muscleDefinition: 60,
    },
    face: { ...defaultFace, faceShape: 'square', jawWidth: 60 },
    hair: { style: 'short', color: '#5D3A1A', hairline: 'full' },
  },
  {
    id: 'jordan',
    name: 'Jordan',
    createdAt: new Date(),
    method: 'library',
    gender: 'male',
    skinTone: '#C08050',
    body: {
      heightCm: 183,
      weightKg: 78,
      chestCm: 100,
      waistCm: 80,
      hipsCm: 94,
      inseamCm: 84,
      shoulderWidthCm: 48,
      armLengthCm: 65,
      neckCircumferenceCm: 40,
      torsoLengthCm: 50,
      bodyType: 'ectomorph',
      muscleDefinition: 45,
    },
    face: { ...defaultFace, faceShape: 'oblong', cheekboneHeight: 60 },
    hair: { style: 'buzz', color: '#1A1A1A', hairline: 'full' },
  },
  {
    id: 'marcus',
    name: 'Marcus',
    createdAt: new Date(),
    method: 'library',
    gender: 'male',
    skinTone: '#5C3D18',
    body: {
      heightCm: 175,
      weightKg: 82,
      chestCm: 102,
      waistCm: 88,
      hipsCm: 100,
      inseamCm: 76,
      shoulderWidthCm: 45,
      armLengthCm: 60,
      neckCircumferenceCm: 40,
      torsoLengthCm: 47,
      bodyType: 'endomorph',
      muscleDefinition: 50,
    },
    face: { ...defaultFace, faceShape: 'round', jawWidth: 55, lipFullness: 60 },
    hair: { style: 'curly', color: '#1A1A1A', hairline: 'full' },
  },
  {
    id: 'ethan',
    name: 'Ethan',
    createdAt: new Date(),
    method: 'library',
    gender: 'male',
    skinTone: '#F8E4D4',
    body: {
      heightCm: 180,
      weightKg: 85,
      chestCm: 106,
      waistCm: 84,
      hipsCm: 98,
      inseamCm: 82,
      shoulderWidthCm: 50,
      armLengthCm: 64,
      neckCircumferenceCm: 42,
      torsoLengthCm: 49,
      bodyType: 'mesomorph',
      muscleDefinition: 75,
    },
    face: { ...defaultFace, faceShape: 'square', jawWidth: 70, facialHair: 'stubble' },
    hair: { style: 'medium', color: '#D4A65A', hairline: 'widows-peak' },
  },
  {
    id: 'chen',
    name: 'Chen',
    createdAt: new Date(),
    method: 'library',
    gender: 'male',
    skinTone: '#E5BC9A',
    body: {
      heightCm: 172,
      weightKg: 68,
      chestCm: 94,
      waistCm: 78,
      hipsCm: 92,
      inseamCm: 74,
      shoulderWidthCm: 43,
      armLengthCm: 58,
      neckCircumferenceCm: 36,
      torsoLengthCm: 45,
      bodyType: 'ectomorph',
      muscleDefinition: 40,
    },
    face: { ...defaultFace, faceShape: 'oval', eyeSize: 55 },
    hair: { style: 'short', color: '#1A1A1A', hairline: 'full' },
  },
  // Female Avatars
  {
    id: 'sofia',
    name: 'Sofia',
    createdAt: new Date(),
    method: 'library',
    gender: 'female',
    skinTone: '#EECDAD',
    body: {
      heightCm: 165,
      weightKg: 68,
      chestCm: 94,
      waistCm: 72,
      hipsCm: 102,
      inseamCm: 72,
      shoulderWidthCm: 38,
      armLengthCm: 54,
      neckCircumferenceCm: 32,
      torsoLengthCm: 42,
      bodyType: 'endomorph',
      muscleDefinition: 30,
    },
    face: { ...defaultFace, faceShape: 'heart', lipFullness: 65, eyeSize: 60 },
    hair: { style: 'long', color: '#5D3A1A', hairline: 'full' },
  },
  {
    id: 'maya',
    name: 'Maya',
    createdAt: new Date(),
    method: 'library',
    gender: 'female',
    skinTone: '#B07848',
    body: {
      heightCm: 170,
      weightKg: 62,
      chestCm: 88,
      waistCm: 68,
      hipsCm: 94,
      inseamCm: 78,
      shoulderWidthCm: 40,
      armLengthCm: 57,
      neckCircumferenceCm: 31,
      torsoLengthCm: 44,
      bodyType: 'mesomorph',
      muscleDefinition: 55,
    },
    face: { ...defaultFace, faceShape: 'oval', cheekboneHeight: 65 },
    hair: { style: 'ponytail', color: '#1A1A1A', hairline: 'full' },
  },
  {
    id: 'amara',
    name: 'Amara',
    createdAt: new Date(),
    method: 'library',
    gender: 'female',
    skinTone: '#4D3510',
    body: {
      heightCm: 163,
      weightKg: 55,
      chestCm: 84,
      waistCm: 64,
      hipsCm: 90,
      inseamCm: 70,
      shoulderWidthCm: 37,
      armLengthCm: 52,
      neckCircumferenceCm: 30,
      torsoLengthCm: 40,
      bodyType: 'ectomorph',
      muscleDefinition: 35,
    },
    face: { ...defaultFace, faceShape: 'oval', lipFullness: 70, noseWidth: 55 },
    hair: { style: 'braids', color: '#1A1A1A', hairline: 'full' },
  },
  {
    id: 'luna',
    name: 'Luna',
    createdAt: new Date(),
    method: 'library',
    gender: 'female',
    skinTone: '#D09E6C',
    body: {
      heightCm: 168,
      weightKg: 64,
      chestCm: 90,
      waistCm: 70,
      hipsCm: 96,
      inseamCm: 76,
      shoulderWidthCm: 39,
      armLengthCm: 56,
      neckCircumferenceCm: 31,
      torsoLengthCm: 43,
      bodyType: 'mesomorph',
      muscleDefinition: 40,
    },
    face: { ...defaultFace, faceShape: 'round', eyeSize: 55 },
    hair: { style: 'medium', color: '#923E23', hairline: 'full' },
  },
  {
    id: 'priya',
    name: 'Priya',
    createdAt: new Date(),
    method: 'library',
    gender: 'female',
    skinTone: '#986038',
    body: {
      heightCm: 160,
      weightKg: 70,
      chestCm: 96,
      waistCm: 76,
      hipsCm: 104,
      inseamCm: 68,
      shoulderWidthCm: 38,
      armLengthCm: 52,
      neckCircumferenceCm: 32,
      torsoLengthCm: 41,
      bodyType: 'endomorph',
      muscleDefinition: 25,
    },
    face: { ...defaultFace, faceShape: 'oval', eyeSize: 60, lipFullness: 55 },
    hair: { style: 'long', color: '#1A1A1A', hairline: 'full' },
  },
  // Non-Binary Avatars
  {
    id: 'river',
    name: 'River',
    createdAt: new Date(),
    method: 'library',
    gender: 'non-binary',
    skinTone: '#F5DEC4',
    body: {
      heightCm: 173,
      weightKg: 62,
      chestCm: 88,
      waistCm: 72,
      hipsCm: 92,
      inseamCm: 78,
      shoulderWidthCm: 41,
      armLengthCm: 58,
      neckCircumferenceCm: 33,
      torsoLengthCm: 44,
      bodyType: 'ectomorph',
      muscleDefinition: 30,
    },
    face: { ...defaultFace, faceShape: 'oval', jawWidth: 45 },
    hair: { style: 'short', color: '#6B3FA0', hairline: 'full' },
  },
  {
    id: 'sage',
    name: 'Sage',
    createdAt: new Date(),
    method: 'library',
    gender: 'non-binary',
    skinTone: '#C99760',
    body: {
      heightCm: 168,
      weightKg: 66,
      chestCm: 92,
      waistCm: 74,
      hipsCm: 96,
      inseamCm: 74,
      shoulderWidthCm: 40,
      armLengthCm: 56,
      neckCircumferenceCm: 33,
      torsoLengthCm: 43,
      bodyType: 'mesomorph',
      muscleDefinition: 45,
    },
    face: { ...defaultFace, faceShape: 'heart', cheekboneHeight: 55 },
    hair: { style: 'curly', color: '#5D3A1A', hairline: 'full' },
  },
];

// Helper to get avatar by ID
export const getAvatarPreset = (id: string): AvatarConfig | undefined => {
  return AVATAR_PRESETS.find(avatar => avatar.id === id);
};

// Create default avatar config
export const createDefaultAvatarConfig = (gender: 'male' | 'female' | 'non-binary' = 'male'): AvatarConfig => {
  const basePreset = gender === 'female' 
    ? AVATAR_PRESETS.find(a => a.id === 'maya')!
    : gender === 'non-binary'
    ? AVATAR_PRESETS.find(a => a.id === 'river')!
    : AVATAR_PRESETS.find(a => a.id === 'alex')!;
  
  return {
    ...basePreset,
    id: `custom-${Date.now()}`,
    name: 'My Avatar',
    createdAt: new Date(),
    method: 'manual',
  };
};
