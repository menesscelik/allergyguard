import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';

import { listDrugChecks } from './service';
import { styles } from './styles';

import { Palette } from '@/constants/theme';
import { useLocalization } from '@/lib/localization-context';
import { useResponsiveLayout } from '@/lib/responsive';
import { RISK_META, type DrugCheck, type RiskLevel } from '@/lib/types';

function formatDate(value: string, language: 'tr' | 'en') {
  return new Intl.DateTimeFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function HistoryScreen() {
  const { t, language } = useLocalization();
  const layout = useResponsiveLayout();
  const [items, setItems] = useState<DrugCheck[]>([]);
  const [filter, setFilter] = useState<'all' | RiskLevel>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const stats = useMemo(() => ({
    total: items.length,
    risky: items.filter((item) => item.risk_level === 'danger').length,
    warning: items.filter((item) => item.risk_level === 'warning').length,
  }), [items]);

  const filteredItems = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter((item) => item.risk_level === filter);
  }, [filter, items]);

  const filters: Array<{ key: 'all' | RiskLevel; label: string; color: string }> = [
    { key: 'all', label: t('history.filterAll'), color: Palette.primary },
    { key: 'safe', label: t('analysis.safe'), color: Palette.success },
    { key: 'warning', label: t('analysis.warning'), color: Palette.warning },
    { key: 'danger', label: t('analysis.danger'), color: Palette.danger },
  ];

  const load = useCallback(async () => {
    const { data, error } = await listDrugChecks();
    if (error) {
      Alert.alert(t('common.error'), error.message);
    } else {
      setItems(data ?? []);
    }
    setLoaded(true);
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  function openDetail(item: DrugCheck) {
    router.push({ pathname: '/analysis-detail' as never, params: { id: item.id } });
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
          <Text style={styles.eyebrow}>{t('history.eyebrow')}</Text>
          <Text style={[styles.title, { fontSize: layout.titleSize }]}>{t('history.title')}</Text>
          <Text style={styles.subtitle}>{t('history.subtitle')}</Text>
        </View>
        <View style={[styles.headerBadge, { width: layout.badgeSize, height: layout.badgeSize }]}>
          <Text style={styles.headerEmoji}>📋</Text>
        </View>
      </View>

      <View
        style={[
          styles.statsRow,
          {
            paddingHorizontal: layout.pagePadding,
            gap: layout.cardGap,
            flexDirection: layout.isCompact ? 'column' : 'row',
          },
        ]}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>{t('history.total')}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: Palette.warningSoft }]}>
          <Text style={[styles.statValue, { color: Palette.warning }]}>{stats.warning}</Text>
          <Text style={styles.statLabel}>{t('history.caution')}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: Palette.dangerSoft }]}>
          <Text style={[styles.statValue, { color: Palette.danger }]}>{stats.risky}</Text>
          <Text style={styles.statLabel}>{t('history.risky')}</Text>
        </View>
      </View>

      <View style={[styles.filterRow, { paddingHorizontal: layout.pagePadding }]}>
        {filters.map((item) => {
          const selected = filter === item.key;
          return (
            <Pressable
              key={item.key}
              style={[
                styles.filterChip,
                selected && { backgroundColor: item.color, borderColor: item.color },
              ]}
              onPress={() => setFilter(item.key)}>
              <Text style={[styles.filterText, selected && styles.filterTextSelected]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingHorizontal: layout.pagePadding, paddingTop: layout.cardGap },
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        renderItem={({ item, index }) => {
          const meta = RISK_META[item.risk_level];
          return (
            <Animated.View
              entering={FadeInDown.duration(220).delay(Math.min(index, 8) * 35)}
              layout={LinearTransition.duration(180)}>
              <Pressable
                style={({ pressed }) => [
                  styles.card,
                  { gap: layout.cardGap, padding: layout.isCompact ? 12 : 15 },
                  pressed && styles.cardPressed,
                ]}
                onPress={() => openDetail(item)}>
                <View style={[styles.riskBadge, { backgroundColor: meta.bg }]}>
                  <Text style={styles.riskEmoji}>{meta.emoji}</Text>
                </View>
                <View style={styles.cardCopy}>
                  <Text style={styles.drugName} numberOfLines={2}>{item.tested_drug_name}</Text>
                  <Text style={styles.metaText}>{formatDate(item.created_at, language)}</Text>
                  <Text style={styles.ingredients} numberOfLines={1}>
                    {item.tested_ingredients.length > 0
                      ? item.tested_ingredients.join(', ')
                      : t('history.noIngredients')}
                  </Text>
                </View>
                <View style={[styles.riskPill, { borderColor: meta.color }]}>
                  <Text style={[styles.riskText, { color: meta.color }]}>
                    {t(`analysis.${item.risk_level}`)}
                  </Text>
                </View>
              </Pressable>
            </Animated.View>
          );
        }}
        ListEmptyComponent={
          loaded ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🧪</Text>
              <Text style={styles.emptyTitle}>
                {items.length > 0 ? t('history.emptyFilterTitle') : t('history.emptyTitle')}
              </Text>
              <Text style={styles.emptyText}>
                {items.length > 0 ? t('history.emptyFilterText') : t('history.emptyText')}
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
