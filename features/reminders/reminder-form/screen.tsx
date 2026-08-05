import { styles } from './styles';
import { getReminder, saveReminder } from './service';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { FormInput, PrimaryButton } from '@/components/form';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { useLocalization } from '@/lib/localization-context';
import { useResponsiveLayout } from '@/lib/responsive';

function timeToDate(t: string): Date {
  const [h, m] = t.split(':').map((n) => parseInt(n, 10));
  const d = new Date();
  d.setHours(h || 8, m || 0, 0, 0);
  return d;
}

function dateToTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
}

function timeLabel(t: string): string {
  return t.slice(0, 5); // "08:30:00" -> "08:30"
}

export default function AddReminderScreen() {
  const { session } = useAuth();
  const { t, language } = useLocalization();
  const layout = useResponsiveLayout();
  const dayLabels = language === 'tr'
    ? ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const [drugName, setDrugName] = useState('');
  const [times, setTimes] = useState<string[]>(['08:30:00']);
  const [draft, setDraft] = useState(() => timeToDate('08:30:00'));
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getReminder(id)
      .then(({ data, error }) => {
        if (error || !data) {
          Alert.alert(t('common.error'), t('common.retry'));
          router.back();
          return;
        }
        setDrugName(data.drug_name);
        const loadedTimes: string[] = data.remind_times?.length ? data.remind_times : [data.remind_time];
        setTimes([...loadedTimes].sort());
        setDays(data.repeat_days ?? [1, 2, 3, 4, 5, 6, 7]);
        setNotes(data.notes ?? '');
      });
  }, [id, t]);

  function toggleDay(day: number) {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function addTime() {
    const value = dateToTime(draft);
    setTimes((prev) => (prev.includes(value) ? prev : [...prev, value].sort()));
  }

  function removeTime(value: string) {
    setTimes((prev) => prev.filter((v) => v !== value));
  }

  async function handleSave() {
    if (!drugName.trim()) {
      Alert.alert(t('common.error'), t('allergies.drugName'));
      return;
    }
    if (times.length === 0) {
      Alert.alert(t('common.error'), t('reminders.times'));
      return;
    }
    if (days.length === 0) {
      Alert.alert(t('common.error'), t('reminders.days'));
      return;
    }
    setSaving(true);

    const sortedTimes = [...times].sort();
    const payload = {
      drug_name: drugName.trim(),
      remind_time: sortedTimes[0],
      remind_times: sortedTimes,
      repeat_days: [...days].sort((a, b) => a - b),
      notes: notes.trim() || null,
      is_active: true,
    };

    const { error, notificationPermissionGranted } = await saveReminder(
      id,
      session!.user.id,
      payload
    );

    if (error) {
      setSaving(false);
      Alert.alert(t('common.error'), error.message);
      return;
    }

    setSaving(false);

    if (!notificationPermissionGranted) {
      Alert.alert(
        t('reminders.permissionTitle'),
        t('reminders.permissionMessage'),
        [{ text: 'Tamam', onPress: () => router.back() }]
      );
      return;
    }
    router.back();
  }

  return (
    <>
      <Stack.Screen
        options={{ title: isEdit ? t('reminders.editTitle') : t('reminders.addTitle') }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={[
            styles.content,
            { paddingHorizontal: layout.pagePadding, paddingTop: layout.cardGap },
          ]}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled">
          <View style={[styles.introCard, layout.centerContent, { padding: layout.heroPadding }]}>
            <View style={styles.introIcon}><IconSymbol name="alarm.fill" size={24} color={Palette.warning} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.introTitle}>{t('reminders.title')}</Text>
              <Text style={styles.introText}>{t('reminders.subtitle')}</Text>
            </View>
          </View>
          <View style={layout.centerContent}>
            <FormInput
              label={t('allergies.drugName')}
              value={drugName}
              onChangeText={setDrugName}
              placeholder={t('allergies.drugPlaceholder')}
            />
          </View>

          <View style={layout.centerContent}>
            <Text style={styles.label}>
              {t('reminders.times')} {times.length > 0 ? `(${t('reminders.timesCount', { count: times.length })})` : ''}
            </Text>
          </View>

          {times.length > 0 && (
            <View style={[styles.timeChips, layout.centerContent]}>
              {[...times].sort().map((value) => (
                <View key={value} style={styles.timeChip}>
                  <IconSymbol name="alarm.fill" size={14} color={Palette.warning} />
                  <Text style={styles.timeChipText}>{timeLabel(value)}</Text>
                  <Pressable hitSlop={8} onPress={() => removeTime(value)} accessibilityRole="button">
                    <IconSymbol name="trash" size={14} color={Palette.textMuted} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          <View style={[styles.timeAddRow, layout.centerContent]}>
            <DateTimePicker
              value={draft}
              mode="time"
              display={Platform.OS === 'ios' ? 'compact' : 'default'}
              onChange={(_, selected) => selected && setDraft(selected)}
              minuteInterval={5}
            />
            <Pressable style={styles.addTimeButton} onPress={addTime} accessibilityRole="button">
              <IconSymbol name="plus" size={16} color={Palette.warning} />
              <Text style={styles.addTimeText}>{t('reminders.addTime')}</Text>
            </Pressable>
          </View>

          <View style={layout.centerContent}>
            <Text style={styles.label}>{t('reminders.days')}</Text>
          </View>
          <View style={[styles.dayRow, layout.centerContent]}>
            {dayLabels.map((label, i) => {
              const day = i + 1;
              const selected = days.includes(day);
              return (
                <Pressable
                  key={day}
                  onPress={() => toggleDay(day)}
                  style={[styles.dayChip, selected && styles.dayChipSelected]}>
                  <Text style={[styles.dayText, selected && styles.dayTextSelected]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={[styles.quickRow, layout.centerContent]}>
            <Pressable onPress={() => setDays([1, 2, 3, 4, 5, 6, 7])}>
              <Text style={styles.quickLink}>{t('reminders.everyday')}</Text>
            </Pressable>
            <Pressable onPress={() => setDays([1, 2, 3, 4, 5])}>
              <Text style={styles.quickLink}>{t('reminders.weekdays')}</Text>
            </Pressable>
          </View>

          <View style={layout.centerContent}>
            <FormInput
              label={t('reminders.notes')}
              value={notes}
              onChangeText={setNotes}
              placeholder={t('reminders.notesPlaceholder')}
            />
          </View>

          <View style={layout.centerContent}>
            <PrimaryButton
              title={isEdit ? t('common.save') : t('reminders.addTitle')}
              onPress={handleSave}
              loading={saving}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
