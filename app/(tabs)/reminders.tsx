import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PRIMARY } from '@/components/form';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette, Radius } from '@/constants/theme';
import { syncAllNotifications } from '@/lib/notifications';
import { supabase } from '@/lib/supabase';
import { DAY_LABELS, type Reminder } from '@/lib/types';

function formatTime(t: string): string {
  return t.slice(0, 5); // "08:30:00" → "08:30"
}

function formatDays(days: number[]): string {
  if (days.length === 7) return 'Her gün';
  return [...days]
    .sort((a, b) => a - b)
    .map((d) => DAY_LABELS[d - 1])
    .join(', ');
}

export default function RemindersScreen() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('medication_reminders')
      .select('*')
      .order('remind_time', { ascending: true });
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
    const { error } = await supabase
      .from('medication_reminders')
      .update({ is_active: value })
      .eq('id', item.id);
    if (error) {
      Alert.alert('Hata', 'Güncellenemedi: ' + error.message);
      load();
      return;
    }
    await syncAllNotifications();
  }

  function confirmDelete(item: Reminder) {
    Alert.alert('Hatırlatıcıyı Sil', `"${item.drug_name}" hatırlatıcısı silinsin mi?`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase
            .from('medication_reminders')
            .delete()
            .eq('id', item.id);
          if (error) {
            Alert.alert('Hata', 'Silinemedi: ' + error.message);
            return;
          }
          setReminders((prev) => prev.filter((r) => r.id !== item.id));
          await syncAllNotifications();
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>GÜNLÜK RUTİNİN</Text>
          <Text style={styles.title}>Hatırlatıcılar</Text>
          <Text style={styles.subtitle}>İlaç saatlerini kaçırma.</Text>
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
              <Text style={styles.days}>{formatDays(item.repeat_days)}</Text>
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
              <Text style={styles.emptyTitle}>Henüz hatırlatıcı yok</Text>
              <Text style={styles.emptyText}>
                İlaç saatlerini ekle; vakti gelince telefonuna bildirim gelsin — internet
                olmasa bile çalışır.
              </Text>
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

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 16,
    padding: 20,
    borderRadius: Radius.large,
    backgroundColor: Palette.accentSoft,
  },
  eyebrow: {
    color: Palette.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Palette.text,
    marginTop: 3,
  },
  subtitle: {
    color: Palette.textSecondary,
    fontSize: 13,
    marginTop: 3,
  },
  clockBadge: {
    width: 56,
    height: 56,
    borderRadius: 19,
    backgroundColor: Palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 20px rgba(79, 70, 229, 0.18)',
  },
  clockEmoji: {
    fontSize: 29,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.surface,
    borderRadius: Radius.medium,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: '0 4px 14px rgba(19, 46, 50, 0.05)',
  },
  time: {
    fontSize: 24,
    fontWeight: '800',
    color: Palette.text,
  },
  drugName: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.textSecondary,
    marginTop: 2,
  },
  days: {
    fontSize: 13,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  notes: {
    fontSize: 12,
    color: Palette.textMuted,
    marginTop: 2,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 10,
    marginLeft: 12,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 44,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.text,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: Palette.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 5px 16px rgba(11, 129, 120, 0.34)',
  },
});
