// Convert real-world body measurements to 3D mannequin proportions
// SINGLE SOURCE OF TRUTH for all proportion calculations

import * as THREE from 'three';

export interface BodyMeasurements {
  heightCm: number;
  weightKg: number;
  chestCm: number;
  waistCm: number;
  hipsCm: number;
  inseamCm: number;
}

export interface MannequinProportions {
  shoulderWidth: number;
  chestDepth: number;
  waistWidth: number;
  hipWidth: number;
  armThickness: number;
  legThickness: number;
  height: number;
  armLength: number;
  legLength: number;
}

// ============================================
// 8-HEAD FASHION SCALE CONSTANTS
// ============================================
// Industry-standard mannequin proportions
// Total height divided into 8 equal "head" units
// Reference: 1.75m mannequin = 0.21875m per head unit

export const EIGHT_HEAD_SCALE = {
  // Base reference height
  referenceHeight: 1.75,  // meters
  headUnit: 0.21875,      // 1.75 / 8 = 0.21875m per head
  
  // Y-Coordinate breakdown (from ground up)
  ground: 0.00,
  ankleTop: 0.08,         // ~0.5 heads
  kneeCenter: 0.438,      // 2 heads from ground
  crotchLine: 0.875,      // 4 heads - LEGS ARE 50% OF HEIGHT
  waistLine: 1.09,        // 5 heads
  chestLine: 1.31,        // 6 heads
  shoulderLine: 1.42,     // 6.5 heads
  neckBase: 1.48,         // ~6.75 heads
  headBottom: 1.53,       // 7 heads
  headTop: 1.75,          // 8 heads
  
  // Proportional ratios
  legRatio: 0.50,         // Legs = 50% of total height
  torsoRatio: 0.30,       // Torso = 30% of total height
  headRatio: 0.125,       // Head = 12.5% of total height
};

// ============================================
// ANTHROPOMETRIC DATA (Gender-specific)
// ============================================
// Based on CDC/WHO anthropometric studies

export const ANTHROPOMETRIC_DATA = {
  male: {
    referenceHeight: 175.3,  // cm
    shoulderWidth: 45.0,     // cm - biacromial
    chestCirc: 100.0,        // cm
    waistCirc: 86.0,         // cm
    hipCirc: 100.0,          // cm
    inseam: 80.0,            // cm
    armLength: 60.0,         // cm
    // Ratios
    shoulderToHeight: 0.257,
    waistToHip: 0.86,
  },
  female: {
    referenceHeight: 161.3,  // cm
    shoulderWidth: 36.5,     // cm - biacromial
    chestCirc: 92.0,         // cm
    waistCirc: 73.0,         // cm
    hipCirc: 102.0,          // cm
    inseam: 74.0,            // cm
    armLength: 55.0,         // cm
    // Ratios
    shoulderToHeight: 0.226,
    waistToHip: 0.715,
  },
};

// Default measurements for reference (average adult)
export const defaultMeasurements: BodyMeasurements = {
  heightCm: 170,
  weightKg: 70,
  chestCm: 96,
  waistCm: 82,
  hipsCm: 98,
  inseamCm: 76,
};

