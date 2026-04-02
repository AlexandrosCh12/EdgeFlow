/**
 * validate.ts
 * Single validation boundary for user and stored input before it reaches storage.
 * Invalid data returns null or false; never throws for bad shapes.
 */

import type {
  AppSettings,
  DisciplineType,
  Emotion,
  PlanCompliance,
  TradeEntry,
  TradeResult,
  WouldTakeAgain,
} from '../types';

/** Allowed pre-trade emotion labels (must match Emotion union subset). */
export const PRE_TRADE_EMOTIONS = [
  'Calm',
  'Confident',
  'FOMO',
  'Frustrated',
  'Revenge',
  'Bored',
  'Anxious',
  'Impatient',
] as const;

/** Allowed post-trade emotion labels for reflection. */
export const POST_TRADE_EMOTIONS = [
  'Relieved',
  'Frustrated',
  'Satisfied',
  'Regret',
  'Confident',
  'Anxious',
  'Neutral',
  'Excited',
] as const;

export type PreTradeEmotion = (typeof PRE_TRADE_EMOTIONS)[number];
export type PostTradeEmotion = (typeof POST_TRADE_EMOTIONS)[number];

const FOLLOWS_PLAN_BEFORE = new Set<PlanCompliance>(['Yes', 'Mostly', 'No']);
const FOLLOWS_PLAN_AFTER = new Set<PlanCompliance>(['Yes', 'No']);
const TRADE_RESULTS = new Set<TradeResult>(['Win', 'Loss', 'Break-even']);
const DISCIPLINE_TYPES = new Set<DisciplineType>(['Disciplined', 'Impulsive']);
const WOULD_TAKE = new Set<WouldTakeAgain>(['Yes', 'No', 'Maybe']);

const PRE_TRADE_SET = new Set<string>(PRE_TRADE_EMOTIONS);
const POST_TRADE_SET = new Set<string>(POST_TRADE_EMOTIONS);

export const MAX_TRADE_REASON_LEN = 1000;
export const MAX_OPTIONAL_NOTE_LEN = 500;
export const MAX_LESSON_LEN = 1000;
export const MAX_ROUTE_ENTRY_ID_LEN = 64;

/**
 * clampInt
 * Rounds to integer and clamps to [min, max]; non-finite input yields min.
 */
export function clampInt(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) {
    return min;
  }
  const rounded = Math.round(n);
  return Math.min(max, Math.max(min, rounded));
}

function trimToMax(s: string, max: number): string {
  if (s.length <= max) {
    return s;
  }
  return s.slice(0, max);
}

/**
 * isValidIsoDateString
 * Returns true only if Date.parse accepts the string (non-NaN).
 */
export function isValidIsoDateString(s: string): boolean {
  if (typeof s !== 'string' || !s) {
    return false;
  }
  const t = Date.parse(s);
  return !Number.isNaN(t);
}

/**
 * validateRouteEntryId
 * Deep-link / route id: non-empty string, max length; returns null on failure.
 */
export function validateRouteEntryId(raw: unknown): string | null {
  if (typeof raw !== 'string') {
    return null;
  }
  const t = raw.trim();
  if (!t || t.length > MAX_ROUTE_ENTRY_ID_LEN) {
    return null;
  }
  return t;
}

/**
 * normalizeEntryIdParam
 * Handles expo-router param as string or array; returns null if invalid.
 */
export function normalizeEntryIdParam(
  raw: string | string[] | undefined,
): string | null {
  if (raw === undefined) {
    return null;
  }
  const v = Array.isArray(raw) ? raw[0] : raw;
  return validateRouteEntryId(v);
}

/**
 * validatePreTradeForm
 * Builds a new TradeEntry from pre-trade form fields or returns null if any check fails.
 * On success: reflectionCompleted is false until post-trade reflection runs.
 */
export function validatePreTradeForm(input: {
  emotion: string;
  followsPlan: string;
  confidence: number;
  tradeReason: string;
  optionalNote: string;
}): TradeEntry | null {
  const preTradeEmotion = input.emotion.trim();
  if (!PRE_TRADE_SET.has(preTradeEmotion)) {
    return null;
  }

  const followsPlanBefore = input.followsPlan.trim() as PlanCompliance;
  if (!FOLLOWS_PLAN_BEFORE.has(followsPlanBefore)) {
    return null;
  }

  const confidenceLevel = clampInt(input.confidence, 0, 100);
  const tradeReason = trimToMax(input.tradeReason.trim(), MAX_TRADE_REASON_LEN);
  const optionalNote = trimToMax(input.optionalNote.trim(), MAX_OPTIONAL_NOTE_LEN);

  const id = Date.now().toString();
  if (!id) {
    return null;
  }

  const createdAt = new Date().toISOString();
  if (!isValidIsoDateString(createdAt)) {
    return null;
  }

  return {
    id,
    createdAt,
    preTradeEmotion: preTradeEmotion as Emotion,
    followsPlanBefore,
    confidenceLevel,
    tradeReason,
    optionalNote,
    reflectionCompleted: false,
  };
}

/**
 * validateReflectionSave
 * Validates reflection fields and returns a partial entry for updateEntry, or null.
 */
