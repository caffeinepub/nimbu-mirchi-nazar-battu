/**
 * Format paise (1/100 of rupee) to readable ₹XX.XX string.
 * @param paise - amount in paise (BigInt or number)
 */
export function formatPrice(paise: bigint | number): string {
  const amount = typeof paise === "bigint" ? Number(paise) : paise;
  return `₹${(amount / 100).toFixed(0)}`; // Show whole rupees for cleaner display
}

/**
 * Format paise to rupees with decimals.
 */
export function formatPriceDetailed(paise: bigint | number): string {
  const amount = typeof paise === "bigint" ? Number(paise) : paise;
  return `₹${(amount / 100).toFixed(2)}`;
}

/**
 * Convert rupees (as number) to paise (BigInt).
 */
export function rupeesToPaise(rupees: number): bigint {
  return BigInt(Math.round(rupees * 100));
}

/**
 * Format a large number to readable form (e.g., 1,23,456).
 * Uses Indian numbering system.
 */
export function formatIndianNumber(num: bigint | number): string {
  const n = typeof num === "bigint" ? Number(num) : num;
  return n.toLocaleString("en-IN");
}

/**
 * Shorten a principal ID for display.
 */
export function shortenPrincipal(principal: string): string {
  if (!principal || principal.length < 10) return principal;
  return `${principal.slice(0, 6)}...${principal.slice(-4)}`;
}
