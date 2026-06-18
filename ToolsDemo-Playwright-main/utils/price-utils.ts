/**
 * Parse a currency string from the Toolshop UI into a plain number.
 *
 * Handles formats the app emits:
 *   "$14.15"  →  14.15
 *   "$ 14.15" →  14.15
 *   "$1,299.00" → 1299.00
 *   "14.15"   →  14.15
 */
export function parseCurrency(raw: string): number {
  const clean = raw.replace(/[^0-9.]/g, '');
  const value = parseFloat(clean);
  return isNaN(value) ? 0 : value;
}

/**
 * Round to 2 decimal places to avoid floating-point drift when
 * comparing price × qty against a displayed line total.
 */
export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
