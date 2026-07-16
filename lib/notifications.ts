import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { supabase } from './supabase';
import type { Reminder } from './types';

const ENABLED_KEY = 'notifications_enabled'; // 'on' (varsayılan) | 'off'

// Uygulama öndeyken de bildirim gösterilsin
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function notificationsEnabled(): Promise<boolean> {
  return (await AsyncStorage.getItem(ENABLED_KEY)) !== 'off';
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('reminders', {
    name: 'İlaç Hatırlatıcıları',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
  });
}

// İzin durumu; prompt=true ise kullanıcıya sor
export async function ensurePermission(prompt: boolean): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!prompt) return false;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

// Bizim gün formatı (1=Pzt..7=Paz) → Expo weekday (1=Paz..7=Cmt)
function toExpoWeekday(day: number): number {
  return (day % 7) + 1;
}

function parseTime(remindTime: string): { hour: number; minute: number } {
  const [h, m] = remindTime.split(':').map((n) => parseInt(n, 10));
  return { hour: h || 0, minute: m || 0 };
}

async function scheduleReminder(reminder: Reminder, language: 'tr' | 'en') {
  const { hour, minute } = parseTime(reminder.remind_time);
  for (const day of reminder.repeat_days) {
    await Notifications.scheduleNotificationAsync({
      identifier: `reminder-${reminder.id}-${day}`,
      content: {
        title: language === 'en' ? 'Medicine Time 💊' : 'İlaç Vakti 💊',
        body: language === 'en'
          ? `Time for ${reminder.drug_name}!${reminder.notes ? ` (${reminder.notes})` : ''}`
          : `${reminder.drug_name} zamanı!${reminder.notes ? ` (${reminder.notes})` : ''}`,
        sound: 'default',
        data: { reminder_id: reminder.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: toExpoWeekday(day),
        hour,
        minute,
        channelId: Platform.OS === 'android' ? 'reminders' : undefined,
      },
    });
  }
}

// Tek doğruluk kaynağı: her değişiklikte hepsini iptal edip DB'den yeniden kur.
// (Hatırlatıcı sayısı küçük olduğu için en sağlam yöntem bu.)
export async function syncAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!(await notificationsEnabled())) return;
  if (!(await ensurePermission(false))) return;
  await ensureAndroidChannel();

  const { data: reminders } = await supabase
    .from('medication_reminders')
    .select('*')
    .eq('is_active', true);

  const { data: profile } = await supabase
    .from('profiles')
    .select('language')
    .maybeSingle();
  const language: 'tr' | 'en' = profile?.language === 'en' ? 'en' : 'tr';

  for (const r of (reminders ?? []) as Reminder[]) {
    await scheduleReminder(r, language);
  }

  // Haftalık test hakkı bildirimi — her Pazartesi 09:00
  await Notifications.scheduleNotificationAsync({
    identifier: 'weekly-quota-reset',
    content: {
      title: language === 'en' ? 'Your check renewed 🎉' : 'Test hakkın yenilendi 🎉',
      body: language === 'en'
        ? 'You have 1 free drug check this week.'
        : 'Bu hafta 1 ücretsiz ilaç testi hakkın var.',
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 2, // Pazartesi
      hour: 9,
      minute: 0,
      channelId: Platform.OS === 'android' ? 'reminders' : undefined,
    },
  });
}

// Ayarlar ekranındaki anahtar için
export async function setNotificationsEnabled(enabled: boolean): Promise<boolean> {
  await AsyncStorage.setItem(ENABLED_KEY, enabled ? 'on' : 'off');
  if (!enabled) {
    await Notifications.cancelAllScheduledNotificationsAsync();
    return true;
  }
  const granted = await ensurePermission(true);
  if (!granted) {
    await AsyncStorage.setItem(ENABLED_KEY, 'off');
    return false;
  }
  await syncAllNotifications();
  return true;
}
