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
import { useAuth } from '@/lib/auth-context';
import { useLocalization } from '@/lib/localization-context';

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

export default function AddReminderScreen() {
  const { session } = useAuth();
  const { t, language } = useLocalization();
  const dayLabels = language === 'tr'
    ? ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const [drugName, setDrugName] = useState('');
  const [time, setTime] = useState(() => timeToDate('08:30:00'));
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
        setTime(timeToDate(data.remind_time));
        setDays(data.repeat_days ?? [1, 2, 3, 4, 5, 6, 7]);
        setNotes(data.notes ?? '');
      });
  }, [id, t]);

  function toggleDay(day: number) {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  async function handleSave() {
    if (!drugName.trim()) {
      Alert.alert(t('common.error'), t('allergies.drugName'));
      return;
    }
    if (days.length === 0) {
      Alert.alert(t('common.error'), t('reminders.days'));
      return;
    }
    setSaving(true);

    const payload = {
      drug_name: drugName.trim(),
      remind_time: dateToTime(time),
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
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.introCard}>
            <View style={styles.introIcon}><Text style={styles.introEmoji}>⏰</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.introTitle}>{t('reminders.title')}</Text>
              <Text style={styles.introText}>{t('reminders.subtitle')}</Text>
            </View>
          </View>
          <FormInput
            label={t('allergies.drugName')}
            value={drugName}
            onChangeText={setDrugName}
            placeholder={t('allergies.drugPlaceholder')}
          />

          <Text style={styles.label}>{t('reminders.time')}</Text>
          <View style={styles.timePicker}>
            <DateTimePicker
              value={time}
              mode="time"
              display="spinner"
              onChange={(_, selected) => selected && setTime(selected)}
              minuteInterval={5}
            />
          </View>

          <Text style={styles.label}>{t('reminders.days')}</Text>
          <View style={styles.dayRow}>
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
          <View style={styles.quickRow}>
            <Pressable onPress={() => setDays([1, 2, 3, 4, 5, 6, 7])}>
              <Text style={styles.quickLink}>{t('reminders.everyday')}</Text>
            </Pressable>
            <Pressable onPress={() => setDays([1, 2, 3, 4, 5])}>
              <Text style={styles.quickLink}>{t('reminders.weekdays')}</Text>
            </Pressable>
          </View>

          <FormInput
            label={t('reminders.notes')}
            value={notes}
            onChangeText={setNotes}
            placeholder={t('reminders.notesPlaceholder')}
          />

          <PrimaryButton
            title={isEdit ? t('common.save') : t('reminders.addTitle')}
            onPress={handleSave}
            loading={saving}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
