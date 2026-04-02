/**
 * PlanToggle.tsx
 * Stacked plan options in one bordered card — reads like a single grouped control.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius } from '../src/theme';

type PlanToggleProps = {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
};

export function PlanToggle({
  options,
  selected,
  onSelect,
}: PlanToggleProps) {
  return (
    <View style={styles.card}>
      {options.map((option, index) => {
        const isSelected = option === selected;

        return (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            style={[
              styles.row,
              index !== options.length - 1 && styles.divider,
              isSelected && styles.selectedRow,
            ]}
          >
            <Text style={[styles.text, isSelected && styles.selectedText]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.card,
    overflow: 'hidden',
  },
  row: {
    minHeight: 56,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E1E',
  },
  selectedRow: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.gold,
    paddingLeft: 13,
  },
  text: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  selectedText: {
    color: Colors.gold,
  },
});
