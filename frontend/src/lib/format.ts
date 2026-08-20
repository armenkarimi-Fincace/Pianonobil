/**
 * Presentation helpers, ported verbatim from the original build.
 *
 * These are deliberately unchanged: `money()` in particular decides the exact
 * string on every metric tile, table cell and axis label, and any rounding
 * difference would be visible.
 */

export function money(n: number): string {
  const a = Math.abs(n);
  if (a >= 1e6) return 'USD ' + (n / 1e6).toFixed(2) + 'm';
  if (a >= 1e3) return 'USD ' + Math.round(n / 1e3) + 'k';
  return 'USD ' + Math.round(n);
}

export function sgn(n: number): string {
  return (n >= 0 ? '+' : '') + money(n);
}

export function commas(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}

export function pad(n: number): string {
  return n < 10 ? '0' + n : '' + n;
}

/** HH:MM, used to stamp notices in the register. */
export function stamp(): string {
  const d = new Date();
  const h = d.getHours();
  const m = d.getMinutes();
  return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
}

export const DISRUPTION = ['none', 'low', 'moderate', 'high', 'severe'] as const;
