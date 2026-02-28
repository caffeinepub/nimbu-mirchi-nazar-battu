/**
 * Returns the next Saturday date from today.
 * If today is Saturday, returns the NEXT Saturday (not today).
 */
export function getNextSaturday(fromDate: Date = new Date()): Date {
  const date = new Date(fromDate);
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  const daysUntilSaturday = dayOfWeek === 6 ? 7 : 6 - dayOfWeek;
  date.setDate(date.getDate() + daysUntilSaturday);
  date.setHours(10, 0, 0, 0); // 10 AM delivery
  return date;
}

/**
 * Returns next 4 Saturdays from today as Date array.
 */
export function getNext4Saturdays(fromDate: Date = new Date()): Date[] {
  const dates: Date[] = [];
  let nextSat = getNextSaturday(fromDate);

  for (let i = 0; i < 4; i++) {
    dates.push(new Date(nextSat));
    nextSat = new Date(nextSat);
    nextSat.setDate(nextSat.getDate() + 7);
  }
  return dates;
}

/**
 * Format a Date to readable Indian style.
 * e.g. "Sat, 15 Feb 2025"
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Convert a BigInt timestamp to a Date.
 */
export function bigIntToDate(timestamp: bigint): Date {
  return new Date(Number(timestamp));
}

/**
 * Format a BigInt timestamp to readable string.
 */
export function formatTimestamp(timestamp: bigint): string {
  return formatDate(bigIntToDate(timestamp));
}
