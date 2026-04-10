/**
 * StreakRing.tsx
 * Compact circular streak indicator: arc fill maps current streak to best streak.
 */

import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Colors } from '../src/theme';

type StreakRingProps = {
  streak: number;
  bestStreak: number;
};

const SIZE = 80;
const STROKE_WIDTH = 6;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
// Full arc length; dashoffset reveals a fraction = streak / bestStreak
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function StreakRing({ streak, bestStreak }: StreakRingProps) {
  const progress = bestStreak <= 0 ? 0 : Math.min(streak / bestStreak, 1);
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const numberFontSize = streak >= 100 ? 14 : 18;

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE} style={styles.svg}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={Colors.border}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={Colors.gold}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          originX={SIZE / 2}
          originY={SIZE / 2}
          rotation={-90}
        />
      </Svg>

      <View style={styles.textWrap}>
        <Text style={[styles.value, { fontSize: numberFontSize }]}>{streak}</Text>
        <Text style={styles.label}>DAY STREAK</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
  },
  textWrap: {
    width: 52,
    alignItems: 'center',
  },
  value: {
    color: Colors.gold,
    fontWeight: '700',
    lineHeight: 20,
  },
  label: {
    marginTop: 2,
    color: Colors.textSecondary,
    fontSize: 8,
    letterSpacing: 1,
    textAlign: 'center',
    lineHeight: 10,
  },
});
