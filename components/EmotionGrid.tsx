/**
 * EmotionGrid.tsx
 * Two-column wrap of tappable emotion chips for pre- or post-trade selection.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius } from '../src/theme';

type EmotionGridProps = {
  options: string[];
  selected: string;
  onSelect: (emotion: string) => void;
};

export function EmotionGrid({
  options,
  selected,
  onSelect,
}: EmotionGridProps) {
  return (
    <View style={styles.grid}>
      {options.map((option) => {
        const isSelected = selected === option;

        return (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            style={[styles.pill, isSelected && styles.selectedPill]}
          >
            <Text style={[styles.pillText, isSelected && styles.selectedText]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  pill: {
    width: '48%',
    height: 44,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Gold border + dim fill vs default border + surface
  selectedPill: {
    borderColor: Colors.gold,
    backgroundColor: Colors.goldDim,
  },
  pillText: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
  selectedText: {
    color: Colors.gold,
  },
});
