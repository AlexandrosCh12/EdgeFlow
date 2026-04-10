/**
 * index.ts
 * Single source of truth for shared TypeScript types used across storage,
 * validation, screens, and components.
 */

/** How the trader felt before opening a trade (pre-trade picker). */
export type Emotion =
  | 'Calm'
  | 'Confident'
  | 'FOMO' // fear of missing out — urgency to enter
  | 'Frustrated'
  | 'Revenge' // trading to recover a loss or “get even”
  | 'Bored'
  | 'Anxious'
  | 'Impatient'
  | 'Relieved'
  | 'Satisfied'
  | 'Regret'
  | 'Neutral'
  | 'Excited'
  | 'Focused'
  | 'Impulsive'
  | 'Disciplined';

/** Whether the trade aligned with the written plan (before or after). */
export type PlanCompliance = 'Yes' | 'Mostly' | 'No';

/** Outcome after the trade is closed (set during reflection). */
export type TradeResult = 'Win' | 'Loss' | 'Break-even';

/** Self-assessment of behavior for that trade (reflection). */
export type DisciplineType = 'Disciplined' | 'Impulsive';

/** Whether the trader would repeat the same setup (reflection). */
export type WouldTakeAgain = 'Yes' | 'No' | 'Maybe';

/**
 * One journal row: pre-trade capture plus optional post-trade reflection.
 * When reflectionCompleted is false, scoring treats the entry as incomplete;
 * finishing reflection updates this flag and feeds score/streak logic.
 */
export interface TradeEntry {
  id: string;
  createdAt: string;
  preTradeEmotion: Emotion;
  followsPlanBefore: PlanCompliance;
  confidenceLevel: number;
  tradeReason: string;
  optionalNote: string;
  result?: TradeResult;
  followsPlanAfter?: PlanCompliance;
  postTradeEmotion?: Emotion;
  disciplineType?: DisciplineType;
  lessonLearned?: string;
  wouldTakeAgain?: WouldTakeAgain;
  /** Drives score recalculation when toggled true after reflection save. */
  reflectionCompleted: boolean;
}

/** Persisted app preferences (onboarding and toggles). */
export interface AppSettings {
  onboardingComplete: boolean;
  hapticsEnabled: boolean;
  remindersEnabled: boolean;
}
