import { styles } from './styles';
import { getWeeklyQuota, searchDrugs } from './service';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { KEYBOARD_DISMISS_ACCESSORY_ID } from '@/components/keyboard-dismiss-accessory';
import { Palette } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { useLocalization } from '@/lib/localization-context';
import { useResponsiveLayout } from '@/lib/responsive';
import type { DrugSearchResult } from '@/lib/types';

export default function DrugTestScreen() {
  const { session } = useAuth();
  const { t } = useLocalization();
  const layout = useResponsiveLayout();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DrugSearchResult[] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [quotaText, setQuotaText] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!session) return;
      (async () => {
        const quota = await getWeeklyQuota(session.user.id);
        if (quota.isPremium) {
          setQuotaText(t('drugTest.premium'));
          return;
        }
        const left = quota.checksLeft ?? 0;
        setQuotaText(
          left > 0
            ? t('drugTest.quota', { left })
            : t('drugTest.quotaFull')
        );
      })();
    }, [session, t])
  );

  async function handleSearch() {
    const term = query.trim();
    if (term.length < 2) {
      setErrorMsg(t('drugTest.minChars'));
      return;
    }
    Keyboard.dismiss();
    setLoading(true);
    setErrorMsg(null);
    setResults(null);

    const { data, error } = await searchDrugs(term);

    setLoading(false);
    if (error) {
      setErrorMsg(t('drugTest.searchFailed'));
      return;
    }
    setResults(data);
  }

  function openResult(item: DrugSearchResult) {
    router.push({
      pathname: '/drug-result',
      params: {
        name: item.name,
        rxcui: item.rxcui ?? '',
        ingredients: JSON.stringify(item.ingredients),
      },
    });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={[styles.header, { marginHorizontal: layout.pagePadding, padding: layout.heroPadding }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>{t('drugTest.eyebrow')}</Text>
            <Text style={[styles.title, { fontSize: layout.titleSize }]}>{t('drugTest.title')}</Text>
          </View>
          <View style={[styles.labBadge, { width: layout.badgeSize, height: layout.badgeSize }]}>
            <IconSymbol name="pills.fill" size={28} color={Palette.primary} />
          </View>
        </View>
        <Text style={styles.subtitle}>{t('drugTest.subtitle')}</Text>
        {quotaText && <Text style={styles.quota}>{quotaText}</Text>}
      </View>

      <View style={[styles.searchCard, { margin: layout.pagePadding, padding: layout.isCompact ? 12 : 14 }]}>
        <View style={[styles.searchRow, { flexDirection: layout.isCompact ? 'column' : 'row' }]}>
          <TextInput
            inputAccessoryViewID={KEYBOARD_DISMISS_ACCESSORY_ID}
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder={t('drugTest.placeholder')}
            placeholderTextColor={Palette.textMuted}
            autoCapitalize="none"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          <Pressable style={styles.searchButton} onPress={handleSearch} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={Palette.white} />
            ) : (
              <Text style={styles.searchButtonText}>{t('drugTest.search')}</Text>
            )}
          </Pressable>
        </View>

        <Pressable style={styles.scanButton} onPress={() => router.push('/scan')}>
          <Text style={styles.scanButtonText}>📷 {t('drugTest.scan')}</Text>
        </Pressable>
      </View>

      {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}

      <FlatList
        data={results ?? []}
        keyExtractor={(item, i) => item.rxcui ?? `${item.name}-${i}`}
        contentContainerStyle={[styles.list, { paddingHorizontal: layout.pagePadding }]}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.duration(220).delay(Math.min(index, 8) * 35)}>
            <Pressable style={styles.card} onPress={() => openResult(item)}>
              <Text style={styles.drugName}>{item.name}</Text>
              {item.ingredients.length > 0 && (
                <Text style={styles.ingredients} numberOfLines={2}>
                  {t('drugTest.ingredient', { ingredients: item.ingredients.join(', ') })}
                </Text>
              )}
              <Text style={styles.testLink}>{t('drugTest.analyze')}</Text>
            </Pressable>
          </Animated.View>
        )}
        ListEmptyComponent={
          results !== null && !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>{t('drugTest.noResult')}</Text>
            </View>
          ) : results === null && !loading ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <IconSymbol name="magnifyingglass" size={32} color={Palette.primary} />
              </View>
              <Text style={styles.emptyText}>{t('drugTest.empty')}</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
