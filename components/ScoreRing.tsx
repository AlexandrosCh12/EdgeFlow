/**
 * ScoreRing.tsx
 * Animated SVG ring for discipline score plus count-up center number and status label.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Viewport size in px; stroke sits inside the box
const SIZE = 160;
// Ring thickness — with SIZE defines inner/outer radii
const STROKE = 8;
// Arc radius: half of inner edge of the stroke
const RADIUS = (SIZE - STROKE) / 2;
// Full circle length for dashoffset animation (2πr)
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = SIZE / 2;

interface Props {
  score: number;
  statusLabel: string;
  statusColor: string;
}

export default function ScoreRing({ score, statusLabel, statusColor }: Props) {
  const progress = useSharedValue(0);
  const [displayScore, setDisplayScore] = React.useState(score);

  useEffect(() => {
    progress.value = withTiming(score / 100, {
      duration: 500,
      // Easing.out(Easing.cubic) — fast start, soft landing on the target arc
      easing: Easing.out(Easing.cubic),
    });
    let start = displayScore;
    const end = score;
    const steps = 20;
    const increment = (end - start) / steps;
    let count = 0;
    // Step the label every 25ms so the number eases with the ring
    const interval = setInterval(() => {
      count++;
      setDisplayScore(Math.round(start + increment * count));
      if (count >= steps) clearInterval(interval);
    }, 25);
    return () => clearInterval(interval);
  }, [score]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE} style={styles.svg}>
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          stroke="#2A2A2A"
          strokeWidth={STROKE}
          fill="none"
        />
        <AnimatedCircle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          stroke="#F5A623"
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={`${CIRCUMFERENCE}`}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${CENTER}, ${CENTER}`}
        />
      </Svg>
      <View style={styles.inner}>
        <Text style={styles.score}>{displayScore}</Text>
        <Text style={[styles.status, { color: statusColor }]}>
          {statusLabel}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  svg: {
    position: 'absolute',
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#F5A623',
    lineHeight: 56,
  },
  status: {
    fontSize: 11,
    letterSpacing: 2,
    marginTop: 2,
  },
});