// Measurement ranges for sliders
export const measurementRanges = {
  height: { min: 140, max: 210, step: 1, unit: 'cm' },
  weight: { min: 40, max: 150, step: 1, unit: 'kg' },
  chest: { min: 70, max: 140, step: 1, unit: 'cm' },
  waist: { min: 55, max: 130, step: 1, unit: 'cm' },
  hips: { min: 70, max: 140, step: 1, unit: 'cm' },
  inseam: { min: 60, max: 95, step: 1, unit: 'cm' },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Map value from one range to another
export const mapRange = (value: number, inMin: number, inMax: number, outMin: number, outMax: number): number => {
  const clamped = Math.max(inMin, Math.min(inMax, value));
  return outMin + ((clamped - inMin) / (inMax - inMin)) * (outMax - outMin);
};

// Calculate BMI for body thickness adjustments
const calculateBMI = (heightCm: number, weightKg: number): number => {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
};

// ============================================
// BODY TYPE PRESETS
// ============================================

export type BodyType = 'slim' | 'athletic' | 'average' | 'curvy';

const BODY_TYPE_PRESETS: Record<BodyType, {
  shoulderWidth: number;
  chestDepth: number;
  waistWidth: number;
  hipWidth: number;
  armThickness: number;
  legThickness: number;
}> = {
  slim: { 
    shoulderWidth: 0.38, 
    chestDepth: 0.18, 
    waistWidth: 0.28, 
    hipWidth: 0.34, 
    armThickness: 0.045, 
    legThickness: 0.07 
  },
  athletic: { 
    shoulderWidth: 0.44, 
    chestDepth: 0.22, 
    waistWidth: 0.30, 
    hipWidth: 0.36, 
    armThickness: 0.055, 
    legThickness: 0.085 
  },
  average: { 
    shoulderWidth: 0.40, 
    chestDepth: 0.20, 
    waistWidth: 0.32, 
    hipWidth: 0.38, 
    armThickness: 0.05, 
    legThickness: 0.08 
  },
  curvy: { 
    shoulderWidth: 0.38, 
    chestDepth: 0.22, 
    waistWidth: 0.34, 
    hipWidth: 0.44, 
    armThickness: 0.055, 
    legThickness: 0.09 
  },
};

// Gender-specific modifiers based on anthropometric data
const GENDER_MODIFIERS = {
  male: {
    shoulderMod: 1.0,      // Reference (male shoulders baseline)
    hipMod: 1.0,           // Reference (male hips baseline)
    chestMod: 1.0,
    waistMod: 1.0,
    baseHeight: 1.75,      // Reference mannequin height
  },
  female: {
    shoulderMod: 0.81,     // 36.5/45 = 0.81 (from anthropometric data)
    hipMod: 1.02,          // 102/100 = 1.02 (wider hips)
    chestMod: 0.92,        // 92/100 = 0.92
    waistMod: 0.85,        // 73/86 = 0.85 (narrower waist)
    baseHeight: 1.61,      // Female average
  },
};

// ============================================
// MAIN PROPORTION FUNCTIONS
// ============================================

/**
 * Get proportions from body type preset + gender
 * Used when useDetailedMeasurements = false
 */
export const getPresetProportions = (
  bodyType: BodyType,
  gender: 'male' | 'female'
): MannequinProportions => {
  const base = BODY_TYPE_PRESETS[bodyType];
  const mods = GENDER_MODIFIERS[gender];
  
  // Apply 8-head scale for leg/arm proportions
  const baseHeight = mods.baseHeight;
  const legLength = baseHeight * EIGHT_HEAD_SCALE.legRatio; // 50% of height
  const armLength = baseHeight * 0.34; // ~34% of height
  
  return {
    shoulderWidth: base.shoulderWidth * mods.shoulderMod,
    chestDepth: base.chestDepth * mods.chestMod,
    waistWidth: base.waistWidth * mods.waistMod,
    hipWidth: base.hipWidth * mods.hipMod,
    armThickness: base.armThickness * (gender === 'male' ? 1.0 : 0.85),
    legThickness: base.legThickness * (gender === 'male' ? 1.0 : 0.92),
    height: baseHeight,
    armLength,
    legLength,
  };
};

/**
 * Get proportions from actual measurements
 * Used when useDetailedMeasurements = true
 * This is the main function that converts real measurements to 3D proportions
 */
export const measurementToProportions = (
  measurements: BodyMeasurements,
  gender: 'male' | 'female'
): MannequinProportions => {
  const { heightCm, weightKg, chestCm, waistCm, hipsCm, inseamCm } = measurements;
  
  // Calculate derived values
  const bmi = calculateBMI(heightCm, weightKg);
  const anthro = ANTHROPOMETRIC_DATA[gender];
  
  // Height scaling (reference is 1.75m for male, 1.61m for female)
  const heightScale = heightCm / anthro.referenceHeight;
  const height = EIGHT_HEAD_SCALE.referenceHeight * heightScale;
  
  // BMI affects limb/torso thickness (18.5-35 range)
  const bmiThicknessFactor = mapRange(bmi, 18.5, 32, 0.85, 1.25);
  
  // === TORSO PROPORTIONS FROM MEASUREMENTS ===
  
  // Shoulder width: derived from chest, scaled by gender
  // Using sqrt for proportional width scaling (not linear)
  const shoulderWidthBase = mapRange(chestCm, 80, 130, 0.36, 0.52);
  const shoulderWidth = shoulderWidthBase * (gender === 'male' ? 1.0 : 0.81);
  
  // Chest depth (front-to-back): from chest circumference + BMI
  const chestDepth = mapRange(chestCm, 80, 130, 0.16, 0.26) * bmiThicknessFactor;
  
  // Waist width: from waist measurement
  const waistWidth = mapRange(waistCm, 60, 120, 0.24, 0.42);
  
  // Hip width: gender-specific adjustments
  let hipWidth = mapRange(hipsCm, 80, 130, 0.32, 0.50);
  if (gender === 'female') {
    hipWidth *= 1.02; // Women typically 2% wider at hips relative to measurements
  }
  
  // === LIMB PROPORTIONS ===
  
  // Arm thickness based on BMI and gender
  const armThickness = 0.048 * bmiThicknessFactor * (gender === 'male' ? 1.0 : 0.85);
  
  // Leg thickness based on BMI and gender  
  const legThickness = 0.075 * bmiThicknessFactor * (gender === 'male' ? 1.0 : 0.92);
  
  // === LIMB LENGTHS (Using 8-head scale) ===
  
  // Arm length: ~34% of height for men, ~32% for women
  const armLengthRatio = gender === 'male' ? 0.34 : 0.32;
  const armLength = height * armLengthRatio;
  
  // Leg length: use inseam measurement, scaled
  // Inseam directly measures leg length from crotch to floor
  const legLengthFromInseam = (inseamCm / 100) * heightScale;
  // Ensure legs are at least 46% and at most 52% of total height
  const legLength = Math.min(
    Math.max(legLengthFromInseam, height * 0.46),
    height * 0.52
  );
  
  return {
    shoulderWidth,
    chestDepth,
    waistWidth,
    hipWidth,
    armThickness,
    legThickness,
    height,
    armLength,
    legLength,
  };
};

/**
 * UNIFIED proportion getter
 * Single entry point for all proportion calculations
 */
export const getBodyProportions = (
  bodyType: BodyType,
  gender: 'male' | 'female',
  measurements: BodyMeasurements,
  useDetailedMeasurements: boolean
): MannequinProportions => {
  if (useDetailedMeasurements) {
    return measurementToProportions(measurements, gender);
  }
  return getPresetProportions(bodyType, gender);
};

// ============================================
// QUICK PRESETS (for UI)
// ============================================

export const quickPresets: Record<string, { label: string; measurements: BodyMeasurements }> = {
  petite: {
    label: "Petite (5'2\")",
    measurements: { heightCm: 157, weightKg: 52, chestCm: 84, waistCm: 66, hipsCm: 90, inseamCm: 68 },
  },
  small: {
    label: "Small (5'5\")",
    measurements: { heightCm: 165, weightKg: 58, chestCm: 88, waistCm: 70, hipsCm: 94, inseamCm: 72 },
  },
  average: {
    label: "Average (5'8\")",
    measurements: { heightCm: 173, weightKg: 70, chestCm: 96, waistCm: 80, hipsCm: 100, inseamCm: 78 },
  },
  tall: {
    label: "Tall (6'0\")",
    measurements: { heightCm: 183, weightKg: 80, chestCm: 102, waistCm: 86, hipsCm: 104, inseamCm: 84 },
  },
  extraTall: {
    label: "Extra Tall (6'3\")",
    measurements: { heightCm: 191, weightKg: 88, chestCm: 108, waistCm: 92, hipsCm: 108, inseamCm: 88 },
  },
};

// ============================================
// UNIT CONVERSION UTILITIES
// ============================================

export const cmToInches = (cm: number): number => cm / 2.54;
export const inchesToCm = (inches: number): number => inches * 2.54;
export const kgToLbs = (kg: number): number => kg * 2.20462;
export const lbsToKg = (lbs: number): number => lbs / 2.20462;

export const formatHeight = (cm: number, unit: 'metric' | 'imperial'): string => {
  if (unit === 'metric') return `${cm} cm`;
  const totalInches = cmToInches(cm);
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}'${inches}"`;
};

