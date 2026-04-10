/**
 * [id].tsx
 * Entry detail screen — read-only view for one journal row by route id.
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getEntries } from '../../src/storage/storage';
import { Colors, Spacing } from '../../src/theme';
import type { TradeEntry } from '../../src/types';
import { formatDateLabel } from '../../src/utils/dateUtils';
import { normalizeEntryIdParam } from '../../src/utils/validate';

function Section({
  title,
  fields,
}: {
  title: string;
  fields: { label: string; value: string }[];
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>
        {fields.map((field, index) => (
          <View key={`${title}-${field.label}`}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{field.label}</Text>
              <Text style={styles.fieldValue}>{field.value}</Text>
            </View>
            {index !== fields.length - 1 ? <View style={styles.divider} /> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

export default function EntryDetailScreen() {
  const router = useRouter();
  // Expo Router fills `id` from /entry/[id]; may be string or array
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const entryId = normalizeEntryIdParam(params.id);
  const [isLoading, setIsLoading] = useState(true);
  const [entry, setEntry] = useState<TradeEntry | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadEntry = async () => {
        if (!entryId) {
          setEntry(null);
          setIsLoading(false);
          return;
        }

        try {
          const entries = await getEntries();
          setEntry(entries.find((item) => item.id === entryId) ?? null);
        } catch {
          setEntry(null);
        } finally {
          setIsLoading(false);
        }
      };

      loadEntry();
    }, [entryId]),
  );

  const sections = useMemo(() => {
    if (!entry) {
      return [];
    }

    return [
      {
        title: 'ENTRY',
        fields: [
          { label: 'Date', value: formatDateLabel(entry.createdAt) },
          { label: 'Pre-trade emotion', value: entry.preTradeEmotion },
          { label: 'Follows plan before', value: entry.followsPlanBefore },
          { label: 'Confidence level', value: `${entry.confidenceLevel}%` },
        ],
      },
      {
        title: 'NOTES',
        fields: [
          { label: 'Trade reason', value: entry.tradeReason || 'N/A' },
          { label: 'Optional note', value: entry.optionalNote || 'N/A' },
        ],
      },
      {
        title: 'REFLECTION',
        fields: [
          { label: 'Result', value: entry.result ?? 'Pending' },
          { label: 'Follows plan after', value: entry.followsPlanAfter ?? 'Pending' },
          { label: 'Post-trade emotion', value: entry.postTradeEmotion ?? 'Pending' },
          { label: 'Discipline type', value: entry.disciplineType ?? 'Pending' },
          { label: 'Lesson learned', value: entry.lessonLearned || 'N/A' },
          { label: 'Would take again', value: entry.wouldTakeAgain ?? 'Pending' },
          {
            label: 'Reflection completed',
            value: entry.reflectionCompleted ? 'Yes' : 'No',
          },
        ],
      },
    ];
  }, [entry]);

  if (isLoading) {
    return <SafeAreaView style={styles.safeArea} />;
  }

  // Bad id or deleted row — offer back instead of crashing
  if (!entry) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.missingContainer}>
          <Text style={styles.missingText}>Entry not found</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Text style={styles.back}>←</Text>
          </Pressable>
          <Text style={styles.title}>Entry Detail</Text>
        </View>

        {sections.map((section) => (
          <Section key={section.title} title={section.title} fields={section.fields} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.base,
  },
  scroll: {
    flex: 1,
    backgroundColor: Colors.base,
  },
  container: {
    paddingTop: Spacing.safeTop,
    paddingBottom: Spacing.safeBottom,
    paddingHorizontal: Spacing.screenH,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 24,
  },
  back: {
    color: Colors.textPrimary,
    fontSize: 24,
    lineHeight: 24,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
    color: Colors.gold,
    fontSize: 11,
    letterSpacing: 1.5,
  },
  sectionBody: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  field: {
    padding: 16,
  },
  fieldLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  fieldValue: {
    marginTop: 8,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#1E1E1E',
  },
  missingContainer: {
    flex: 1,
    backgroundColor: Colors.base,
    paddingTop: Spacing.safeTop,
    paddingBottom: Spacing.safeBottom,
    paddingHorizontal: Spacing.screenH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  missingText: {
    color: Colors.textPrimary,
    fontSize: 18,
  },
  backButton: {
    marginTop: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  backButtonText: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
});
