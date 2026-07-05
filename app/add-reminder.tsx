import DateTimePicker from '@react-native-community/datetimepicker';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { FormInput, PRIMARY, PrimaryButton } from '@/components/form';
import { Palette, Radius } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { ensurePermission, syncAllNotifications } from '@/lib/notifications';
import { supabase } from '@/lib/supabase';
import { DAY_LABELS } from '@/lib/types';

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
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const [drugName, setDrugName] = useState('');
  const [time, setTime] = useState(() => timeToDate('08:30:00'));
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('medication_reminders')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          Alert.alert('Hata', 'Hatırlatıcı yüklenemedi.');
          router.back();
          return;
        }
        setDrugName(data.drug_name);
        setTime(timeToDate(data.remind_time));
        setDays(data.repeat_days ?? [1, 2, 3, 4, 5, 6, 7]);
        setNotes(data.notes ?? '');
      });
  }, [id]);

  function toggleDay(day: number) {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  async function handleSave() {
    if (!drugName.trim()) {
      Alert.alert('Eksik bilgi', 'İlaç adını gir.');
      return;
    }
    if (days.length === 0) {
      Alert.alert('Eksik bilgi', 'En az bir gün seç.');
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

    const { error } = isEdit
      ? await supabase.from('medication_reminders').update(payload).eq('id', id)
      : await supabase
          .from('medication_reminders')
          .insert({ ...payload, user_id: session!.user.id });

    if (error) {
      setSaving(false);
      Alert.alert('Hata', 'Kaydedilemedi: ' + error.message);
      return;
    }

    // Bildirim izni iste ve zamanla
    const granted = await ensurePermission(true);
    await syncAllNotifications();
    setSaving(false);

    if (!granted) {
      Alert.alert(
        'Bildirim izni yok',
        'Hatırlatıcı kaydedildi ama bildirim izni verilmediği için uyarı gelmeyecek. Ayarlar → AllergyGuard → Bildirimler yolundan izin verebilirsin.',
        [{ text: 'Tamam', onPress: () => router.back() }]
      );
      return;
    }
    router.back();
  }

  return (
    <>
      <Stack.Screen
        options={{ title: isEdit ? 'Hatırlatıcıyı Düzenle' : 'Hatırlatıcı Ekle' }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <FormInput
            label="İlaç adı *"
            value={drugName}
            onChangeText={setDrugName}
            placeholder="örn. Aspirin"
          />

          <Text style={styles.label}>Saat</Text>
          <View style={styles.timePicker}>
            <DateTimePicker
              value={time}
              mode="time"
              display="spinner"
              onChange={(_, selected) => selected && setTime(selected)}
              minuteInterval={5}
            />
          </View>

          <Text style={styles.label}>Günler</Text>
          <View style={styles.dayRow}>
            {DAY_LABELS.map((label, i) => {
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
              <Text style={styles.quickLink}>Her gün</Text>
            </Pressable>
            <Pressable onPress={() => setDays([1, 2, 3, 4, 5])}>
              <Text style={styles.quickLink}>Hafta içi</Text>
            </Pressable>
          </View>

          <FormInput
            label="Not (opsiyonel)"
            value={notes}
            onChangeText={setNotes}
            placeholder="örn. Yemekten sonra"
          />

          <PrimaryButton
            title={isEdit ? 'Kaydet' : 'Hatırlatıcı Ekle'}
            onPress={handleSave}
            loading={saving}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  content: {
    padding: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.textSecondary,
    marginBottom: 6,
  },
  timePicker: {
    alignItems: 'center',
    marginBottom: 16,
  },
  dayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  dayChip: {
    borderWidth: 1,
    borderColor: Palette.borderStrong,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dayChipSelected: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.textSecondary,
  },
  dayTextSelected: {
    color: Palette.white,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  quickLink: {
    color: PRIMARY,
    fontWeight: '600',
    fontSize: 13,
  },
});
