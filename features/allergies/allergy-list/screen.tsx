import { styles } from './styles';
import { deleteAllergy, getTodaySummary, listAllergies } from './service';
import { router, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { useLocalization } from '@/lib/localization-context';
import { useResponsiveLayout } from '@/lib/responsive';
import { SEVERITY_COLORS, type Allergy } from '@/lib/types';

export default function AllergiesScreen() {
  const { session } = useAuth();
  const { t, language } = useLocalization();
  const layout = useResponsiveLayout();
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [summary, setSummary] = useState({ checksToday: 0, riskyToday: 0, activeReminders: 0 });

  const load = useCallback(async () => {
    const { data, error } = await listAllergies();
    if (error) {
      Alert.alert(t('common.error'), t('allergies.loadError', { message: error.message }));
    } else {
      setAllergies(data as Allergy[]);
    }
    getTodaySummary().then(setSummary).catch(() => {});
    setLoaded(true);
  }, [t]);

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
    Alert.alert(t('allergies.deleteTitle'), t('allergies.deleteMessage', { name: item.drug_name }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          const { error } = await deleteAllergy(item.id);
          if (error) {
            Alert.alert(t('common.error'), error.message);
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
    const severityLabel = {
      mild: t('common.mild'), moderate: t('common.moderate'),
      severe: t('common.severe'), unknown: t('common.unknown'),
    }[item.severity];
    return (
      <Animated.View
        entering={FadeInDown.duration(240).delay(Math.min(index, 5) * 45)}
        layout={LinearTransition.duration(180)}>
        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => router.push({ pathname: '/allergy-detail' as never, params: { id: item.id } })}
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
                ? t('allergies.ingredientCount', { count: item.active_ingredients.length })
                : t('allergies.pendingIngredient')}
            </Text>
            {!!item.reaction_notes && <Text style={styles.notes}>{item.reaction_notes}</Text>}
          </View>
          <View style={styles.cardRight}>
            <View
              style={[styles.severityChip, { backgroundColor: SEVERITY_COLORS[item.severity] }]}>
              <Text style={styles.severityText}>{severityLabel}</Text>
            </View>
            <Pressable
              hitSlop={8}
              onPress={() => router.push({ pathname: '/add-allergy', params: { id: item.id } })}>
              <IconSymbol name="pencil" size={18} color={Palette.textMuted} />
            </Pressable>
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
      <FlatList
        data={allergies}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.list, { paddingHorizontal: layout.pagePadding }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListHeaderComponent={
          <>
            <View
              style={[
                styles.header,
                {
                  paddingHorizontal: layout.heroPadding,
                  paddingTop: layout.heroPadding,
                  paddingBottom: layout.heroPadding,
                  gap: layout.cardGap,
                },
              ]}>
              <View style={styles.heroCopy}>
                <Text style={styles.eyebrow}>
                  {displayName ? `${t('allergies.greeting')} ${displayName.toLocaleUpperCase(language)}` : t('allergies.greeting')}
                </Text>
                <Text style={[styles.title, { fontSize: layout.titleSize }]}>{t('allergies.hero')}</Text>
                <Text style={styles.subtitle}>
                  {allergies.length > 0
                    ? t(allergies.length === 1 ? 'allergies.active_one' : 'allergies.active_other', { count: allergies.length })
                    : t('allergies.start')}
                </Text>
                <View style={styles.statusPill}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>{t('allergies.protection')}</Text>
                </View>
              </View>
              <View style={[styles.shieldBadge, { width: layout.badgeSize, height: layout.badgeSize }]}>
                <Text style={styles.shieldEmoji}>🛡️</Text>
              </View>
            </View>

            <View style={styles.sectionHeading}>
              <Text style={styles.sectionEyebrow}>{t('allergies.todayPanel')}</Text>
              <Text style={styles.sectionTitle}>{t('allergies.todayStatus')}</Text>
            </View>

            <Animated.View entering={FadeInDown.duration(240).delay(80)} style={styles.todayPanel}>
              <View style={styles.todayItem}>
                <Text style={styles.todayValue}>{summary.checksToday}</Text>
                <Text style={styles.todayLabel}>{t('allergies.todayChecks')}</Text>
              </View>
              <View style={styles.todayItemDanger}>
                <Text style={styles.todayValueDanger}>{summary.riskyToday}</Text>
                <Text style={styles.todayLabel}>{t('allergies.todayRisks')}</Text>
              </View>
              <View style={styles.todayItem}>
                <Text style={styles.todayValue}>{summary.activeReminders}</Text>
                <Text style={styles.todayLabel}>{t('allergies.todayReminders')}</Text>
              </View>
            </Animated.View>

            <View style={styles.sectionHeading}>
              <Text style={styles.sectionEyebrow}>{t('allergies.quick')}</Text>
              <Text style={styles.sectionTitle}>{t('allergies.today')}</Text>
            </View>

            <View
              style={[
                styles.quickGrid,
                {
                  gap: layout.cardGap,
                  flexDirection: layout.isCompact ? 'column' : 'row',
                },
              ]}>
              <Pressable
                style={({ pressed }) => [styles.quickAction, styles.quickActionPrimary, pressed && styles.quickPressed]}
                onPress={() => openQuickAction('/(tabs)/test')}>
                <View style={[styles.quickIcon, styles.quickIconPrimary]}>
                  <IconSymbol name="sparkles" size={22} color={Palette.white} />
                </View>
                <Text style={[styles.quickTitle, styles.quickTitlePrimary]}>{t('allergies.test')}</Text>
                <Text style={[styles.quickCaption, styles.quickCaptionPrimary]}>{t('allergies.risk')}</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.quickAction, pressed && styles.quickPressed]}
                onPress={() => openQuickAction('/scan')}>
                <View style={[styles.quickIcon, { backgroundColor: Palette.accentSoft }]}>
                  <IconSymbol name="barcode.viewfinder" size={22} color={Palette.accent} />
                </View>
                <Text style={styles.quickTitle}>{t('allergies.scan')}</Text>
                <Text style={styles.quickCaption}>{t('allergies.find')}</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.quickAction, pressed && styles.quickPressed]}
                onPress={() => openQuickAction('/add-reminder')}>
                <View style={[styles.quickIcon, { backgroundColor: Palette.warningSoft }]}>
                  <IconSymbol name="bell.fill" size={22} color={Palette.warning} />
                </View>
                <Text style={styles.quickTitle}>{t('allergies.remind')}</Text>
                <Text style={styles.quickCaption}>{t('allergies.setTime')}</Text>
              </Pressable>
            </View>

            <View style={styles.listHeading}>
              <Text style={styles.listTitle}>{t('allergies.records')}</Text>
              <View style={styles.countPill}>
                <Text style={styles.countText}>{allergies.length}</Text>
              </View>
            </View>
          </>
        }
        ListEmptyComponent={
          loaded ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🩺</Text>
              <Text style={styles.emptyTitle}>{t('allergies.emptyTitle')}</Text>
              <Text style={styles.emptyText}>{t('allergies.emptyText')}</Text>
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
