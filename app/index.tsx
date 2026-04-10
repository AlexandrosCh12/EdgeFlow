/**
 * index.tsx
 * Home dashboard: loads entries, computes score, streak, quote, trend, main hub.
 */

import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionRow } from '../components/ActionRow';
import { DisciplineChart } from '../components/DisciplineChart';
import { QuoteCard } from '../components/QuoteCard';
import ScoreRing from '../components/ScoreRing';
import { StreakRing } from '../components/StreakRing';
import { getDailyQuote } from '../src/logic/quoteLogic';
import {
  computeDisciplineScore,
  getStatusFromScore,
} from '../src/logic/scoreLogic';
import { computeStreak } from '../src/logic/streakLogic';
import { getRecentTrendSeries, getTrendSummary } from '../src/logic/trendLogic';
import { getEntries, getSettings } from '../src/storage/storage';
import { Colors, Radius, Spacing } from '../src/theme';
import type { AppSettings, TradeEntry } from '../src/types';
import { formatWeekday } from '../src/utils/dateUtils';

const monoFont = Platform.select({
  ios: 'Courier',
  android: 'monospace',
  default: 'monospace',
});

export default function HomeScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<TradeEntry[]>([]);
  const [, setSettings] = useState<AppSettings | null>(null);

  // ─── Data loading ───────────────────────────────────────────

  const loadData = useCallback(async () => {
    const [storedEntries, storedSettings] = await Promise.all([
      getEntries(),
      getSettings(),
    ]);

    setEntries(storedEntries);
    setSettings(storedSettings);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  // ─── Derived values ─────────────────────────────────────────

  // Overall behavioral score from scoreLogic over all loaded entries
  const disciplineScore = useMemo(
    () => computeDisciplineScore(entries),
    [entries],
  );
  // Label + color band from numeric score (same module as score)
  const status = useMemo(
    () => getStatusFromScore(disciplineScore),
    [disciplineScore],
  );
  // Consecutive qualifying days from streakLogic
  const streak = useMemo(() => computeStreak(entries), [entries]);
  // Last 7 daily scores for the chart
  const trendSeries = useMemo(() => getRecentTrendSeries(entries), [entries]);
  const trendSummary = useMemo(
    () => getTrendSummary(trendSeries),
    [trendSeries],
  );
  // Deterministic line of the day from quoteLogic
  const dailyQuote = useMemo(() => getDailyQuote(), []);

  const trendText =
    trendSummary === 'up'
      ? 'Up this week'
      : trendSummary === 'down'
        ? 'Down this week'
        : 'Steady';

  const latestEntry = entries[0];
  // Action rows navigate to pretrade, reflection, history, settings

  // ─── Render ─────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Text style={styles.logo}>EDGEFLOW</Text>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
        </View>

        <View style={styles.scoreCard}>
          <ScoreRing
            score={disciplineScore}
            statusLabel={status.label}
            statusColor={status.color}
          />
          <Text style={styles.sectionCaption}>7-DAY DISCIPLINE</Text>
          <Text style={styles.trendText}>{trendText}</Text>
          <View style={styles.chartWrap}>
            <DisciplineChart series={trendSeries} height={100} />
          </View>
        </View>

        <View style={styles.streakCard}>
          <StreakRing streak={streak} bestStreak={21} />
          <View style={styles.streakInfo}>
            <Text style={styles.infoText}>
              Best streak: <Text style={styles.infoStrong}>21 days</Text>
            </Text>
            <Text style={styles.infoText}>
              Active since:{' '}
              <Text style={styles.infoStrong}>
                {latestEntry ? formatWeekday(latestEntry.createdAt) : 'Mon'}
              </Text>
            </Text>
          </View>
        </View>

        <View style={styles.quoteWrap}>
          <QuoteCard quote={dailyQuote} />
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.actionsLabel}>ACTIONS</Text>
          <View style={styles.actionsCard}>
            <ActionRow icon="○" label="Pre-Trade Check" onPress={() => router.push('/pretrade')} />
            <ActionRow
              icon="◔"
              label="Post-Trade Reflection"
              onPress={() => router.push('/reflection')}
            />
            <ActionRow icon="◫" label="Journal" onPress={() => router.push('/history')} />
            <ActionRow
              icon="⚙"
              label="Settings"
              onPress={() => router.push('/settings')}
              isLast
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.base,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.base,
  },
  content: {
    paddingTop: Spacing.safeTop,
    paddingBottom: Spacing.safeBottom,
    paddingHorizontal: Spacing.screenH,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    color: Colors.gold,
    fontFamily: monoFont,
    fontSize: 13,
    letterSpacing: 2,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  scoreCard: {
    marginTop: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.card,
    padding: 20,
  },
  sectionCaption: {
    marginTop: 16,
    color: Colors.textMuted,
    fontSize: 11,
    letterSpacing: 1.5,
  },
  trendText: {
    marginTop: 4,
    color: Colors.textSecondary,
    fontSize: 13,
  },
  chartWrap: {
    marginTop: 8,
    height: 100,
  },
  streakCard: {
    marginTop: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.card,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  streakInfo: {
    flex: 1,
    gap: 10,
  },
  infoText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  infoStrong: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  quoteWrap: {
    marginTop: 12,
  },
  actionsSection: {
    marginTop: 24,
  },
  actionsLabel: {
    marginBottom: 8,
    color: Colors.textMuted,
    fontSize: 11,
    letterSpacing: 1.5,
  },
  actionsCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.card,
    overflow: 'hidden',
  },
});
