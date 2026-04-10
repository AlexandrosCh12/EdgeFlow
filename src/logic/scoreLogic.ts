/**
 * scoreLogic.ts
 * Behavioral discipline scoring: rewards plan adherence and reflection, not PnL.
 * Scores are clamped to 1–100 for display and status bands.
 */

import type { TradeEntry } from '../types';

const NEGATIVE_EMOTIONS = ['FOMO', 'Revenge', 'Frustrated', 'Anxious'];
const POSITIVE_EMOTIONS = ['Calm', 'Confident'];

/**
 * computeDisciplineScore
 * Builds a running score from all entries: starts at 50 (neutral). Per entry:
 * +5 base; plan before (Yes +10, Mostly +5); +5 if reflection done; Disciplined +10
 * / Impulsive -10; plan after No -10; negative pre-trade emotions -3; positive +3.
 * Final value clamped to 1–100 inclusive.
 */
export function computeDisciplineScore(entries: TradeEntry[]): number {
  let score = 50; // all scores start from neutral midpoint

  entries.forEach((entry) => {
    score += 5;

    if (entry.followsPlanBefore === 'Yes') {
      score += 10; // following the plan is the core discipline metric (+10)
    } else if (entry.followsPlanBefore === 'Mostly') {
      score += 5;
    }

    if (entry.reflectionCompleted) {
      score += 5;
    }

    if (entry.disciplineType === 'Disciplined') {
      score += 10;
    } else if (entry.disciplineType === 'Impulsive') {
      score -= 10;
    }

    if (entry.followsPlanAfter === 'No') {
      score -= 10;
    }

    if (NEGATIVE_EMOTIONS.includes(entry.preTradeEmotion)) {
      score -= 3; // FOMO and Revenge indicate emotional state before entry (-3)
    }

    if (POSITIVE_EMOTIONS.includes(entry.preTradeEmotion)) {
      score += 3;
    }
  });

  return Math.max(1, Math.min(100, score)); // keep score in 1–100 for UI and labels
}

/**
 * getStatusFromScore
 * Maps numeric score to label and color: 85+ Locked In, 70+ Focused, 50+ Neutral,
 * 30+ Distracted, below 30 Uncontrolled.
 */
export function getStatusFromScore(score: number): {
  label: string;
  color: string;
} {
  if (score >= 85) {
    return { label: 'Locked In', color: '#4CAF50' };
  }

  if (score >= 70) {
    return { label: 'Focused', color: '#F5A623' };
  }

  if (score >= 50) {
    return { label: 'Neutral', color: '#888888' };
  }

  if (score >= 30) {
    return { label: 'Distracted', color: '#FF9800' };
  }

  return { label: 'Uncontrolled', color: '#E53935' };
}
