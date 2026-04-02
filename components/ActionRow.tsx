/**
 * ActionRow.tsx
 * Tappable list row with icon, label, chevron; optional bottom divider.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '../src/theme';

type ActionRowProps = {
  icon: string;
  label: string;
  onPress: () => void;
  isLast?: boolean;
};

export function ActionRow({
  icon,
  label,
  onPress,
  isLast = false,
}: ActionRowProps) {
  return (
    <Pressable onPress={onPress} style={[styles.row, !isLast && styles.border]}>
      <View style={styles.left}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // Hairline between rows; last row skips so the card edge stays clean
  border: {
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E1E',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    width: 20,
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  label: {
    color: Colors.textPrimary,
    fontSize: 15,
  },
  chevron: {
    color: Colors.textMuted,
    fontSize: 24,
    lineHeight: 24,
  },
});
