/**
 * onboarding.tsx
 * Four-slide first-run flow; completing saves onboarding and goes home.
 */

import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getSettings, saveSettings } from '../src/storage/storage';
import { Colors, Radius, Spacing } from '../src/theme';

// Psychology → pause → discipline → habits (linear swipe progression)
const SLIDES = [
  {
    title: 'Trading is Psychology',
    subtitle: 'Before you click, pause.',
  },
  {
    title: 'Pause Before Emotional Trades',
    subtitle: 'Your emotions are data.',
  },
  {
    title: 'Track Discipline, Not Profit',
    subtitle: 'Consistency is the edge.',
  },
  {
    title: 'Build Better Habits',
    subtitle: 'Your process compounds.',
  },
];

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const isLastSlide = currentSlide === SLIDES.length - 1;
  const slide = SLIDES[currentSlide];

  const animateToNextSlide = (nextIndex: number) => {
    opacity.value = withTiming(0, {
      duration: 150,
      easing: Easing.out(Easing.ease),
    });
    translateX.value = withTiming(
      -SCREEN_WIDTH * 0.08,
      {
        duration: 150,
        easing: Easing.out(Easing.ease),
      },
      () => {
        runOnJS(setCurrentSlide)(nextIndex);
        translateX.value = SCREEN_WIDTH * 0.08;
        opacity.value = withTiming(1, {
          duration: 200,
          easing: Easing.out(Easing.ease),
        });
        translateX.value = withTiming(0, {
          duration: 200,
          easing: Easing.out(Easing.ease),
        });
      }
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  const handleContinue = () => {
    if (!isLastSlide) {
      animateToNextSlide(currentSlide + 1);
    }
  };

  const handleGetStarted = async () => {
    try {
      const current = await getSettings();
      await saveSettings({ ...current, onboardingComplete: true });
      router.replace('/');
    } catch (e) {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Animated.View style={animatedStyle}>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.subtitle}>{slide.subtitle}</Text>
          </Animated.View>
        </View>

        <View style={styles.footer}>
          <View style={styles.dots}>
            {SLIDES.map((item, index) => (
              <View
                key={item.title}
                style={[
                  styles.dot,
                  index === currentSlide ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            ))}
          </View>

          <Pressable
            style={styles.button}
            onPress={isLastSlide ? handleGetStarted : handleContinue}
          >
            <Text style={styles.buttonText}>
              {isLastSlide ? 'Get Started' : 'Continue'}
            </Text>
          </Pressable>
        </View>
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
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 12,
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  footer: {
    gap: 24,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    borderRadius: Radius.pill,
  },
  activeDot: {
    width: 8,
    height: 8,
    backgroundColor: Colors.gold,
  },
  inactiveDot: {
    width: 6,
    height: 6,
    backgroundColor: Colors.border,
  },
  button: {
    height: 56,
    borderRadius: Radius.button,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: Colors.base,
    fontSize: 16,
    fontWeight: '700',
  },
});
