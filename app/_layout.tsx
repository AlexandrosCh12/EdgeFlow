/**
 * _layout.tsx
 * Root layout: loads settings, gates onboarding vs main stack, base background.
 */

import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState, View } from 'react-native';

import { getSettings } from '../src/storage/storage';
import { Colors } from '../src/theme';
import type { AppSettings } from '../src/types';
import {
  disableNotifications,
  requestNotificationPermission,
  scheduleEdgeFlowNotifications,
} from '../src/utils/notifications';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      const loaded = await getSettings();
      if (!isMounted) {
        return;
      }

      setSettings(loaded);
      setIsReady(true);
    };

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') {
        void getSettings().then(setSettings);
      }
    });
    return () => sub.remove();
  }, [isReady]);

  useEffect(() => {
    if (!settings) {
      return;
    }
    if (settings.remindersEnabled) {
      void requestNotificationPermission().then((granted) => {
        if (granted) {
          void scheduleEdgeFlowNotifications();
        }
      });
    } else {
      void disableNotifications();
    }
  }, [settings?.remindersEnabled]);

  // Re-read storage whenever segments change so onboarding state stays in sync after
  // completing onboarding (avoids stale onboardingComplete sending users back to slides).
  useEffect(() => {
    if (!isReady) {
      return;
    }
    let cancelled = false;
    const routeKey = segments.join('/');
    void (async () => {
      const next = await getSettings();
      if (cancelled) {
        return;
      }
      setSettings(next);

      const done = Boolean(next.onboardingComplete) === true;
      const currentRoute = routeKey;

      if (!done && currentRoute !== 'onboarding') {
        router.replace('/onboarding');
        return;
      }
      if (done && currentRoute === 'onboarding') {
        router.replace('/');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isReady, router, segments.join('/')]);

  // Blank base color until settings load — avoids flash of wrong screen
  if (!isReady) {
    return <View style={{ flex: 1, backgroundColor: Colors.base }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.base }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.base },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="pretrade" />
        <Stack.Screen name="reflection" />
        <Stack.Screen name="history" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="entry/[id]" />
      </Stack>
    </View>
  );
}
