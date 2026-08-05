import { styles } from './styles';
import {
  deleteReminder,
  getAdherenceStats,
  listReminders,
  listTodayIntakeLogs,
  markReminderIntake,
  setReminderActive,
  type AdherenceStats,
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';

import { AnimatedCounter } from '@/components/animated-counter';
import { PRIMARY } from '@/components/form';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { hapticLight, hapticSuccess } from '@/lib/haptics';
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
  const insets = useSafeAreaInsets();
  const tabBarClearance = Math.max(insets.bottom, 8) + 72;
  const dayLabels = language === 'tr'
    ? ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [todayLogs, setTodayLogs] = useState<MedicationIntakeLog[]>([]);
  const [stats, setStats] = useState<AdherenceStats>({ streak: 0, adherence: null, taken: 0, skipped: 0 });
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const [{ data, error }, logsResult, statsResult] = await Promise.all([
      listReminders(),
      listTodayIntakeLogs(),
      getAdherenceStats().catch(() => null),
    ]);
    if (!error && data) setReminders(data as Reminder[]);
    if (!logsResult.error && logsResult.data) setTodayLogs(logsResult.data);
    if (statsResult) setStats(statsResult);
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
    if (status === 'taken') hapticSuccess();
    else hapticLight();
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
          <IconSymbol name="alarm.fill" size={28} color={Palette.warning} />
        </View>
      </View>

      {loaded && stats.taken + stats.skipped > 0 && (
        <View style={[styles.statsCard, { marginHorizontal: layout.pagePadding }]}>
          <View style={styles.statItem}>
            <View style={styles.statValueRow}>
              <IconSymbol name="flame.fill" size={20} color={Palette.warning} />
              <AnimatedCounter value={stats.streak} style={styles.statValue} />
            </View>
            <Text style={styles.statLabel}>{t('reminders.stats.streak')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            {stats.adherence != null ? (
              <AnimatedCounter value={stats.adherence} prefix="%" style={[styles.statValue, { color: Palette.success }]} />
            ) : (
              <Text style={[styles.statValue, { color: Palette.success }]}>—</Text>
            )}
            <Text style={styles.statLabel}>{t('reminders.stats.adherence')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <AnimatedCounter value={stats.taken} style={styles.statValue} />
            <Text style={styles.statLabel}>{t('reminders.stats.taken')}</Text>
          </View>
        </View>
      )}

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
        contentContainerStyle={[
          styles.list,
          {
            paddingHorizontal: layout.pagePadding,
            paddingBottom: tabBarClearance + 76,
          },
        ]}
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
                <Text style={styles.time}>
                  {(item.remind_times?.length ? item.remind_times : [item.remind_time])
                    .map(formatTime)
                    .join('  ·  ')}
                </Text>
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
              <View style={styles.emptyIcon}>
                <IconSymbol name="alarm.fill" size={32} color={Palette.warning} />
              </View>
              <Text style={styles.emptyTitle}>{t('reminders.emptyTitle')}</Text>
              <Text style={styles.emptyText}>{t('reminders.emptyText')}</Text>
            </View>
          ) : null
        }
      />

      <Pressable
        style={[styles.fab, { bottom: tabBarClearance }]}
        onPress={() => router.push('/add-reminder')}>
        <IconSymbol name="plus" size={28} color={Palette.white} />
      </Pressable>
    </SafeAreaView>
  );
}
