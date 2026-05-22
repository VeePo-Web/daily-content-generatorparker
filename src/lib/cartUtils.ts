/**
 * Cart utility functions for consistent ID handling and haptic feedback
 */

// Re-export formatPrice from the centralized currency module
export { formatPrice, formatPriceCents, CURRENCY } from './currency';

/**
 * Converts a product UUID to a stable numeric cart ID.
 * Uses the first 8 characters of the UUID as a hex value.
 */
export function productIdToCartId(productId: string): number {
  const hex = productId.replace(/-/g, '').slice(0, 8);
  return parseInt(hex, 16);
}

/**
 * Triggers haptic feedback on mobile devices (if supported).
 * Uses a short 50ms vibration for add-to-cart actions.
 */
export function triggerHapticFeedback(): void {
  if ('vibrate' in navigator) {
    navigator.vibrate(50);
  }
}

/**
 * Standard size ordering for fallback calculations
 */
export const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'] as const;

/**
 * Finds the nearest available size when the preferred size is out of stock.
 * Searches outward from the preferred size (e.g., if M is OOS, tries L then S, then XL then XS).
 */
export function findNearestSize(preferredSize: string, availableSizes: string[]): string | null {
  if (availableSizes.length === 0) return null;
  if (availableSizes.includes(preferredSize)) return preferredSize;

  const preferredIndex = SIZE_ORDER.indexOf(preferredSize as typeof SIZE_ORDER[number]);
  
  if (preferredIndex === -1) {
    // Size not in standard order, return first available
    return availableSizes[0] || null;
  }

  // Search outward: alternate between larger and smaller sizes
  let offset = 1;
  while (offset <= SIZE_ORDER.length) {
    // Try larger size first
    const largerIndex = preferredIndex + offset;
    if (largerIndex < SIZE_ORDER.length) {
      const largerSize = SIZE_ORDER[largerIndex];
      if (availableSizes.includes(largerSize)) return largerSize;
    }

    // Then try smaller size
    const smallerIndex = preferredIndex - offset;
    if (smallerIndex >= 0) {
      const smallerSize = SIZE_ORDER[smallerIndex];
      if (availableSizes.includes(smallerSize)) return smallerSize;
    }

    offset++;
  }

  // No standard sizes found, return first available
  return availableSizes[0] || null;
}

/**
 * Maps a color name to its CSS hex value for consistent rendering.
 */
export function getColorHex(color: string): string {
  const colorMap: Record<string, string> = {
    black: '#1a1a1a',
    white: '#ffffff',
    navy: '#1e3a5f',
    gray: '#6b7280',
    grey: '#6b7280',
    natural: '#f5f0e6',
    gold: '#d4af37',
    cream: '#f5f5dc',
    sand: '#c2b280',
    olive: '#556b2f',
    burgundy: '#800020',
    charcoal: '#36454f',
    heather: '#b6b6b4',
  };
  
  return colorMap[color.toLowerCase()] || color;
}
