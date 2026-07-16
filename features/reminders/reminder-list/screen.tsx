import { styles } from './styles';
import { deleteReminder, listReminders, setReminderActive } from './service';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PRIMARY } from '@/components/form';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette } from '@/constants/theme';
import { useLocalization } from '@/lib/localization-context';
import type { Reminder } from '@/lib/types';

function formatTime(t: string): string {
  return t.slice(0, 5); // "08:30:00" → "08:30"
}

function formatDays(days: number[], labels: string[], everyDay: string): string {
  if (days.length === 7) return everyDay;
  return [...days]
    .sort((a, b) => a - b)
    .map((d) => labels[d - 1])
    .join(', ');
}

export default function RemindersScreen() {
  const { t, language } = useLocalization();
  const dayLabels = language === 'tr'
    ? ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await listReminders();
    if (!error && data) setReminders(data as Reminder[]);
    setLoaded(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function toggleActive(item: Reminder, value: boolean) {
    setReminders((prev) =>
      prev.map((r) => (r.id === item.id ? { ...r, is_active: value } : r))
    );
    const { error } = await setReminderActive(item.id, value);
    if (error) {
      Alert.alert(t('common.error'), error.message);
      load();
      return;
    }
  }

  function confirmDelete(item: Reminder) {
    Alert.alert(t('reminders.deleteTitle'), t('reminders.deleteMessage', { name: item.drug_name }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          const { error } = await deleteReminder(item.id);
          if (error) {
            Alert.alert(t('common.error'), error.message);
            return;
          }
          setReminders((prev) => prev.filter((r) => r.id !== item.id));
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>{t('reminders.eyebrow')}</Text>
          <Text style={styles.title}>{t('reminders.title')}</Text>
          <Text style={styles.subtitle}>{t('reminders.subtitle')}</Text>
        </View>
        <View style={styles.clockBadge}>
          <Text style={styles.clockEmoji}>⏰</Text>
        </View>
      </View>

      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() =>
              router.push({ pathname: '/add-reminder', params: { id: item.id } })
            }
            onLongPress={() => confirmDelete(item)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.time}>{formatTime(item.remind_time)}</Text>
              <Text style={styles.drugName}>{item.drug_name}</Text>
              <Text style={styles.days}>{formatDays(item.repeat_days, dayLabels, t('reminders.everyday'))}</Text>
              {!!item.notes && <Text style={styles.notes}>{item.notes}</Text>}
            </View>
            <View style={styles.cardRight}>
              <Switch
                value={item.is_active}
                onValueChange={(v) => toggleActive(item, v)}
                trackColor={{ true: PRIMARY }}
              />
              <Pressable hitSlop={8} onPress={() => confirmDelete(item)}>
                <IconSymbol name="trash" size={20} color={Palette.textMuted} />
              </Pressable>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          loaded ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>⏰</Text>
              <Text style={styles.emptyTitle}>{t('reminders.emptyTitle')}</Text>
              <Text style={styles.emptyText}>{t('reminders.emptyText')}</Text>
            </View>
          ) : null
        }
      />

      <Pressable style={styles.fab} onPress={() => router.push('/add-reminder')}>
        <IconSymbol name="plus" size={28} color={Palette.white} />
      </Pressable>
    </SafeAreaView>
  );
}
