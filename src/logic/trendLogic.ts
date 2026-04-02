/**
 * trendLogic.ts
 * Seven-day discipline trend: per-day scores, recent series, and up/down/flat summary.
 */

import type { TradeEntry } from '../types';
import { computeDisciplineScore } from './scoreLogic';
import { isSameCalendarDay, subtractDays } from '../utils/dateUtils';

/**
 * getDailyDisciplineScore
 * Discipline score for a single calendar day using only entries from that day.
 */
export function getDailyDisciplineScore(
  entries: TradeEntry[],
  date: Date,
): number {
  const dayEntries = entries.filter((entry) =>
    isSameCalendarDay(new Date(entry.createdAt), date),
  );

  return computeDisciplineScore(dayEntries);
}

/**
 * getRecentTrendSeries
 * Last `days` calendar days (default 7): each day’s discipline score, or 0 if no trades.
 */
export function getRecentTrendSeries(
  entries: TradeEntry[],
  days: number = 7,
): number[] {
  const series: number[] = [];

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = subtractDays(new Date(), index);
    const dayEntries = entries.filter((entry) =>
      isSameCalendarDay(new Date(entry.createdAt), date),
    );

    series.push(dayEntries.length ? computeDisciplineScore(dayEntries) : 0);
  }

  return series;
}

/**
 * getTrendSummary
 * Compares average of first three vs last three points in the series; needs length 6+.
 * Otherwise returns flat. Used for “Up / Down / Steady this week” copy.
 */
export function getTrendSummary(series: number[]): 'up' | 'down' | 'flat' {
  if (series.length < 6) {
    return 'flat';
  }

  const firstThree = series.slice(0, 3);
  const lastThree = series.slice(-3);

  const firstAverage =
    firstThree.reduce((sum, value) => sum + value, 0) / firstThree.length;
  const lastAverage =
    lastThree.reduce((sum, value) => sum + value, 0) / lastThree.length;

  if (lastAverage > firstAverage) {
    return 'up';
  }

  if (lastAverage < firstAverage) {
    return 'down';
  }

  return 'flat';
}
