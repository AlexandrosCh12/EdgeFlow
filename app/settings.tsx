/**
 * settings.tsx
 * Preferences, export, reset; loads and persists AppSettings from storage.
 */

import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState, type ReactNode } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  DEFAULT_SETTINGS,
  getEntries,
  getSettings,
  resetAllData,
  saveSettings,
} from '../src/storage/storage';
import { Colors, Radius, Spacing } from '../src/theme';
import type { AppSettings } from '../src/types';
import { mergeSettingsWithToggle } from '../src/utils/validate';

function GroupLabel({ children }: { children: string }) {
  return <Text style={styles.groupLabel}>{children}</Text>;
}

function Row({
  label,
  labelColor,
  right,
  onPress,
  isLast = false,
}: {
  label: string;
  labelColor?: string;
  right?: ReactNode;
  onPress?: () => void;
  isLast?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.row, !isLast && styles.rowBorder]}>
      <Text style={[styles.rowLabel, labelColor ? { color: labelColor } : null]}>
        {label}
      </Text>
      {right ?? <Text style={styles.chevron}>›</Text>}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadSettings = async () => {
        try {
          const storedSettings = await getSettings();
          setSettings(storedSettings);
        } catch {
          setSettings(DEFAULT_SETTINGS);
        }
      };

      loadSettings();
    }, []),
  );

  const updateSetting = async (
    key: keyof Pick<AppSettings, 'hapticsEnabled' | 'remindersEnabled'>,
    value: boolean,
  ) => {
    if (!settings) {
      return;
    }

    // mergeSettingsWithToggle drops non-booleans so Switch never saves strings
    const nextSettings = mergeSettingsWithToggle(settings, key, value);
    if (!nextSettings) {
      return;
    }

    setSettings(nextSettings);
    await saveSettings(nextSettings);
  };

  const handleExport = async () => {
    const entries = await getEntries();
    const payload = JSON.stringify(entries, null, 2);

    try {
      await Share.share({ message: payload });
    } catch {
      Alert.alert(
        'Export Data',
        'Could not open the share sheet. Please try again.',
      );
    }
  };

  const handleReset = () => {
    Alert.alert('Reset All Data', 'Are you sure you want to clear all data?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          // Clears entries + settings; onboarding flag false → root layout sends here
          await resetAllData();
          router.replace('/onboarding');
        },
      },
    ]);
  };

  if (!settings) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingState} />
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
          <Text style={styles.title}>Settings</Text>
        </View>

        <GroupLabel>PREFERENCES</GroupLabel>
        <View style={styles.groupCard}>
          <Row
            label="Haptics"
            right={
              <Switch
                value={settings.hapticsEnabled}
                onValueChange={(value) => updateSetting('hapticsEnabled', value)}
                trackColor={{ false: Colors.border, true: Colors.gold }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <Row
            label="Reminders"
            isLast
            right={
              <Switch
                value={settings.remindersEnabled}
                onValueChange={(value) => updateSetting('remindersEnabled', value)}
                trackColor={{ false: Colors.border, true: Colors.gold }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </View>

        <GroupLabel>DATA</GroupLabel>
        <View style={styles.groupCard}>
          <Row label="Export Data" onPress={handleExport} />
          <Row
            label="Reset All Data"
            labelColor={Colors.red}
            onPress={handleReset}
            isLast
          />
        </View>

        <GroupLabel>ABOUT</GroupLabel>
        <View style={styles.groupCard}>
          <Row
            label="Privacy Policy"
            onPress={() => Alert.alert('Privacy Policy', 'Privacy policy coming soon.')}
          />
          <Row
            label="Version"
            isLast
            right={<Text style={styles.version}>1.0.0</Text>}
          />
        </View>
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
  groupLabel: {
    marginBottom: 12,
    color: Colors.textMuted,
    fontSize: 11,
    letterSpacing: 1.5,
  },
  groupCard: {
    marginBottom: 24,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.card,
    overflow: 'hidden',
  },
  row: {
    minHeight: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E1E',
  },
  rowLabel: {
    color: Colors.textPrimary,
    fontSize: 16,
  },
  chevron: {
    color: Colors.textMuted,
    fontSize: 24,
    lineHeight: 24,
  },
  version: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  loadingState: {
    flex: 1,
    backgroundColor: Colors.base,
  },
});
