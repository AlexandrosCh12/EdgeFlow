/**
 * streakLogic.ts
 * Calendar streak from today backward: counts days with qualifying activity,
 * favoring consistency over how many trades you placed.
 */

import type { TradeEntry } from '../types';
import { getDateKey, subtractDays } from '../utils/dateUtils';

/**
 * computeStreak
 * A streak day counts if that calendar day has at least one entry that either
 * completed reflection or is tagged Disciplined. Walks backward from today;
 * breaks on first day with no qualifying marker. Rewards showing up and closing
 * the loop, not raw trade count.
 */
export function computeStreak(entries: TradeEntry[]): number {
  const qualifyingDays = new Set(
    entries
      .filter(
        (entry) =>
          entry.reflectionCompleted === true ||
          entry.disciplineType === 'Disciplined',
      )
      .map((entry) => getDateKey(new Date(entry.createdAt))),
  );

  let streak = 0;
  let offset = 0;

  while (true) {
    const dateKey = getDateKey(subtractDays(new Date(), offset));
    if (!qualifyingDays.has(dateKey)) {
      break;
    }

    streak += 1;
    offset += 1;
  }

  return streak;
}