export function validateReflectionSave(input: {
  result: string;
  followsPlanAfter: string;
  postEmotion: string;
  disciplineType: string;
  lessonLearned: string;
  wouldTakeAgain: string;
}): Partial<TradeEntry> | null {
  const result = input.result.trim() as TradeResult;
  if (!TRADE_RESULTS.has(result)) {
    return null;
  }

  const followsPlanAfter = input.followsPlanAfter.trim() as PlanCompliance;
  if (!FOLLOWS_PLAN_AFTER.has(followsPlanAfter)) {
    return null;
  }

  const postEmotion = input.postEmotion.trim();
  if (!POST_TRADE_SET.has(postEmotion)) {
    return null;
  }

  const disciplineType = input.disciplineType.trim() as DisciplineType;
  if (!DISCIPLINE_TYPES.has(disciplineType)) {
    return null;
  }

  const wouldTakeAgain = input.wouldTakeAgain.trim() as WouldTakeAgain;
  if (!WOULD_TAKE.has(wouldTakeAgain)) {
    return null;
  }

  const lessonLearned = trimToMax(input.lessonLearned.trim(), MAX_LESSON_LEN);

  return {
    result,
    followsPlanAfter,
    postTradeEmotion: postEmotion as Emotion,
    disciplineType,
    lessonLearned,
    wouldTakeAgain,
    reflectionCompleted: true,
  };
}

/**
 * coerceSettingsToggle
 * Returns the boolean only if value is already true/false (rejects truthy strings).
 */
export function coerceSettingsToggle(value: unknown): boolean | null {
  if (value === true || value === false) {
    return value;
  }
  return null;
}

/**
 * mergeSettingsWithToggle
 * Applies one toggle to settings; returns null if value is not a real boolean.
 */
export function mergeSettingsWithToggle(
  prev: AppSettings,
  key: 'hapticsEnabled' | 'remindersEnabled',
  value: unknown,
): AppSettings | null {
  const coerced = coerceSettingsToggle(value);
  if (coerced === null) {
    return null;
  }
  return { ...prev, [key]: coerced };
}

function isOptionalString(v: unknown): v is string | undefined {
  return v === undefined || typeof v === 'string';
}

function normalizeConfidence(n: unknown): number | null {
  if (typeof n !== 'number' || !Number.isFinite(n)) {
    return null;
  }
  const c = clampInt(n, 0, 100);
  return c;
}

/**
 * validateStoredTradeEntry
 * Validates one object after JSON.parse from disk; returns null if shape or types fail.
 */
export function validateStoredTradeEntry(raw: unknown): TradeEntry | null {
  if (raw === null || typeof raw !== 'object') {
    return null;
  }
  const o = raw as Record<string, unknown>;

  if (typeof o.id !== 'string' || !o.id.trim()) {
    return null;
  }

  if (typeof o.createdAt !== 'string' || !isValidIsoDateString(o.createdAt)) {
    return null;
  }

  if (typeof o.preTradeEmotion !== 'string' || !PRE_TRADE_SET.has(o.preTradeEmotion)) {
    return null;
  }

  if (typeof o.followsPlanBefore !== 'string' || !FOLLOWS_PLAN_BEFORE.has(o.followsPlanBefore as PlanCompliance)) {
    return null;
  }

  const confidenceLevel = normalizeConfidence(o.confidenceLevel);
  if (confidenceLevel === null) {
    return null;
  }

  if (!isOptionalString(o.tradeReason) || !isOptionalString(o.optionalNote)) {
    return null;
  }

  if (typeof o.reflectionCompleted !== 'boolean') {
    return null;
  }

  const tradeReason =
    typeof o.tradeReason === 'string'
      ? trimToMax(o.tradeReason, MAX_TRADE_REASON_LEN)
      : '';
  const optionalNote =
    typeof o.optionalNote === 'string'
      ? trimToMax(o.optionalNote, MAX_OPTIONAL_NOTE_LEN)
      : '';

  if (o.result !== undefined) {
    if (typeof o.result !== 'string' || !TRADE_RESULTS.has(o.result as TradeResult)) {
      return null;
    }
  }
  if (o.followsPlanAfter !== undefined) {
    if (
      typeof o.followsPlanAfter !== 'string' ||
      !FOLLOWS_PLAN_AFTER.has(o.followsPlanAfter as PlanCompliance)
    ) {
      return null;
    }
  }
  if (o.postTradeEmotion !== undefined) {
    if (typeof o.postTradeEmotion !== 'string' || !POST_TRADE_SET.has(o.postTradeEmotion)) {
      return null;
    }
  }
  if (o.disciplineType !== undefined) {
    if (
      typeof o.disciplineType !== 'string' ||
      !DISCIPLINE_TYPES.has(o.disciplineType as DisciplineType)
    ) {
      return null;
    }
  }
  if (o.lessonLearned !== undefined && typeof o.lessonLearned !== 'string') {
    return null;
  }
  if (o.wouldTakeAgain !== undefined) {
    if (
      typeof o.wouldTakeAgain !== 'string' ||
      !WOULD_TAKE.has(o.wouldTakeAgain as WouldTakeAgain)
    ) {
      return null;
    }
  }

  const entry: TradeEntry = {
    id: o.id.trim(),
    createdAt: o.createdAt,
    preTradeEmotion: o.preTradeEmotion as Emotion,
    followsPlanBefore: o.followsPlanBefore as PlanCompliance,
    confidenceLevel,
    tradeReason,
    optionalNote,
    reflectionCompleted: o.reflectionCompleted,
  };

  if (o.result !== undefined) {
    entry.result = o.result as TradeResult;
  }
  if (o.followsPlanAfter !== undefined) {
    entry.followsPlanAfter = o.followsPlanAfter as PlanCompliance;
  }
  if (o.postTradeEmotion !== undefined) {
    entry.postTradeEmotion = o.postTradeEmotion as Emotion;
  }
  if (o.disciplineType !== undefined) {
    entry.disciplineType = o.disciplineType as DisciplineType;
  }
  if (o.lessonLearned !== undefined) {
    entry.lessonLearned = trimToMax(o.lessonLearned as string, MAX_LESSON_LEN);
  }
  if (o.wouldTakeAgain !== undefined) {
    entry.wouldTakeAgain = o.wouldTakeAgain as WouldTakeAgain;
  }

  return entry;
}
