import { styles } from './styles';
import {
  deleteReminder,
  listReminders,
  listTodayIntakeLogs,
  markReminderIntake,
  setReminderActive,
} from './service';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';

import { PRIMARY } from '@/components/form';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette } from '@/constants/theme';
import { useLocalization } from '@/lib/localization-context';
import { useResponsiveLayout } from '@/lib/responsive';
import type { IntakeStatus, MedicationIntakeLog, Reminder } from '@/lib/types';

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
  const layout = useResponsiveLayout();
  const dayLabels = language === 'tr'
    ? ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [todayLogs, setTodayLogs] = useState<MedicationIntakeLog[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const [{ data, error }, logsResult] = await Promise.all([
      listReminders(),
      listTodayIntakeLogs(),
    ]);
    if (!error && data) setReminders(data as Reminder[]);
    if (!logsResult.error && logsResult.data) setTodayLogs(logsResult.data);
    setLoaded(true);
  }, []);

  const logsByReminder = useMemo(() => {
    return todayLogs.reduce<Record<string, MedicationIntakeLog>>((acc, log) => {
      acc[log.reminder_id] = log;
      return acc;
    }, {});
  }, [todayLogs]);

  const calendar = useMemo(() => {
    return dayLabels.map((label, index) => {
      const dayNumber = index + 1;
      const count = reminders.filter((item) => item.is_active && item.repeat_days.includes(dayNumber)).length;
      return { label, count };
    });
  }, [dayLabels, reminders]);

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

  async function markIntake(item: Reminder, status: IntakeStatus) {
    const previous = todayLogs;
    const optimisticLog: MedicationIntakeLog = {
      id: `${item.id}-${status}`,
      user_id: item.user_id,
      reminder_id: item.id,
      status,
      taken_for_date: new Date().toLocaleDateString('en-CA'),
      note: null,
      created_at: new Date().toISOString(),
    };

    setTodayLogs((prev) => [
      ...prev.filter((log) => log.reminder_id !== item.id),
      optimisticLog,
    ]);

    const { error } = await markReminderIntake(item.id, status);
    if (error) {
      setTodayLogs(previous);
      Alert.alert(t('common.error'), error.message);
    } else {
      load();
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View
        style={[
          styles.header,
          {
            marginHorizontal: layout.pagePadding,
            padding: layout.heroPadding,
            gap: layout.cardGap,
          },
        ]}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.eyebrow}>{t('reminders.eyebrow')}</Text>
          <Text style={[styles.title, { fontSize: layout.titleSize }]}>{t('reminders.title')}</Text>
          <Text style={styles.subtitle}>{t('reminders.subtitle')}</Text>
        </View>
        <View style={[styles.clockBadge, { width: layout.badgeSize, height: layout.badgeSize }]}>
          <Text style={styles.clockEmoji}>⏰</Text>
        </View>
      </View>

      <View
        style={[
          styles.calendarCard,
          {
            marginHorizontal: layout.pagePadding,
            padding: layout.isCompact ? 12 : 14,
          },
        ]}>
        <View style={styles.calendarHeader}>
          <Text style={styles.calendarTitle}>{t('reminders.calendarTitle')}</Text>
          <Text style={styles.calendarSubtitle}>{t('reminders.calendarSubtitle')}</Text>
        </View>
        <View style={styles.calendarDays}>
          {calendar.map((day) => (
            <View key={day.label} style={styles.dayPill}>
              <Text style={styles.dayLabel}>{day.label}</Text>
              <Text style={styles.dayCount}>{day.count}</Text>
            </View>
          ))}
        </View>
      </View>

      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingHorizontal: layout.pagePadding }]}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.duration(220).delay(Math.min(index, 8) * 35)}
            layout={LinearTransition.duration(180)}>
            <Pressable
              style={[styles.card, { padding: layout.isCompact ? 12 : 16 }]}
              onPress={() =>
                router.push({ pathname: '/add-reminder', params: { id: item.id } })
              }
              onLongPress={() => confirmDelete(item)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.time}>{formatTime(item.remind_time)}</Text>
                <Text style={styles.drugName}>{item.drug_name}</Text>
                <Text style={styles.days}>{formatDays(item.repeat_days, dayLabels, t('reminders.everyday'))}</Text>
                {!!item.notes && <Text style={styles.notes}>{item.notes}</Text>}
                <View style={styles.intakeRow}>
                  {(['taken', 'skipped'] as const).map((status) => {
                    const selected = logsByReminder[item.id]?.status === status;
                    return (
                      <Pressable
                        key={status}
                        style={[
                          styles.intakeButton,
                          status === 'taken' ? styles.intakeTaken : styles.intakeSkipped,
                          selected && styles.intakeSelected,
                        ]}
                        onPress={() => markIntake(item, status)}>
                        <Text
                          style={[
                            styles.intakeText,
                            status === 'taken' ? styles.intakeTakenText : styles.intakeSkippedText,
                            selected && styles.intakeSelectedText,
                          ]}>
                          {selected ? '✓ ' : ''}{t(`reminders.${status}`)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
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
          </Animated.View>
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
