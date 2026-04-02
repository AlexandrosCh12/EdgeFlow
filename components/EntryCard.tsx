/**
 * EntryCard.tsx
 * Journal row: date, optional result badge, tags, discipline line, chevron.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { TradeEntry } from '../src/types';
import { Colors, Radius } from '../src/theme';
import { formatDateLabel } from '../src/utils/dateUtils';

type EntryCardProps = {
  entry: TradeEntry;
  onPress: () => void;
};

export function EntryCard({ entry, onPress }: EntryCardProps) {
  // Win / Loss / break-even each get a distinct border + text color
  const resultColor =
    entry.result === 'Win'
      ? Colors.win
      : entry.result === 'Loss'
        ? Colors.loss
        : Colors.breakeven;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.topRow}>
        <Text style={styles.date}>{formatDateLabel(entry.createdAt)}</Text>
        {entry.result ? (
          <View style={[styles.badge, { borderColor: resultColor }]}>
            <Text style={[styles.badgeText, { color: resultColor }]}>
              {entry.result}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.tags}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{entry.preTradeEmotion}</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{`Plan: ${entry.followsPlanBefore}`}</Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <Text
          style={[
            styles.discipline,
            {
              color:
                entry.disciplineType === 'Impulsive' ? Colors.loss : Colors.win,
            },
          ]}
        >
          {entry.disciplineType ?? 'Pending reflection'}
        </Text>
        <Text style={styles.chevron}>›</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    padding: 16,
    marginBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  badge: {
    minHeight: 28,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
    borderWidth: 1,
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  tag: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  tagText: {
    color: Colors.textSecondary,
    fontSize: 11,
  },
  bottomRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  discipline: {
    fontSize: 12,
  },
  chevron: {
    color: Colors.textMuted,
    fontSize: 24,
    lineHeight: 24,
  },
});
