// Size recommendation engine based on body measurements

import { BodyMeasurements } from './measurementToProportions';

export interface SizeChart {
  [size: string]: {
    chestMin: number;
    chestMax: number;
    waistMin: number;
    waistMax: number;
    hipsMin: number;
    hipsMax: number;
  };
}

// Standard unisex size chart (in cm)
export const standardSizeChart: SizeChart = {
  XS: { chestMin: 78, chestMax: 86, waistMin: 60, waistMax: 68, hipsMin: 82, hipsMax: 90 },
  S: { chestMin: 86, chestMax: 94, waistMin: 68, waistMax: 76, hipsMin: 90, hipsMax: 98 },
  M: { chestMin: 94, chestMax: 102, waistMin: 76, waistMax: 84, hipsMin: 98, hipsMax: 106 },
  L: { chestMin: 102, chestMax: 110, waistMin: 84, waistMax: 92, hipsMin: 106, hipsMax: 114 },
  XL: { chestMin: 110, chestMax: 118, waistMin: 92, waistMax: 100, hipsMin: 114, hipsMax: 122 },
  '2XL': { chestMin: 118, chestMax: 126, waistMin: 100, waistMax: 108, hipsMin: 122, hipsMax: 130 },
  '3XL': { chestMin: 126, chestMax: 134, waistMin: 108, waistMax: 116, hipsMin: 130, hipsMax: 138 },
};

export interface SizeFit {
  dimension: 'chest' | 'waist' | 'hips';
  status: 'tight' | 'perfect' | 'loose' | 'too-small' | 'too-large';
  difference: number; // negative = too small, positive = room to spare
}

export interface SizeRecommendation {
  recommendedSize: string;
  confidence: number; // 0-100
  fits: SizeFit[];
  alternativeSize?: string;
  alternativeReason?: string;
  fitType: 'slim' | 'regular' | 'relaxed';
}

// Calculate how well a measurement fits a size range
const calculateFit = (
  value: number, 
  min: number, 
  max: number
): { status: SizeFit['status']; difference: number; score: number } => {
  const mid = (min + max) / 2;
  const range = max - min;
  
  if (value < min - 4) {
    return { status: 'too-small', difference: value - min, score: 0 };
  }
  if (value < min) {
    return { status: 'tight', difference: value - min, score: 30 + ((value - (min - 4)) / 4) * 40 };
  }
  if (value <= max) {
    // Perfect fit - higher score closer to center
    const distFromCenter = Math.abs(value - mid);
    const score = 100 - (distFromCenter / (range / 2)) * 20;
    return { status: 'perfect', difference: max - value, score };
  }
  if (value <= max + 4) {
    return { status: 'loose', difference: value - max, score: 70 - ((value - max) / 4) * 30 };
  }
  return { status: 'too-large', difference: value - max, score: 0 };
};

// Main size recommendation function
export const recommendSize = (
  measurements: BodyMeasurements,
  sizeChart: SizeChart = standardSizeChart,
  preferredFit: 'slim' | 'regular' | 'relaxed' = 'regular'
): SizeRecommendation => {
  const { chestCm, waistCm, hipsCm } = measurements;
  
  // Apply fit preference adjustments
  const fitAdjustment = preferredFit === 'slim' ? -2 : preferredFit === 'relaxed' ? 2 : 0;
  const adjustedChest = chestCm - fitAdjustment;
  const adjustedWaist = waistCm - fitAdjustment;
  const adjustedHips = hipsCm - fitAdjustment;
  
  const sizes = Object.keys(sizeChart);
  let bestSize = 'M';
  let bestScore = 0;
  let bestFits: SizeFit[] = [];
  
  for (const size of sizes) {
    const chart = sizeChart[size];
    
    const chestFit = calculateFit(adjustedChest, chart.chestMin, chart.chestMax);
    const waistFit = calculateFit(adjustedWaist, chart.waistMin, chart.waistMax);
    const hipsFit = calculateFit(adjustedHips, chart.hipsMin, chart.hipsMax);
    
    // Weighted average (chest matters most for tops)
    const avgScore = (chestFit.score * 0.45) + (waistFit.score * 0.25) + (hipsFit.score * 0.30);
    
    if (avgScore > bestScore) {
      bestScore = avgScore;
      bestSize = size;
      bestFits = [
        { dimension: 'chest', status: chestFit.status, difference: chestFit.difference },
        { dimension: 'waist', status: waistFit.status, difference: waistFit.difference },
        { dimension: 'hips', status: hipsFit.status, difference: hipsFit.difference },
      ];
    }
  }
  
  // Determine alternative size
  let alternativeSize: string | undefined;
  let alternativeReason: string | undefined;
  
  const sizeIndex = sizes.indexOf(bestSize);
  const hasLargerSize = sizeIndex < sizes.length - 1;
  const hasSmallerSize = sizeIndex > 0;
  
  const tightFits = bestFits.filter(f => f.status === 'tight').length;
  const looseFits = bestFits.filter(f => f.status === 'loose').length;
  
  if (tightFits > 0 && hasLargerSize && preferredFit !== 'slim') {
    alternativeSize = sizes[sizeIndex + 1];
    alternativeReason = 'For a more relaxed fit';
  } else if (looseFits > 1 && hasSmallerSize && preferredFit !== 'relaxed') {
    alternativeSize = sizes[sizeIndex - 1];
    alternativeReason = 'For a slimmer fit';
  }
  
  // Convert score to confidence percentage
  const confidence = Math.round(Math.min(98, Math.max(50, bestScore)));
  
  return {
    recommendedSize: bestSize,
    confidence,
    fits: bestFits,
    alternativeSize,
    alternativeReason,
    fitType: preferredFit,
  };
};

// Get fit status icon and color
export const getFitStatusInfo = (status: SizeFit['status']): { icon: string; color: string; text: string } => {
  switch (status) {
    case 'perfect':
      return { icon: '✓', color: 'text-green-600', text: 'Perfect fit' };
    case 'tight':
      return { icon: '△', color: 'text-amber-500', text: 'Snug fit' };
    case 'loose':
      return { icon: '○', color: 'text-blue-500', text: 'Relaxed fit' };
    case 'too-small':
      return { icon: '✕', color: 'text-red-500', text: 'Too small' };
    case 'too-large':
      return { icon: '✕', color: 'text-red-500', text: 'Too large' };
    default:
      return { icon: '?', color: 'text-muted-foreground', text: 'Unknown' };
  }
};
