import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

function isExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Request permission from the user
export async function requestNotificationPermission(): Promise<boolean> {
  if (isExpoGo()) {
    console.log(
      'Notifications not supported in Expo Go — use a development build to test notifications.',
    );
    return false;
  }
  if (!Device.isDevice) return false;

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('edgeflow', {
      name: 'EdgeFlow',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: null,
    });
  }

  return true;
}

// Cancel all existing scheduled notifications
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Schedule both daily notifications
// Notification 1: Morning quote — fires every day at 8:00 AM
// Notification 2: Streak reminder — fires every day at 7:00 PM
export async function scheduleEdgeFlowNotifications(): Promise<void> {
  if (isExpoGo()) return;
  await cancelAllNotifications();

  const MORNING_QUOTES = [
    'Your edge is patience, not speed.',
    'A missed trade is better than an emotional trade.',
    'Protect your process before you protect your profits.',
    'Your rules are the only edge that compounds.',
    'Discipline is the bridge between your plan and your results.',
    'The market rewards consistency, not brilliance.',
    'Every impulsive trade is a vote against your future self.',
    'Slow down. The best trades wait for you.',
    'Your journal is your most honest trading partner.',
    'Control what you can: your process, not the outcome.',
  ];

  // Pick a deterministic quote based on today's date
  const today = new Date();
  const dateString = today.toISOString().split('T')[0];
  const charSum = dateString
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const quoteIndex = charSum % MORNING_QUOTES.length;
  const todayQuote = MORNING_QUOTES[quoteIndex];

  const androidChannel = Platform.OS === 'android' ? { channelId: 'edgeflow' } : {};

  // NOTIFICATION 1 — Morning motivational quote at 8:00 AM daily
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'EdgeFlow',
      body: todayQuote,
      data: { type: 'morning_quote' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 8,
      minute: 0,
      ...androidChannel,
    },
  });

  // NOTIFICATION 2 — Streak reminder at 7:00 PM daily
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Don't break your streak",
      body: 'Have you logged your trades today? Keep your discipline streak alive.',
      data: { type: 'streak_reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 19,
      minute: 0,
      ...androidChannel,
    },
  });
}

// Disable all notifications and cancel scheduled ones
export async function disableNotifications(): Promise<void> {
  if (isExpoGo()) return;
  await cancelAllNotifications();
}
