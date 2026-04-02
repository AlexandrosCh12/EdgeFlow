/**
 * quoteLogic.ts
 * Daily motivational quote: same calendar date always picks the same line
 * (no Math.random — stable across reloads and tests).
 */

import { getDateKey } from '../utils/dateUtils';

const QUOTES = [
  'Your edge is patience, not speed.',
  'A missed trade is better than an emotional trade.',
  'Protect your process before you protect your profits.',
  'Your rules are the only edge that compounds.',
  'Discipline is the bridge between your plan and your results.',
  'The market rewards consistency, not brilliance.',
  'Every impulsive trade is a vote against your future self.',
  'Slow down. The best trades wait for you.',
  'Your journal is your most honest trading partner.',
  'Control what you can: your process, not the outcome.',
];

/**
 * getQuoteIndexForDate
 * Uses today’s date string (YYYY-MM-DD), sums Unicode char codes, then
 * modulo quote count so the index is deterministic per day.
 */
export function getQuoteIndexForDate(): number {
  const dateString = getDateKey(new Date());
  const total = [...dateString].reduce(
    (sum, char) => sum + char.charCodeAt(0), // hash-like sum of the date string
    0,
  );

  return total % QUOTES.length;
}

export function getDailyQuote(): string {
  return QUOTES[getQuoteIndexForDate()];
}

export { QUOTES };
