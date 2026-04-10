/**
 * history.tsx
 * Journal list with discipline filter and summary stats over all entries.
 */

import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EntryCard } from '../components/EntryCard';
import { getEntries } from '../src/storage/storage';
import { Colors, Radius, Spacing } from '../src/theme';
import type { Emotion, TradeEntry } from '../src/types';

type Filter = 'All' | 'Disciplined' | 'Impulsive';

function StatCard({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
    </View>
  );
}

export default function HistoryScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<TradeEntry[]>([]);
  const [filter, setFilter] = useState<Filter>('All');

  useFocusEffect(
    useCallback(() => {
      const loadEntries = async () => {
        const storedEntries = await getEntries();
        setEntries(storedEntries);
      };

      loadEntries();
    }, []),
  );

  // All rows, or only rows whose reflection tagged Disciplined / Impulsive
  const filteredEntries = useMemo(() => {
    if (filter === 'All') {
      return entries;
    }

    return entries.filter((entry) => entry.disciplineType === filter);
  }, [entries, filter]);

  // Mode of pre-trade emotions across the full journal (not filtered list)
  const commonEmotion = useMemo(() => {
    if (!entries.length) {
      return 'None';
    }

    const counts = entries.reduce<Record<string, number>>((acc, entry) => {
      acc[entry.preTradeEmotion] = (acc[entry.preTradeEmotion] ?? 0) + 1;
      return acc;
    }, {});

    return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ??
      'None') as Emotion | 'None';
  }, [entries]);

  // Share of entries tagged Disciplined vs Impulsive (requires reflection)
  const disciplinedCount = entries.filter(
    (entry) => entry.disciplineType === 'Disciplined',
  ).length;
  const impulsiveCount = entries.filter(
    (entry) => entry.disciplineType === 'Impulsive',
  ).length;
  const disciplinedPercent = entries.length
    ? `${Math.round((disciplinedCount / entries.length) * 100)}%`
    : '0%';
  const impulsivePercent = entries.length
    ? `${Math.round((impulsiveCount / entries.length) * 100)}%`
    : '0%';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Text style={styles.back}>←</Text>
          </Pressable>
          <Text style={styles.title}>Journal</Text>
        </View>

        <View style={styles.filters}>
          {(['All', 'Disciplined', 'Impulsive'] as Filter[]).map((value) => {
            const isActive = filter === value;
            return (
              <Pressable
                key={value}
                onPress={() => setFilter(value)}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
              >
                <Text
                  style={[styles.filterText, isActive && styles.filterTextActive]}
                >
                  {value}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.statsGrid}>
          <StatCard label="TOTAL ENTRIES" value={`${entries.length}`} />
          <StatCard label="COMMON EMOTION" value={commonEmotion} />
          <StatCard
            label="DISCIPLINED"
            value={disciplinedPercent}
            valueColor={Colors.win}
          />
          <StatCard
            label="IMPULSIVE"
            value={impulsivePercent}
            valueColor={Colors.loss}
          />
        </View>

        <FlatList
          data={filteredEntries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EntryCard
              entry={item}
              onPress={() => router.push(`/entry/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No entries yet.</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.base,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.base,
    paddingTop: Spacing.safeTop,
    paddingBottom: Spacing.safeBottom,
    paddingHorizontal: Spacing.screenH,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  back: {
    color: Colors.textPrimary,
    fontSize: 24,
    lineHeight: 24,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  filters: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  filterPill: {
    minHeight: 36,
    paddingHorizontal: 16,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    justifyContent: 'center',
  },
  filterPillActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  filterText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  filterTextActive: {
    color: Colors.base,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 18,
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    letterSpacing: 1,
  },
  statValue: {
    marginTop: 8,
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  listContent: {
    paddingTop: 18,
    paddingBottom: Spacing.safeBottom,
  },
  emptyText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 24,
  },
});
