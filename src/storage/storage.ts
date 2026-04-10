/**
 * storage.ts
 * Offline-first AsyncStorage layer for journal entries and settings.
 * Reads return safe defaults on failure; writes log warnings without throwing.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AppSettings, TradeEntry } from '../types';
import { validateStoredTradeEntry } from '../utils/validate';

const KEYS = {
  ENTRIES: 'edgeflow_entries',
  SETTINGS: 'edgeflow_settings',
};

/** Caps list length so device storage cannot grow without bound. */
export const MAX_STORED_ENTRIES = 500;

const DEFAULT_SETTINGS: AppSettings = {
  onboardingComplete: false,
  hapticsEnabled: true,
  remindersEnabled: false,
};

function normalizeSettingsFromParsed(parsed: unknown): AppSettings {
  if (parsed === null || typeof parsed !== 'object') {
    return DEFAULT_SETTINGS;
  }
  const o = parsed as Record<string, unknown>;

  // Only true counts; avoids "true" strings from bad JSON acting as onboarded
  const onboardingComplete = o.onboardingComplete === true;

  const hapticsEnabled =
    typeof o.hapticsEnabled === 'boolean'
      ? o.hapticsEnabled
      : DEFAULT_SETTINGS.hapticsEnabled;

  const remindersEnabled =
    typeof o.remindersEnabled === 'boolean'
      ? o.remindersEnabled
      : DEFAULT_SETTINGS.remindersEnabled;

  return {
    onboardingComplete,
    hapticsEnabled,
    remindersEnabled,
  };
}

function trimEntriesToLimit(entries: TradeEntry[]): TradeEntry[] {
  if (entries.length <= MAX_STORED_ENTRIES) {
    return entries;
  }
  // Keep newest first in memory; slice drops oldest beyond cap
  return entries.slice(0, MAX_STORED_ENTRIES);
}

/**
 * getEntries
 * Loads all journal entries from storage, validates each row, trims to cap.
 * Returns: array of entries, or [] if missing, corrupt, or read error.
 * Safe default on failure: [].
 */
export async function getEntries(): Promise<TradeEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.ENTRIES);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw); // object graph from string
    if (!Array.isArray(parsed)) {
      return [];
    }

    const out: TradeEntry[] = [];
    let dropped = 0;

    for (const item of parsed) {
      const entry = validateStoredTradeEntry(item);
      if (entry) {
        out.push(entry);
      } else {
        dropped += 1;
      }
    }

    if (dropped > 0) {
      console.warn('Some journal entries were invalid and removed');
    }

    return trimEntriesToLimit(out);
  } catch {
    console.warn('Storage read failed — using defaults');
    return [];
  }
}

/**
 * saveEntries
 * Persists the full entry list (replaces prior list). Silently no-ops on write error.
 * Returns: void. Safe default: data not updated if write fails.
 */
export async function saveEntries(entries: TradeEntry[]): Promise<void> {
  try {
    const bounded = trimEntriesToLimit(entries);
    await AsyncStorage.setItem(KEYS.ENTRIES, JSON.stringify(bounded)); // serialize for AsyncStorage
  } catch {
    console.warn('Storage write failed');
  }
}

/**
 * addEntry
 * Prepends one new entry and saves. Uses getEntries + saveEntries.
 * Safe default on failure: same as saveEntries (no throw).
 */
export async function addEntry(entry: TradeEntry): Promise<void> {
  const entries = await getEntries();
  await saveEntries([entry, ...entries]);
}

/**
 * updateEntry
 * Merges updates into the matching id and saves. No-op if id missing (still rewrites list).
 * Safe default: same as saveEntries on failure.
 */
export async function updateEntry(
  id: string,
  updates: Partial<TradeEntry>,
): Promise<void> {
  const entries = await getEntries();
  const nextEntries = entries.map((entry) =>
    entry.id === id ? { ...entry, ...updates } : entry,
  );
  await saveEntries(nextEntries);
}

/**
 * getSettings
 * Loads app settings object. Returns DEFAULT_SETTINGS if missing or invalid.
 * Safe default on failure: DEFAULT_SETTINGS.
 */
export async function getSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }

    const parsed: unknown = JSON.parse(raw);
    return normalizeSettingsFromParsed(parsed);
  } catch {
    console.warn('Storage read failed — using defaults');
    return DEFAULT_SETTINGS;
  }
}

/**
 * saveSettings
 * Writes settings with strict booleans so string "true" never persists wrongly.
 * Returns: void. Safe default: unchanged disk state if write fails.
 */
export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    const safe: AppSettings = {
      // Reject string "true" from bad callers — must be real boolean
      onboardingComplete: settings.onboardingComplete === true,
      hapticsEnabled:
        typeof settings.hapticsEnabled === 'boolean'
          ? settings.hapticsEnabled
          : DEFAULT_SETTINGS.hapticsEnabled,
      remindersEnabled:
        typeof settings.remindersEnabled === 'boolean'
          ? settings.remindersEnabled
          : DEFAULT_SETTINGS.remindersEnabled,
    };
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(safe));
  } catch {
    console.warn('Storage write failed');
  }
}

/**
 * resetAllData
 * Removes entries and settings keys. Used for full wipe; caller may redirect.
 * Safe default: logs warning if remove fails; does not throw.
 */
export async function resetAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([KEYS.ENTRIES, KEYS.SETTINGS]);
  } catch {
    console.warn('Storage reset failed');
  }
}

export { DEFAULT_SETTINGS, KEYS };
