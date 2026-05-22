/**
 * Centralized currency configuration for Line of Judah
 * All pricing display must use these utilities for consistency
 */

export const CURRENCY = {
  /** ISO 4217 currency code */
  code: 'CAD' as const,
  /** Display symbol */
  symbol: '$',
  /** Locale for formatting */
  locale: 'en-CA',
  /** Free shipping threshold in dollars */
  freeShippingThreshold: 99,
  /** Express shipping cost */
  expressShippingCost: 15,
  /** Overnight shipping cost */
  overnightShippingCost: 35,
  /** Standard shipping cost (under threshold) */
  standardShippingCost: 10,
};

/**
 * Formats a numeric price as a CAD currency string
 * @param price - Price in dollars (not cents)
 * @returns Formatted string like "$69.99"
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat(CURRENCY.locale, {
    style: 'currency',
    currency: CURRENCY.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Formats a price from cents to CAD string
 * @param cents - Price in cents
 * @returns Formatted string like "$69.99"
 */
export function formatPriceCents(cents: number): string {
  return formatPrice(cents / 100);
}

/**
 * Formats a price without the currency symbol (just the number)
 * @param price - Price in dollars
 * @returns Formatted string like "69.99"
 */
export function formatPriceNumeric(price: number): string {
  return price.toFixed(2);
}

/**
 * Formats a price as a simple display string (with $ symbol, no locale formatting)
 * @param price - Price in dollars
 * @returns Formatted string like "$69.99"
 */
export function formatPriceSimple(price: number): string {
  return `$${price.toFixed(2)}`;
}
