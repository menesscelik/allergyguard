import { router, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';

import { PRIMARY } from '@/components/form';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette, Radius } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { SEVERITY_COLORS, SEVERITY_LABELS, type Allergy } from '@/lib/types';

export default function AllergiesScreen() {
  const { session } = useAuth();
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('allergies')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      Alert.alert('Hata', 'Alerjiler yüklenemedi: ' + error.message);
    } else {
      setAllergies(data as Allergy[]);
    }
    setLoaded(true);
  }, []);

  // Ekrana her dönüşte yenile (ekleme/düzenleme sonrası liste güncel kalsın)
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  function confirmDelete(item: Allergy) {
    Alert.alert('Alerjiyi Sil', `"${item.drug_name}" listeden silinsin mi?`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('allergies').delete().eq('id', item.id);
          if (error) {
            Alert.alert('Hata', 'Silinemedi: ' + error.message);
          } else {
            setAllergies((prev) => prev.filter((a) => a.id !== item.id));
          }
        },
      },
    ]);
  }

  function openQuickAction(path: '/(tabs)/test' | '/scan' | '/add-reminder') {
    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(path);
  }

  function renderItem({ item, index }: { item: Allergy; index: number }) {
    return (
      <Animated.View
        entering={FadeInDown.duration(240).delay(Math.min(index, 5) * 45)}
        layout={LinearTransition.duration(180)}>
        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => router.push({ pathname: '/add-allergy', params: { id: item.id } })}
          onLongPress={() => confirmDelete(item)}>
          <View
            style={[styles.cardAccent, { backgroundColor: SEVERITY_COLORS[item.severity] }]}
          />
          <View style={styles.drugIcon}>
            <Text style={styles.drugIconText}>{item.drug_name.slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={styles.cardCopy}>
            <Text style={styles.drugName}>{item.drug_name}</Text>
            <Text style={styles.ingredientCount}>
              {item.active_ingredients.length > 0
                ? `${item.active_ingredients.length} etken madde kayıtlı`
                : 'Etken madde bilgisi bekleniyor'}
            </Text>
            {!!item.reaction_notes && <Text style={styles.notes}>{item.reaction_notes}</Text>}
          </View>
          <View style={styles.cardRight}>
            <View
              style={[styles.severityChip, { backgroundColor: SEVERITY_COLORS[item.severity] }]}>
              <Text style={styles.severityText}>{SEVERITY_LABELS[item.severity]}</Text>
            </View>
            <Pressable hitSlop={8} onPress={() => confirmDelete(item)}>
              <IconSymbol name="trash" size={18} color={Palette.textMuted} />
            </Pressable>
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  const displayName = String(session?.user.user_metadata?.full_name ?? '').trim().split(' ')[0];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>{displayName ? `MERHABA ${displayName.toUpperCase()}` : 'MERHABA'}</Text>
          <Text style={styles.title}>Daha güvenli seçimler.</Text>
          <Text style={styles.subtitle}>
            {allergies.length > 0
              ? `${allergies.length} alerji kaydın aktif olarak korunuyor.`
              : 'İlk alerji kaydını ekleyerek korumanı başlat.'}
          </Text>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Koruma aktif</Text>
          </View>
        </View>
        <View style={styles.shieldBadge}>
          <Text style={styles.shieldEmoji}>🛡️</Text>
        </View>
      </View>

      <View style={styles.sectionHeading}>
        <View>
          <Text style={styles.sectionEyebrow}>HIZLI İŞLEMLER</Text>
          <Text style={styles.sectionTitle}>Bugün ne yapmak istersin?</Text>
        </View>
      </View>

      <View style={styles.quickGrid}>
        <Pressable
          style={({ pressed }) => [styles.quickAction, styles.quickActionPrimary, pressed && styles.quickPressed]}
          onPress={() => openQuickAction('/(tabs)/test')}>
          <View style={[styles.quickIcon, styles.quickIconPrimary]}>
            <IconSymbol name="sparkles" size={22} color={Palette.white} />
          </View>
          <Text style={[styles.quickTitle, styles.quickTitlePrimary]}>İlaç test et</Text>
          <Text style={[styles.quickCaption, styles.quickCaptionPrimary]}>Riski öğren</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.quickAction, pressed && styles.quickPressed]}
          onPress={() => openQuickAction('/scan')}>
          <View style={[styles.quickIcon, { backgroundColor: Palette.accentSoft }]}>
            <IconSymbol name="barcode.viewfinder" size={22} color={Palette.accent} />
          </View>
          <Text style={styles.quickTitle}>Barkod tara</Text>
          <Text style={styles.quickCaption}>Hızlıca bul</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.quickAction, pressed && styles.quickPressed]}
          onPress={() => openQuickAction('/add-reminder')}>
          <View style={[styles.quickIcon, { backgroundColor: Palette.warningSoft }]}>
            <IconSymbol name="bell.fill" size={22} color={Palette.warning} />
          </View>
          <Text style={styles.quickTitle}>Hatırlat</Text>
          <Text style={styles.quickCaption}>Saatini kur</Text>
        </Pressable>
      </View>

      <View style={styles.listHeading}>
        <Text style={styles.listTitle}>Alerji kayıtların</Text>
        <View style={styles.countPill}>
          <Text style={styles.countText}>{allergies.length}</Text>
        </View>
      </View>

      <FlatList
        data={allergies}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          loaded ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🩺</Text>
              <Text style={styles.emptyTitle}>Henüz alerji eklemedin</Text>
              <Text style={styles.emptyText}>
                Alerjik olduğun ilaçları ekle; ileride yeni bir ilacı test ederken bu listeyle
                karşılaştıracağız.
              </Text>
            </View>
          ) : null
        }
      />

      <Pressable style={styles.fab} onPress={() => router.push('/add-allergy')}>
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
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: Palette.primary,
    borderRadius: Radius.large,
    borderWidth: 1,
    borderColor: Palette.primary,
    overflow: 'hidden',
    boxShadow: '0 12px 30px rgba(11, 129, 120, 0.24)',
  },
  heroCopy: {
    flex: 1,
  },
  eyebrow: {
    color: Palette.primaryBorder,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 29,
    fontWeight: '800',
    color: Palette.white,
    marginTop: 3,
  },
  subtitle: {
    color: Palette.onPrimaryMuted,
    fontSize: 13,
    marginTop: 3,
  },
  shieldBadge: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: Palette.onPrimarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    boxShadow: '0 8px 20px rgba(11, 129, 120, 0.18)',
  },
  shieldEmoji: {
    fontSize: 30,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: Palette.onPrimarySurface,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Palette.successBright,
  },
  statusText: {
    color: Palette.white,
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeading: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 10,
  },
  sectionEyebrow: {
    color: Palette.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  sectionTitle: {
    color: Palette.text,
    fontSize: 17,
    fontWeight: '700',
    marginTop: 2,
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 9,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quickAction: {
    flex: 1,
    minHeight: 118,
    padding: 12,
    borderRadius: Radius.medium,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: '0 6px 16px rgba(19, 46, 50, 0.06)',
  },
  quickActionPrimary: {
    backgroundColor: Palette.accent,
    borderColor: Palette.accent,
  },
  quickPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },
  quickIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.surfaceMuted,
  },
  quickIconPrimary: {
    backgroundColor: Palette.onPrimarySurface,
  },
  quickTitle: {
    color: Palette.text,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 11,
  },
  quickTitlePrimary: {
    color: Palette.white,
  },
  quickCaption: {
    color: Palette.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  quickCaptionPrimary: {
    color: Palette.onPrimaryMuted,
  },
  listHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  listTitle: {
    color: Palette.text,
    fontSize: 18,
    fontWeight: '800',
  },
  countPill: {
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.primarySoft,
  },
  countText: {
    color: Palette.primary,
    fontSize: 13,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
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
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 4,
  },
  drugIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: Palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  drugIconText: {
    color: Palette.primary,
    fontSize: 17,
    fontWeight: '800',
  },
  cardCopy: {
    flex: 1,
  },
  drugName: {
    fontSize: 17,
    fontWeight: '700',
    color: Palette.text,
  },
  notes: {
    fontSize: 13,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  ingredientCount: {
    fontSize: 11,
    color: Palette.textMuted,
    marginTop: 3,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 8,
    marginLeft: 12,
  },
  severityChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  severityText: {
    color: Palette.white,
    fontSize: 12,
    fontWeight: '700',
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