export const formatWeight = (kg: number, unit: 'metric' | 'imperial'): string => {
  if (unit === 'metric') return `${kg} kg`;
  return `${Math.round(kgToLbs(kg))} lbs`;
};

export const formatMeasurement = (cm: number, unit: 'metric' | 'imperial'): string => {
  if (unit === 'metric') return `${cm} cm`;
  return `${Math.round(cmToInches(cm) * 10) / 10}"`;
};

// ============================================
// GEOMETRY HELPERS FOR 8-HEAD SCALE
// ============================================

/**
 * Calculate Y-position for body segments based on 8-head scale
 * Returns positions scaled to the given height
 */
export const getScaledBodyPositions = (height: number) => {
  const scale = height / EIGHT_HEAD_SCALE.referenceHeight;
  
  return {
    ground: 0,
    ankleTop: EIGHT_HEAD_SCALE.ankleTop * scale,
    kneeCenter: EIGHT_HEAD_SCALE.kneeCenter * scale,
    crotchLine: EIGHT_HEAD_SCALE.crotchLine * scale,
    waistLine: EIGHT_HEAD_SCALE.waistLine * scale,
    chestLine: EIGHT_HEAD_SCALE.chestLine * scale,
    shoulderLine: EIGHT_HEAD_SCALE.shoulderLine * scale,
    neckBase: EIGHT_HEAD_SCALE.neckBase * scale,
    headBottom: EIGHT_HEAD_SCALE.headBottom * scale,
    headTop: height,
  };
};
