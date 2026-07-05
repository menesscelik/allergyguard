import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PRIMARY } from '@/components/form';
import { Palette, Radius } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import type { DrugSearchResult } from '@/lib/types';

// Bu haftanın Pazartesi tarihi (sunucudaki hesapla aynı kural)
function currentWeekStart(): string {
  const now = new Date();
  const daysSinceMonday = (now.getUTCDay() + 6) % 7;
  const monday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysSinceMonday)
  );
  return monday.toISOString().slice(0, 10);
}

export default function DrugTestScreen() {
  const { session } = useAuth();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DrugSearchResult[] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [quotaText, setQuotaText] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!session) return;
      (async () => {
        const { data: prof } = await supabase
          .from('profiles')
          .select('is_premium')
          .eq('id', session.user.id)
          .single();
        if (prof?.is_premium) {
          setQuotaText('⭐ Premium — sınırsız test');
          return;
        }
        const { data: usage } = await supabase
          .from('weekly_usage')
          .select('check_count')
          .eq('user_id', session.user.id)
          .eq('week_start', currentWeekStart())
          .maybeSingle();
        const left = Math.max(0, 1 - (usage?.check_count ?? 0));
        setQuotaText(
          left > 0
            ? `Bu hafta ${left}/1 test hakkın var`
            : 'Bu haftaki hakkın doldu — Pazartesi yenilenir'
        );
      })();
    }, [session])
  );

  async function handleSearch() {
    const term = query.trim();
    if (term.length < 2) {
      setErrorMsg('En az 2 karakter yaz.');
      return;
    }
    Keyboard.dismiss();
    setLoading(true);
    setErrorMsg(null);
    setResults(null);

    const { data, error } = await supabase.functions.invoke('search-drug', {
      body: { query: term },
    });

    setLoading(false);
    if (error) {
      setErrorMsg('Arama başarısız oldu. İnternet bağlantını kontrol edip tekrar dene.');
      return;
    }
    setResults((data?.results ?? []) as DrugSearchResult[]);
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
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>AKILLI İLAÇ KONTROLÜ</Text>
            <Text style={styles.title}>İlacını test et</Text>
          </View>
          <View style={styles.labBadge}>
            <Text style={styles.labEmoji}>🧪</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>Etken maddeleri alerji listenle karşılaştıralım.</Text>
        {quotaText && <Text style={styles.quota}>{quotaText}</Text>}
      </View>

      <View style={styles.searchCard}>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="İlaç adı yaz (örn. ibuprofen)"
            placeholderTextColor={Palette.textMuted}
            autoCapitalize="none"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          <Pressable style={styles.searchButton} onPress={handleSearch} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={Palette.white} />
            ) : (
              <Text style={styles.searchButtonText}>Ara</Text>
            )}
          </Pressable>
        </View>

        <Pressable style={styles.scanButton} onPress={() => router.push('/scan')}>
          <Text style={styles.scanButtonText}>📷 Barkod ile hızlı tara</Text>
        </Pressable>
      </View>

      {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}

      <FlatList
        data={results ?? []}
        keyExtractor={(item, i) => item.rxcui ?? `${item.name}-${i}`}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => openResult(item)}>
            <Text style={styles.drugName}>{item.name}</Text>
            {item.ingredients.length > 0 && (
              <Text style={styles.ingredients} numberOfLines={2}>
                Etken madde: {item.ingredients.join(', ')}
              </Text>
            )}
            <Text style={styles.testLink}>Riski analiz et →</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          results !== null && !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                Sonuç bulunamadı. İlacın uluslararası/etken madde adıyla aramayı dene (örn.
                &quot;Parol&quot; yerine &quot;paracetamol&quot;).
              </Text>
            </View>
          ) : results === null && !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyText}>
                Haftada 1 ücretsiz test hakkın var. İpucu: Türkçe marka adı bulunamazsa etken
                maddeyle ara.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  header: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 20,
    borderRadius: Radius.large,
    backgroundColor: Palette.primary,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    color: Palette.primaryBorder,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  labBadge: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: Palette.onPrimarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labEmoji: {
    fontSize: 27,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Palette.white,
    marginTop: 3,
  },
  subtitle: {
    fontSize: 14,
    color: Palette.primaryBorder,
    marginTop: 10,
  },
  quota: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.white,
    backgroundColor: Palette.onPrimarySurface,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 14,
    overflow: 'hidden',
  },
  searchCard: {
    margin: 16,
    padding: 14,
    borderRadius: Radius.large,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: '0 8px 24px rgba(19, 46, 50, 0.07)',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Palette.borderStrong,
    borderRadius: Radius.medium,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: Palette.text,
    backgroundColor: Palette.surface,
  },
  searchButton: {
    backgroundColor: PRIMARY,
    borderRadius: Radius.medium,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: Palette.white,
    fontWeight: '700',
    fontSize: 16,
  },
  scanButton: {
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: PRIMARY,
    borderRadius: Radius.medium,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: Palette.primarySoft,
  },
  scanButtonText: {
    color: PRIMARY,
    fontSize: 15,
    fontWeight: '700',
  },
  error: {
    color: Palette.danger,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  card: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.medium,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  drugName: {
    fontSize: 17,
    fontWeight: '700',
    color: Palette.text,
  },
  ingredients: {
    fontSize: 13,
    color: Palette.textSecondary,
    marginTop: 4,
  },
  testLink: {
    color: PRIMARY,
    fontWeight: '600',
    fontSize: 14,
    marginTop: 8,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
