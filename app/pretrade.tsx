/**
 * pretrade.tsx
 * Pre-trade emotional check: capture mood, plan fit, confidence, notes, then log entry.
 */

import { useRouter } from 'expo-router';
import { useState } from 'react';
import Slider from '@react-native-community/slider';
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
import { addEntry } from '../src/storage/storage';
import { Colors, Radius, Spacing } from '../src/theme';
import type { Emotion, PlanCompliance } from '../src/types';
import { PRE_TRADE_EMOTIONS, validatePreTradeForm } from '../src/utils/validate';

// Options mirror Emotion labels used in discipline scoring
const PRE_TRADE_GRID: Emotion[] = [...PRE_TRADE_EMOTIONS];

function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

export default function PreTradeScreen() {
  const router = useRouter();

  // ─── State ──────────────────────────────────────────────────

  const [emotion, setEmotion] = useState<Emotion | ''>('');
  const [followsPlan, setFollowsPlan] = useState<PlanCompliance | ''>('');
  const [confidence, setConfidence] = useState(50);
  const [tradeReason, setTradeReason] = useState('');
  const [optionalNote, setOptionalNote] = useState('');

  const canSave = Boolean(emotion && followsPlan);

  // ─── Handlers ────────────────────────────────────────────────

  // Validates, adds new entry with reflectionCompleted false, then pops
  const handleSave = async () => {
    if (!emotion || !followsPlan) {
      return;
    }

    const entry = validatePreTradeForm({
      emotion,
      followsPlan,
      confidence,
      tradeReason,
      optionalNote,
    });

    if (!entry) {
      return;
    }

    await addEntry(entry);
    router.back();
  };

  // ─── Render ─────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Text style={styles.back}>←</Text>
          </Pressable>
          <Text style={styles.title}>Pre-Trade Check</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <SectionLabel>HOW ARE YOU FEELING?</SectionLabel>
          <EmotionGrid
            options={PRE_TRADE_GRID}
            selected={emotion}
            onSelect={(value) => setEmotion(value as Emotion)}
          />

          <View style={styles.section}>
            <SectionLabel>DOES THIS FOLLOW YOUR PLAN?</SectionLabel>
            <PlanToggle
              options={['Yes', 'Mostly', 'No']}
              selected={followsPlan}
              onSelect={(value) => setFollowsPlan(value as PlanCompliance)}
            />
          </View>

          <View style={styles.section}>
            <SectionLabel>CONFIDENCE LEVEL</SectionLabel>
            <View style={styles.sliderWrap}>
              <Slider
                style={styles.sliderTrack}
                value={confidence}
                onValueChange={(val) => setConfidence(val)}
                minimumValue={0}
                maximumValue={100}
                step={1}
                minimumTrackTintColor="#F5A623"
                maximumTrackTintColor="#2A2A2A"
                thumbTintColor="#F5A623"
              />
              <Text style={styles.confidenceValue}>{confidence}%</Text>
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>Low</Text>
                <Text style={styles.sliderLabel}>High</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <SectionLabel>TRADE REASON</SectionLabel>
            <TextInput
              multiline
              placeholder="Why are you taking this trade?"
              placeholderTextColor="#444444"
              value={tradeReason}
              onChangeText={setTradeReason}
              style={styles.input}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.section}>
            <SectionLabel>OPTIONAL NOTE</SectionLabel>
            <TextInput
              multiline
              placeholder="Any additional notes..."
              placeholderTextColor="#444444"
              value={optionalNote}
              onChangeText={setOptionalNote}
              style={styles.input}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        <Pressable
          style={[styles.button, !canSave && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={!canSave}
        >
          <Text style={styles.buttonText}>Log Trade Entry</Text>
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
  sliderWrap: {
    marginTop: 4,
  },
  sliderTrack: {
    width: '100%',
    height: 40,
  },
  confidenceValue: {
    marginTop: 8,
    textAlign: 'center',
    color: Colors.gold,
    fontSize: 18,
  },
  sliderLabels: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    color: Colors.textMuted,
    fontSize: 13,
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
  button: {
    height: 56,
    marginHorizontal: Spacing.screenH,
    marginBottom: Spacing.safeBottom,
    borderRadius: Radius.button,
    backgroundColor: Colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: Colors.base,
    fontSize: 16,
    fontWeight: '700',
  },
});
