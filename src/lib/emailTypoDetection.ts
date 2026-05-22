/**
 * Email Typo Detection Utility
 * 
 * Detects common email typos and suggests corrections using:
 * - Levenshtein distance for domain name matching
 * - TLD typo corrections
 * - Keyboard adjacency error fixes
 * - Double letter corrections
 */

// Common email domains to check against
const COMMON_DOMAINS = [
  // Global giants
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'aol.com',
  'protonmail.com',
  'mail.com',
  
  // Regional (Europe)
  'gmx.com',
  'gmx.de',
  'web.de',
  'orange.fr',
  'free.fr',
  
  // Business
  'live.com',
  'msn.com',
  
  // Country-specific
  'yahoo.co.uk',
  'outlook.co.uk',
  'btinternet.com',
  'googlemail.com',
];

// Common TLD typos
const TLD_TYPOS: Record<string, string> = {
  '.con': '.com',
  '.cmo': '.com',
  '.vom': '.com',
  '.ocm': '.com',
  '.com.': '.com',
  '.ney': '.net',
  '.met': '.net',
  '.ogr': '.org',
  '.prg': '.org',
  '.oi': '.io',
  '.co.ik': '.co.uk',
};

// Keyboard adjacency replacements (common mistypes)
const KEYBOARD_FIXES: Record<string, string> = {
  ';': '.',
  ',': '.',
  "'": '.',
};

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Fix keyboard adjacency errors in domain
 */
function fixKeyboardErrors(domain: string): string {
  let fixed = domain;
  for (const [typo, correct] of Object.entries(KEYBOARD_FIXES)) {
    fixed = fixed.replace(typo, correct);
  }
  return fixed;
}

/**
 * Fix TLD typos
 */
function fixTldTypo(domain: string): string | null {
  for (const [typo, correct] of Object.entries(TLD_TYPOS)) {
    if (domain.endsWith(typo)) {
      return domain.slice(0, -typo.length) + correct;
    }
  }
  return null;
}

/**
 * Remove duplicate consecutive letters (yahooo → yahoo)
 */
function fixDoubleLetters(domain: string): string {
  // Match patterns like "ooo" or "lll" and reduce to double max
  return domain.replace(/(.)\1{2,}/g, '$1$1');
}

/**
 * Find closest matching common domain
 */
function findClosestDomain(domain: string, threshold: number = 2): string | null {
  let closestDomain: string | null = null;
  let closestDistance = threshold + 1;

  for (const commonDomain of COMMON_DOMAINS) {
    const distance = levenshteinDistance(domain.toLowerCase(), commonDomain);
    if (distance > 0 && distance <= threshold && distance < closestDistance) {
      closestDistance = distance;
      closestDomain = commonDomain;
    }
  }

  return closestDomain;
}

export interface EmailTypoResult {
  hasTypo: boolean;
  suggestion: string | null;
  originalEmail: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Detect typos in an email address and suggest corrections
 */
export function detectEmailTypo(email: string): EmailTypoResult {
  const trimmedEmail = email.trim().toLowerCase();
  
  // Basic email format check
  const atIndex = trimmedEmail.lastIndexOf('@');
  if (atIndex === -1 || atIndex === 0 || atIndex === trimmedEmail.length - 1) {
    return { hasTypo: false, suggestion: null, originalEmail: email, confidence: 'low' };
  }

  const localPart = trimmedEmail.slice(0, atIndex);
  let domain = trimmedEmail.slice(atIndex + 1);

  // Skip if domain is already in common domains (no typo)
  if (COMMON_DOMAINS.includes(domain)) {
    return { hasTypo: false, suggestion: null, originalEmail: email, confidence: 'high' };
  }

  let correctedDomain = domain;
  let confidence: 'high' | 'medium' | 'low' = 'low';

  // Step 1: Fix keyboard adjacency errors (e.g., gmail;com → gmail.com)
  const keyboardFixed = fixKeyboardErrors(domain);
  if (keyboardFixed !== domain) {
    correctedDomain = keyboardFixed;
    confidence = 'high';
  }

  // Step 2: Fix TLD typos (e.g., .con → .com)
  const tldFixed = fixTldTypo(correctedDomain);
  if (tldFixed) {
    correctedDomain = tldFixed;
    confidence = 'high';
  }

  // Step 3: Fix double letters (e.g., yahooo.com → yahoo.com)
  const doubleFixed = fixDoubleLetters(correctedDomain);
  if (doubleFixed !== correctedDomain) {
    correctedDomain = doubleFixed;
    confidence = 'medium';
  }

  // Step 4: Check against common domains using Levenshtein distance
  const closestDomain = findClosestDomain(correctedDomain, 2);
  if (closestDomain && closestDomain !== correctedDomain) {
    correctedDomain = closestDomain;
    confidence = 'medium';
  }

  // If we found a correction
  if (correctedDomain !== domain && COMMON_DOMAINS.includes(correctedDomain)) {
    const suggestion = `${localPart}@${correctedDomain}`;
    return {
      hasTypo: true,
      suggestion,
      originalEmail: email,
      confidence,
    };
  }

  // Special case: partial TLD (gmail.co → gmail.com)
  if (domain.match(/\.(co|c|cm|om)$/)) {
    const domainWithoutTld = domain.replace(/\.(co|c|cm|om)$/, '');
    for (const commonDomain of COMMON_DOMAINS) {
      const commonDomainWithoutTld = commonDomain.replace(/\.[a-z]{2,3}(\.[a-z]{2})?$/, '');
      if (domainWithoutTld === commonDomainWithoutTld) {
        const suggestion = `${localPart}@${commonDomain}`;
        return {
          hasTypo: true,
          suggestion,
          originalEmail: email,
          confidence: 'high',
        };
      }
    }
  }

  return { hasTypo: false, suggestion: null, originalEmail: email, confidence: 'low' };
}

/**
 * Quick check if email might have a typo (for performance optimization)
 */
export function mightHaveTypo(email: string): boolean {
  const trimmedEmail = email.trim().toLowerCase();
  const atIndex = trimmedEmail.lastIndexOf('@');
  
  if (atIndex === -1) return false;
  
  const domain = trimmedEmail.slice(atIndex + 1);
  
  // Already a known domain
  if (COMMON_DOMAINS.includes(domain)) return false;
  
  // Has keyboard adjacency errors
  for (const typo of Object.keys(KEYBOARD_FIXES)) {
    if (domain.includes(typo)) return true;
  }
  
  // Has TLD typo
  for (const typo of Object.keys(TLD_TYPOS)) {
    if (domain.endsWith(typo)) return true;
  }
  
  // Has triple letters
  if (/(.)\1{2,}/.test(domain)) return true;
  
  // Looks similar to common domain (quick heuristic)
  for (const commonDomain of COMMON_DOMAINS) {
    const commonDomainName = commonDomain.split('.')[0];
    const domainName = domain.split('.')[0];
    if (Math.abs(domainName.length - commonDomainName.length) <= 2) {
      return true;
    }
  }
  
  return false;
}
