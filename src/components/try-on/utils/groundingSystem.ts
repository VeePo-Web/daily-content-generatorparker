/**
 * Grounding System for Try-On Room
 * 
 * Ensures avatar feet always touch the floor at Y=0 regardless of height.
 * This is the SINGLE SOURCE OF TRUTH for ground contact calculations.
 */

import { EIGHT_HEAD_SCALE, MannequinProportions } from './measurementToProportions';

// Foot geometry constants
const FOOT_GEOMETRY = {
  depth: 0.05,          // How far below ankle the foot extends
  ankleRatio: 0.94,     // Leg ends at 94% of leg length (ankle starts here)
  soleThickness: 0.015, // Thickness of foot sole at ground contact
};

/**
 * Calculate the Y-offset needed to ground the avatar at Y=0
 * 
 * The avatar is built around the 8-head scale where:
 * - crotchLine is at 0.875m (for 1.75m reference height)
 * - Legs extend downward from crotch
 * - Feet need to touch exactly Y=0
 * 
 * @param proportions - Current mannequin proportions
 * @returns Y-offset to apply to the avatar group
 */
export const calculateGroundingOffset = (proportions: MannequinProportions): number => {
  const { height, legLength } = proportions;
  
  // Scale factor relative to reference mannequin
  const scale = height / EIGHT_HEAD_SCALE.referenceHeight;
  
  // Crotch position in world space (scaled from reference)
  const crotchY = EIGHT_HEAD_SCALE.crotchLine * scale;
  
  // Ankle position: leg extends 94% of legLength below crotch
  const ankleY = crotchY - (legLength * FOOT_GEOMETRY.ankleRatio);
  
  // Foot bottom: ankle minus foot depth minus sole thickness
  const footBottomY = ankleY - FOOT_GEOMETRY.depth - FOOT_GEOMETRY.soleThickness;
  
  // Return the offset needed to bring foot bottom to Y=0
  // If footBottomY is -0.05, we need to move up by 0.05
  return -footBottomY;
};

/**
 * Get proper Y position for the avatar group to ensure grounding
 * Takes into account both the grounding offset and any height scaling
 * 
 * @param proportions - Current mannequin proportions
 * @param basePosition - Optional base Y position (default 0)
 * @returns Final Y position for the avatar group
 */
export const getGroundedPosition = (
  proportions: MannequinProportions,
  basePosition: number = 0
): number => {
  const groundOffset = calculateGroundingOffset(proportions);
  return basePosition + groundOffset;
};

/**
 * Calculate height scale for overall avatar sizing
 * This is used for uniform scaling of the avatar mesh
 * 
 * @param proportions - Current mannequin proportions
 * @returns Scale factor relative to reference height
 */
export const getHeightScale = (proportions: MannequinProportions): number => {
  return proportions.height / EIGHT_HEAD_SCALE.referenceHeight;
};

/**
 * Get the exact Y position where the foot sole contacts the ground
 * Useful for positioning shadows, reflections, etc.
 * 
 * @param proportions - Current mannequin proportions
 * @returns Y position of ground contact (should be 0 after grounding)
 */
export const getGroundContactY = (proportions: MannequinProportions): number => {
  return 0; // After applying grounding offset, contact is always at Y=0
};

/**
 * Calculate ankle position in local space (relative to leg group)
 * Used for foot placement
 */
export const getAnkleLocalY = (legLength: number): number => {
  return -(legLength * FOOT_GEOMETRY.ankleRatio);
};

/**
 * Calculate foot position offset from ankle
 * Returns offset that places foot sole at ground level
 */
export const getFootOffset = (): { y: number; z: number } => {
  return {
    y: -FOOT_GEOMETRY.depth,
    z: 0.04, // Foot extends forward from ankle
  };
};

// Export constants for use in other components
export { FOOT_GEOMETRY };
