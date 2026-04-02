/**
 * reflection.tsx
 * Post-trade reflection: finds an incomplete entry and saves reflection fields.
 */

import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmotionGrid } from '../components/EmotionGrid';
import { PlanToggle } from '../components/PlanToggle';
import { getEntries, updateEntry } from '../src/storage/storage';
import { Colors, Radius, Spacing } from '../src/theme';
import type {
  DisciplineType,
  Emotion,
  TradeEntry,
  TradeResult,
  WouldTakeAgain,
} from '../src/types';
import { POST_TRADE_EMOTIONS, validateReflectionSave } from '../src/utils/validate';

const POST_TRADE_GRID: Emotion[] = [...POST_TRADE_EMOTIONS];

function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

export default function ReflectionScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [pendingEntry, setPendingEntry] = useState<TradeEntry | null>(null);
  const [result, setResult] = useState<TradeResult | ''>('');
  const [followsPlanAfter, setFollowsPlanAfter] = useState<'Yes' | 'No' | ''>('');
  const [postEmotion, setPostEmotion] = useState<Emotion | ''>('');
  const [disciplineType, setDisciplineType] = useState<DisciplineType | ''>('');
  const [lessonLearned, setLessonLearned] = useState('');
  const [wouldTakeAgain, setWouldTakeAgain] = useState<WouldTakeAgain | ''>('');

  useFocusEffect(
    useCallback(() => {
      const loadPendingEntry = async () => {
        try {
          const entries = await getEntries();
          // Newest unfinished first — score ignores incomplete reflections
          const nextPending =
            entries.find((entry) => entry.reflectionCompleted === false) ?? null;
          setPendingEntry(nextPending);
        } catch {
          setPendingEntry(null);
        } finally {
          setIsLoading(false);
        }
      };

      loadPendingEntry();
    }, []),
  );

  const canSave = Boolean(
    pendingEntry &&
      result &&
      followsPlanAfter &&
      postEmotion &&
      disciplineType &&
      wouldTakeAgain,
  );

  // Merges into existing row by id — does not create a second entry
  const handleSave = async () => {
    if (!pendingEntry || !result || !followsPlanAfter || !postEmotion || !disciplineType || !wouldTakeAgain) {
      return;
    }

    const updates = validateReflectionSave({
      result,
      followsPlanAfter,
      postEmotion,
      disciplineType,
      lessonLearned,
      wouldTakeAgain,
    });

    if (!updates) {
      return;
    }

    await updateEntry(pendingEntry.id, updates);
    router.back();
  };

  if (isLoading) {
    return <SafeAreaView style={styles.safeArea} />;
  }

  if (!pendingEntry) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No pending trades to reflect on</Text>
          <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
            <Text style={styles.secondaryButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Text style={styles.back}>←</Text>
          </Pressable>
          <Text style={styles.title}>Post-Trade Reflection</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <SectionLabel>RESULT</SectionLabel>
          <View style={styles.resultRow}>
            {(['Win', 'Loss', 'Break-even'] as TradeResult[]).map((value) => {
              const isSelected = result === value;
              const palette =
                value === 'Win'
                  ? { backgroundColor: '#0D2E11', borderColor: Colors.win, color: Colors.win }
                  : value === 'Loss'
                    ? { backgroundColor: '#2E0D0D', borderColor: Colors.loss, color: Colors.loss }
                    : {
                        backgroundColor: Colors.card,
                        borderColor: '#555555',
                        color: Colors.textSecondary,
                      };

              return (
                <Pressable
                  key={value}
                  onPress={() => setResult(value)}
                  style={[
                    styles.resultButton,
                    {
                      backgroundColor: palette.backgroundColor,
                      borderColor: palette.borderColor,
                      borderWidth: isSelected ? 2 : 1,
                      opacity: isSelected ? 1 : 0.5,
                    },
                  ]}
                >
                  <Text style={[styles.resultText, { color: palette.color }]}>
                    {value}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.section}>
            <SectionLabel>DID YOU FOLLOW YOUR PLAN?</SectionLabel>
            <PlanToggle
              options={['Yes', 'No']}
              selected={followsPlanAfter}
              onSelect={(value) => setFollowsPlanAfter(value as 'Yes' | 'No')}
            />
          </View>

          <View style={styles.section}>
            <SectionLabel>HOW DO YOU FEEL NOW?</SectionLabel>
            <EmotionGrid
              options={POST_TRADE_GRID}
              selected={postEmotion}
              onSelect={(value) => setPostEmotion(value as Emotion)}
            />
          </View>

          <View style={styles.section}>
            <SectionLabel>TRADE DISCIPLINE</SectionLabel>
            <View style={styles.disciplineRow}>
              {(['Disciplined', 'Impulsive'] as DisciplineType[]).map((value) => {
                const isSelected = disciplineType === value;
                const activeColor = value === 'Impulsive' ? Colors.loss : Colors.gold;

                return (
                  <Pressable
                    key={value}
                    onPress={() => setDisciplineType(value)}
                    style={[
                      styles.disciplineCard,
                      isSelected && { borderColor: activeColor },
                    ]}
                  >
                    <Text
                      style={[
                        styles.disciplineText,
                        isSelected && { color: activeColor },
                      ]}
                    >
                      {value}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <SectionLabel>LESSON LEARNED</SectionLabel>
            <TextInput
              multiline
              placeholder="What did you learn from this trade?"
              placeholderTextColor="#444444"
              value={lessonLearned}
              onChangeText={setLessonLearned}
              style={styles.input}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.section}>
            <SectionLabel>WOULD YOU TAKE THIS TRADE AGAIN?</SectionLabel>
            <View style={styles.pillsRow}>
              {(['Yes', 'No', 'Maybe'] as WouldTakeAgain[]).map((value) => {
                const isSelected = wouldTakeAgain === value;
                return (
                  <Pressable
                    key={value}
                    onPress={() => setWouldTakeAgain(value)}
                    style={[styles.choicePill, isSelected && styles.choicePillSelected]}
                  >
                    <Text
                      style={[styles.choiceText, isSelected && styles.choiceTextSelected]}
                    >
                      {value}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>

        <Pressable
          style={[styles.primaryButton, !canSave && styles.disabled]}
          onPress={handleSave}
          disabled={!canSave}
        >
          <Text style={styles.primaryButtonText}>Complete Reflection</Text>
        </Pressable>
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
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: Colors.base,
    paddingTop: Spacing.safeTop,
    paddingBottom: Spacing.safeBottom,
    paddingHorizontal: Spacing.screenH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textPrimary,
    fontSize: 18,
    textAlign: 'center',
  },
  secondaryButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: Radius.button,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: Spacing.screenH,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: {
    color: Colors.textPrimary,
    fontSize: 24,
    lineHeight: 24,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 24,
  },
  scroll: {
    flex: 1,
    marginTop: 20,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenH,
    paddingBottom: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionLabel: {
    marginBottom: 12,
    color: Colors.gold,
    fontSize: 11,
    letterSpacing: 1.5,
  },
  resultRow: {
    flexDirection: 'row',
    gap: 8,
  },
  resultButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: Radius.button,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultText: {
    fontSize: 14,
    fontWeight: '600',
  },
  disciplineRow: {
    flexDirection: 'row',
    gap: 12,
  },
  disciplineCard: {
    flex: 1,
    height: 80,
    borderRadius: Radius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disciplineText: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  input: {
    minHeight: 110,
    borderRadius: Radius.input,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    padding: 14,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  choicePill: {
    flex: 1,
    height: 44,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  choicePillSelected: {
    borderColor: Colors.gold,
    backgroundColor: Colors.goldDim,
  },
  choiceText: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
  choiceTextSelected: {
    color: Colors.gold,
  },
  primaryButton: {
    height: 56,
    marginHorizontal: Spacing.screenH,
    marginBottom: Spacing.safeBottom,
    borderRadius: Radius.button,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: Colors.base,
    fontSize: 16,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.5,
  },
});
