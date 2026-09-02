import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import {
  buyStoreProduct,
  getPremiumStatus,
  loadStoreProducts,
  premiumFeatures,
  restoreStorePurchases,
  type AdaptyPaywallProduct,
} from './service';
import { styles } from './styles';

import { Palette } from '@/constants/theme';
import { captureException } from '@/lib/monitoring';
import { useAuth } from '@/lib/auth-context';
import { useLocalization } from '@/lib/localization-context';
import { useResponsiveLayout } from '@/lib/responsive';

export default function PremiumScreen() {
  const { session } = useAuth();
  const { t, language } = useLocalization();
  const layout = useResponsiveLayout();
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [purchasingProductId, setPurchasingProductId] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [products, setProducts] = useState<AdaptyPaywallProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [productError, setProductError] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumUntil, setPremiumUntil] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    if (!session) {
      router.replace('/(auth)/login' as never);
      return () => {
        mounted = false;
      };
    }

    getPremiumStatus(session.user.id)
      .then(({ data }) => {
        if (!mounted) return;
        setIsPremium(Boolean(data?.is_premium));
        setPremiumUntil(data?.premium_until ?? null);
      })
      .catch(() => {
        if (!mounted) return;
        setIsPremium(false);
        setPremiumUntil(null);
      });

    return () => {
      mounted = false;
    };
  }, [session]);

  useEffect(() => {
    let mounted = true;
    if (!session) return;

    setLoadingProducts(true);
    setProductError(null);
    loadStoreProducts(session.user.id)
      .then((nextProducts) => {
        if (!mounted) return;
        const sorted = sortProducts(nextProducts);
        setProducts(sorted);
        // Apple paywall default: preselect the best-value (monthly) plan.
        const featured = sorted.find(isMonthlyProduct) ?? sorted[0];
        setSelectedProductId(featured?.vendorProductId ?? null);
      })
      .catch((error: Error) => {
        if (!mounted) return;
        // Ham mağaza/Adapty hatasını kullanıcıya gösterme; yalnızca izleme için logla.
        captureException(error, { scope: 'loadStoreProducts' });
        setProductError(t('premium.purchase.unavailable'));
        setProducts([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoadingProducts(false);
      });

    return () => {
      mounted = false;
    };
  }, [session]);

  const weeklyProduct = useMemo(() => products.find((p) => !isMonthlyProduct(p)), [products]);
  const selectedProduct = useMemo(
    () => products.find((p) => p.vendorProductId === selectedProductId) ?? null,
    [products, selectedProductId],
  );

  function formatPremiumUntil(value: string | null) {
    if (!value) return t('premium.activeLifetime');
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return t('premium.activeLifetime');

    try {
      return new Intl.DateTimeFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(date);
    } catch {
      return date.toLocaleDateString();
    }
  }

  function formatMoney(amount: number, product: AdaptyPaywallProduct) {
    const code = product.price?.currencyCode;
    if (code) {
      try {
        return new Intl.NumberFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
          style: 'currency',
          currency: code,
        }).format(amount);
      } catch {
        // fall through
      }
    }
    const symbol = product.price?.currencySymbol ?? '';
    return `${symbol}${amount.toFixed(2)}`;
  }

  function weeklyEquivalent(product: AdaptyPaywallProduct) {
    const amount = product.price?.amount;
    if (!isMonthlyProduct(product) || !amount) return null;
    return `${formatMoney(amount / WEEKS_PER_MONTH, product)}/${t('premium.purchase.perWeekShort')}`;
  }

  function savingsPercent(product: AdaptyPaywallProduct) {
    const monthly = product.price?.amount;
    const weekly = weeklyProduct?.price?.amount;
    if (!isMonthlyProduct(product) || !monthly || !weekly) return null;
    const percent = Math.round((1 - monthly / WEEKS_PER_MONTH / weekly) * 100);
    return percent > 0 ? percent : null;
  }

  async function handlePurchase(product: AdaptyPaywallProduct | null) {
    if (!session || !product) return;

    setPurchasingProductId(product.vendorProductId);
    const result = await buyStoreProduct(product, session.user.id).catch((error: Error) => {
      Alert.alert(t('common.error'), error.message);
      return null;
    });
    setPurchasingProductId(null);

    if (!result) return;
    if (!result.isPremium) return;

    setIsPremium(true);
    setPremiumUntil(result.premiumUntil);
    Alert.alert(t('premium.purchase.successTitle'), t('premium.purchase.successText'));
  }

  async function handleRestore() {
    if (!session) return;

    setRestoring(true);
    const result = await restoreStorePurchases(session.user.id).catch((error: Error) => {
      Alert.alert(t('common.error'), error.message);
      return null;
    });
    setRestoring(false);

    if (!result?.isPremium) {
      Alert.alert(t('premium.purchase.restoreEmptyTitle'), t('premium.purchase.restoreEmptyText'));
      return;
    }

    setIsPremium(true);
    setPremiumUntil(result.premiumUntil);
    Alert.alert(t('premium.purchase.restoredTitle'), t('premium.purchase.restoredText'));
  }

  const busy = Boolean(purchasingProductId) || restoring;

  return (
    <>
      <Stack.Screen options={{ title: t('premium.title') }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingHorizontal: layout.pagePadding }]}
        automaticallyAdjustKeyboardInsets
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled">
        {/* Hero */}
        <View style={[styles.hero, layout.centerContent]}>
          <View style={styles.heroIcon}>
            <MaterialIcons name="workspace-premium" size={40} color={Palette.white} />
          </View>
          <Text style={[styles.title, { fontSize: layout.titleSize }]}>{t('premium.hero')}</Text>
          <Text style={styles.subtitle}>{t('premium.subtitle')}</Text>
          {isPremium && (
            <View style={styles.activePill}>
              <MaterialIcons name="check-circle" size={15} color={Palette.premium} />
              <Text style={styles.activePillText}>
                {t('premium.activeUntil', { date: formatPremiumUntil(premiumUntil) })}
              </Text>
            </View>
          )}
        </View>

        {/* Features */}
        <View style={[styles.featureCard, layout.centerContent]}>
          {premiumFeatures().map((key) => (
            <View key={key} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <MaterialIcons name="check" size={15} color={Palette.premium} />
              </View>
              <Text style={styles.featureText}>{t(key)}</Text>
            </View>
          ))}
        </View>

        {/* Plans + CTA */}
        {!isPremium && (
          <View style={[layout.centerContent, styles.plansSection]}>
            <Text style={styles.sectionTitle}>{t('premium.purchase.title')}</Text>

            {loadingProducts ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>{t('premium.purchase.loading')}</Text>
              </View>
            ) : products.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>{t('premium.purchase.empty')}</Text>
                {productError ? <Text style={styles.emptyHint}>{productError}</Text> : null}
              </View>
            ) : (
              <View style={styles.planList}>
                {products.map((product) => {
                  const selected = product.vendorProductId === selectedProductId;
                  const featured = isMonthlyProduct(product);
                  const percent = savingsPercent(product);
                  const perWeek = weeklyEquivalent(product);
                  return (
                    <Pressable
                      key={product.vendorProductId}
                      disabled={busy}
                      onPress={() => setSelectedProductId(product.vendorProductId)}
                      style={[
                        styles.planCard,
                        featured && styles.planCardFeatured,
                        selected && styles.planCardSelected,
                      ]}>
                      {featured && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>
                            {percent
                              ? t('premium.purchase.save', { percent: `%${percent}` })
                              : t('premium.purchase.bestValue')}
                          </Text>
                        </View>
                      )}
                      <View style={[styles.radio, selected && styles.radioSelected]}>
                        {selected && <MaterialIcons name="check" size={14} color={Palette.white} />}
                      </View>
                      <View style={styles.planInfo}>
                        <Text style={styles.planName}>
                          {featured ? t('premium.purchase.monthly') : t('premium.purchase.weekly')}
                        </Text>
                        <Text style={styles.planMeta}>
                          {featured ? t('premium.purchase.billedMonthly') : t('premium.purchase.billedWeekly')}
                        </Text>
                      </View>
                      <View style={styles.planPriceCol}>
                        <Text style={styles.planPrice}>{product.price?.localizedString ?? '—'}</Text>
                        {perWeek ? <Text style={styles.planPricePer}>{perWeek}</Text> : null}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}

            {products.length > 0 && (
              <>
                <Pressable
                  disabled={busy || !selectedProduct}
                  onPress={() => handlePurchase(selectedProduct)}
                  style={({ pressed }) => [
                    styles.cta,
                    (busy || !selectedProduct) && styles.ctaDisabled,
                    pressed && styles.ctaPressed,
                  ]}>
                  <Text style={styles.ctaText}>
                    {purchasingProductId
                      ? t('premium.purchase.purchasing')
                      : t('premium.purchase.subscribe')}
                  </Text>
                </Pressable>

                <View style={styles.securedRow}>
                  <MaterialIcons name="lock" size={13} color={Palette.textMuted} />
                  <Text style={styles.securedText}>{t('premium.purchase.securedByApple')}</Text>
                </View>
              </>
            )}

            <Pressable disabled={busy} onPress={handleRestore} style={styles.restoreButton}>
              <Text style={styles.restoreButtonText}>
                {restoring ? t('premium.purchase.restoring') : t('premium.purchase.restore')}
              </Text>
            </Pressable>
          </View>
        )}

        <View style={layout.centerContent}>
          <Text style={styles.note}>{t('premium.purchase.terms')}</Text>
          <View style={styles.legalLinks}>
            <Pressable accessibilityRole="link" onPress={() => router.push('/privacy-policy' as never)}>
              <Text style={styles.legalLink}>{t('legal.privacy')}</Text>
            </Pressable>
            <Text style={styles.legalSeparator}>•</Text>
            <Pressable accessibilityRole="link" onPress={() => router.push('/terms-of-use' as never)}>
              <Text style={styles.legalLink}>{t('legal.terms')}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const WEEKS_PER_MONTH = 52 / 12;

function isMonthlyProduct(product: AdaptyPaywallProduct) {
  return product.vendorProductId.includes('month') || product.subscription?.subscriptionPeriod.unit === 'month';
}

function sortProducts(products: AdaptyPaywallProduct[]) {
  return [...products].sort((a, b) => {
    if (isMonthlyProduct(a) && !isMonthlyProduct(b)) return -1;
    if (!isMonthlyProduct(a) && isMonthlyProduct(b)) return 1;
    return (a.price?.amount ?? 0) - (b.price?.amount ?? 0);
  });
}
