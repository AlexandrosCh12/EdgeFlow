import { StyleSheet, Text, View } from 'react-native';

import { Colors, Radius } from '../src/theme';

type QuoteCardProps = {
  quote: string;
};

export function QuoteCard({ quote }: QuoteCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>TODAY&apos;S MINDSET</Text>
      <Text style={styles.quote}>"{quote}"</Text>
      <View style={styles.footer}>
        <View style={styles.divider} />
        <Text style={styles.brand}>EdgeFlow</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.card,
    padding: 20,
  },
  label: {
    color: Colors.gold,
    fontSize: 10,
    letterSpacing: 1.5,
  },
  quote: {
    marginTop: 8,
    color: '#CCCCCC',
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  footer: {
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#1E1E1E',
  },
  brand: {
    marginTop: 10,
    color: Colors.textMuted,
    fontSize: 11,
    textAlign: 'right',
  },
});
