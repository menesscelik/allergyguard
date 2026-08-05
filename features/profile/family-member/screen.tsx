import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { getMemberReminders, getMemberStats, type AdherenceStats } from './service';
import { styles } from './styles';

import { AnimatedCounter } from '@/components/animated-counter';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette } from '@/constants/theme';
import { useLocalization } from '@/lib/localization-context';
import { useResponsiveLayout } from '@/lib/responsive';
import type { Reminder } from '@/lib/types';

function formatTime(t: string) {
  return t.slice(0, 5);
}

export default function FamilyMemberScreen() {
  const { t, language } = useLocalization();
  const layout = useResponsiveLayout();
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();

  const dayLabels = language === 'tr'
    ? ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [stats, setStats] = useState<AdherenceStats>({ streak: 0, adherence: null, taken: 0, skipped: 0 });
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      Promise.all([getMemberReminders(id), getMemberStats(id)])
        .then(([r, s]) => {
          setReminders(r);
          setStats(s);
        })
        .catch(() => {})
        .finally(() => setLoaded(true));
    }, [id])
  );

  function reminderTimes(item: Reminder) {
    return (item.remind_times?.length ? item.remind_times : [item.remind_time]).map(formatTime).join('  ·  ');
  }

  function reminderDays(item: Reminder) {
    if (item.repeat_days.length === 7) return t('reminders.everyday');
    return [...item.repeat_days].sort((a, b) => a - b).map((d) => dayLabels[d - 1]).join(', ');
  }

  return (
    <>
      <Stack.Screen options={{ title: name || t('family.memberTitle') }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingHorizontal: layout.pagePadding }]}
        contentInsetAdjustmentBehavior="automatic">
        {/* Uyum kartı */}
        <View style={[styles.statsCard, layout.centerContent]}>
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

        <Text style={[styles.sectionTitle, layout.centerContent]}>{t('family.memberReminders')}</Text>

        {reminders.length === 0 ? (
          <Text style={[styles.empty, layout.centerContent]}>
            {loaded ? t('family.memberEmpty') : ''}
          </Text>
        ) : (
          reminders.map((item) => (
            <View key={item.id} style={[styles.card, layout.centerContent, !item.is_active && styles.cardOff]}>
              <View style={styles.cardIcon}>
                <IconSymbol name="alarm.fill" size={18} color={Palette.warning} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.time}>{reminderTimes(item)}</Text>
                <Text style={styles.drugName}>{item.drug_name}</Text>
                <Text style={styles.days}>{reminderDays(item)}</Text>
                {!!item.notes && <Text style={styles.notes}>{item.notes}</Text>}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </>
  );
}
