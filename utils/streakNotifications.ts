import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { formatDateKey, getYesterdayDateKey } from './gameLogic';
import type { Stats } from './storage';

const REMINDER_STATE_KEY = '@huely/streakReminder';
const REMINDER_CHANNEL_ID = 'streak-reminders';
const STREAK_REMINDER_KIND = 'huely-streak-reminder';
const REMINDER_HOUR = 19;
const REMINDER_MINUTE = 0;
const MISSED_REMINDER_DELAY_MS = 60 * 1000;

interface StreakReminderState {
  notificationId: string | null;
  scheduledForDate: string | null;
}

const DEFAULT_REMINDER_STATE: StreakReminderState = {
  notificationId: null,
  scheduledForDate: null,
};

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

async function loadReminderState(): Promise<StreakReminderState> {
  const raw = await AsyncStorage.getItem(REMINDER_STATE_KEY);
  if (!raw) return DEFAULT_REMINDER_STATE;

  try {
    return { ...DEFAULT_REMINDER_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_REMINDER_STATE;
  }
}

async function saveReminderState(state: StreakReminderState): Promise<void> {
  await AsyncStorage.setItem(REMINDER_STATE_KEY, JSON.stringify(state));
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function atReminderTime(date: Date): Date {
  const reminder = new Date(date);
  reminder.setHours(REMINDER_HOUR, REMINDER_MINUTE, 0, 0);
  return reminder;
}

function getNextReminderDate(stats: Stats, now: Date): Date | null {
  if (stats.currentStreak <= 0) return null;

  const today = formatDateKey(now);

  if (stats.lastPlayedDate === today) {
    return atReminderTime(addDays(now, 1));
  }

  if (stats.lastPlayedDate === getYesterdayDateKey(now)) {
    const todayReminder = atReminderTime(now);
    if (todayReminder.getTime() > now.getTime()) {
      return todayReminder;
    }

    const delayedReminder = new Date(now.getTime() + MISSED_REMINDER_DELAY_MS);
    return formatDateKey(delayedReminder) === today ? delayedReminder : null;
  }

  return null;
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: 'Streak reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

function allowsNotifications(status: Notifications.NotificationPermissionsStatus): boolean {
  return (
    status.granted ||
    status.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL ||
    status.ios?.status === Notifications.IosAuthorizationStatus.EPHEMERAL
  );
}

async function ensurePermissions(): Promise<boolean> {
  await ensureAndroidChannel();

  const existing = await Notifications.getPermissionsAsync();
  if (allowsNotifications(existing)) return true;

  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: false,
    },
  });
  return allowsNotifications(requested);
}

function isStreakReminder(request: Notifications.NotificationRequest): boolean {
  return request.content.data?.kind === STREAK_REMINDER_KIND;
}

async function cancelTrackedReminder(): Promise<void> {
  const state = await loadReminderState();

  if (state.notificationId) {
    await Notifications.cancelScheduledNotificationAsync(state.notificationId).catch(() => {});
  }

  const scheduled = await Notifications.getAllScheduledNotificationsAsync().catch(() => []);
  await Promise.all(
    scheduled
      .filter(isStreakReminder)
      .map((request) =>
        Notifications.cancelScheduledNotificationAsync(request.identifier).catch(() => {}),
      ),
  );

  await saveReminderState(DEFAULT_REMINDER_STATE);
}

async function syncStreakReminderInternal(stats: Stats, now: Date): Promise<void> {
  if (Platform.OS === 'web') return;

  const reminderDate = getNextReminderDate(stats, now);
  if (!reminderDate) {
    await cancelTrackedReminder();
    return;
  }

  const reminderDateKey = formatDateKey(reminderDate);
  const state = await loadReminderState();
  if (state.notificationId && state.scheduledForDate === reminderDateKey) return;

  const hasPermission = await ensurePermissions();
  if (!hasPermission) {
    await cancelTrackedReminder();
    return;
  }

  await cancelTrackedReminder();

  const streakLabel = `${stats.currentStreak}-day`;
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Keep your Huely streak alive',
      body: `Today's color is waiting. Play before midnight to keep your ${streakLabel} streak.`,
      data: {
        kind: STREAK_REMINDER_KIND,
        scheduledForDate: reminderDateKey,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
      channelId: REMINDER_CHANNEL_ID,
    },
  });

  await saveReminderState({
    notificationId,
    scheduledForDate: reminderDateKey,
  });
}

export async function syncStreakReminder(stats: Stats, now: Date = new Date()): Promise<void> {
  try {
    await syncStreakReminderInternal(stats, now);
  } catch {
    // Streak reminders should never block the game if notification APIs are unavailable.
  }
}
