import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  if (!Device.isDevice) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  let final = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    final = status;
  }
  if (final !== 'granted') return false;
  return true;
}

export async function scheduleWeatherAlert(title: string, body: string, triggerHours: number = 7) {
  const now = new Date();
  const scheduled = new Date(now);
  scheduled.setHours(triggerHours, 0, 0, 0);
  if (scheduled <= now) scheduled.setDate(scheduled.getDate() + 1);

  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true, priority: Notifications.AndroidNotificationPriority.HIGH },
    trigger: { date: scheduled, type: Notifications.SchedulableTriggerInputTypes.DATE },
  });
}

export async function scheduleIrrigationReminder(temperature: number) {
  const title = temperature > 35 ? 'Urgent: Irrigation Needed' : 'Irrigation Reminder';
  const body = temperature > 35
    ? `High heat (${temperature}°C) expected today. Consider irrigating crops early morning or evening.`
    : `Check soil moisture — your crops may need irrigation today.`;
  await scheduleWeatherAlert(title, body, 6);
}

export async function cancelAllScheduled() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) return null;
  const granted = await requestPermissions();
  if (!granted) return null;

  try {
    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  } catch {
    return null;
  }
}

export { Notifications };
