import { Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import {
  buyStoreProduct,
  getPremiumStatus,
  loadStoreProducts,
  premiumFeatures,
  redeemPromoCode,
  restoreStorePurchases,
  type AdaptyPaywallProduct,
} from './service';
import { styles } from './styles';

import { PrimaryButton } from '@/components/form';
import { KEYBOARD_DISMISS_ACCESSORY_ID } from '@/components/keyboard-dismiss-accessory';
import { useAuth } from '@/lib/auth-context';
import { useLocalization } from '@/lib/localization-context';
import { useResponsiveLayout } from '@/lib/responsive';

export default function PremiumScreen() {
  const { session } = useAuth();
  const { t, language } = useLocalization();
  const layout = useResponsiveLayout();
  const [promoCode, setPromoCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [purchasingProductId, setPurchasingProductId] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [products, setProducts] = useState<AdaptyPaywallProduct[]>([]);
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
        setProducts(sortProducts(nextProducts));
      })
      .catch((error: Error) => {
        if (!mounted) return;
        setProductError(error.message);
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

  async function handleRedeem() {
    if (!promoCode.trim()) {
      Alert.alert(t('common.error'), t('premium.promo.empty'));
      return;
    }

    setRedeeming(true);
    const { data, error } = await redeemPromoCode(promoCode).catch((error: Error) => ({
      data: null,
      error,
    }));
    setRedeeming(false);

    if (error) {
      Alert.alert(t('common.error'), error.message);
      return;
    }

    if (!data?.success) {
      Alert.alert(t('premium.promo.failedTitle'), t(`premium.promo.${data?.message_key ?? 'invalid'}`));
      return;
    }

    setIsPremium(true);
    setPremiumUntil(data.premium_until ?? null);
    setPromoCode('');
    Alert.alert(
      t('premium.promo.successTitle'),
      t('premium.promo.successText', { date: formatPremiumUntil(data.premium_until ?? null) })
    );
  }

  async function handlePurchase(product: AdaptyPaywallProduct) {
    if (!session) return;

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

  return (
    <>
      <Stack.Screen options={{ title: t('premium.title') }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingHorizontal: layout.pagePadding }]}
        automaticallyAdjustKeyboardInsets
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled">
        <View style={[styles.hero, layout.centerContent, { padding: layout.heroPadding }]}>
          <Text style={styles.badge}>⭐</Text>
          <Text style={[styles.title, { fontSize: layout.titleSize }]}>{t('premium.hero')}</Text>
          <Text style={styles.subtitle}>{t('premium.subtitle')}</Text>
          <View style={styles.pricePill}>
            <Text style={styles.price}>
              {isPremium ? t('premium.active') : t('premium.price')}
            </Text>
          </View>
          {isPremium && (
            <Text style={styles.activeUntil}>
              {t('premium.activeUntil', { date: formatPremiumUntil(premiumUntil) })}
            </Text>
          )}
        </View>

        <View style={[styles.featureCard, layout.centerContent]}>
          {premiumFeatures().map((key) => (
            <View key={key} style={styles.featureRow}>
              <Text style={styles.featureIcon}>✓</Text>
              <Text style={styles.featureText}>{t(key)}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.storeCard, layout.centerContent]}>
          <Text style={styles.promoTitle}>{t('premium.purchase.title')}</Text>
          <Text style={styles.promoText}>
            {loadingProducts ? t('premium.purchase.loading') : t('premium.purchase.subtitle')}
          </Text>

          {products.length === 0 && !loadingProducts ? (
            <View style={styles.emptyProducts}>
              <Text style={styles.emptyProductsText}>{t('premium.purchase.empty')}</Text>
              {productError ? (
                <Text style={styles.emptyProductsHint}>{productError}</Text>
              ) : null}
            </View>
          ) : (
            products.map((product) => (
              <Pressable
                key={product.vendorProductId}
                disabled={Boolean(purchasingProductId) || restoring}
                onPress={() => handlePurchase(product)}
                style={({ pressed }) => [
                  styles.productRow,
                  isYearlyProduct(product) && styles.productRowFeatured,
                  pressed && styles.productRowPressed,
                ]}>
                <View style={styles.productCopy}>
                  <Text style={styles.productTitle}>
                    {isYearlyProduct(product) ? t('premium.purchase.yearly') : t('premium.purchase.monthly')}
                  </Text>
                  <Text style={styles.productSubtitle}>
                    {product.subscription?.localizedSubscriptionPeriod ?? product.localizedDescription}
                  </Text>
                </View>
                <Text style={styles.productPrice}>
                  {purchasingProductId === product.vendorProductId
                    ? t('premium.purchase.purchasing')
                    : product.price?.localizedString ?? '—'}
                </Text>
              </Pressable>
            ))
          )}

          <Pressable disabled={restoring || Boolean(purchasingProductId)} onPress={handleRestore} style={styles.restoreButton}>
            <Text style={styles.restoreButtonText}>
              {restoring ? t('premium.purchase.restoring') : t('premium.purchase.restore')}
            </Text>
          </Pressable>
        </View>

        <View style={[styles.promoCard, layout.centerContent]}>
          <Text style={styles.promoTitle}>{t('premium.promo.title')}</Text>
          <Text style={styles.promoText}>{t('premium.promo.subtitle')}</Text>
          <TextInput
            inputAccessoryViewID={KEYBOARD_DISMISS_ACCESSORY_ID}
            value={promoCode}
            onChangeText={(value) => setPromoCode(value.toUpperCase())}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder={t('premium.promo.placeholder')}
            placeholderTextColor="#9CA3AF"
            style={styles.promoInput}
          />
          <PrimaryButton
            title={redeeming ? t('premium.promo.activating') : t('premium.promo.activate')}
            onPress={handleRedeem}
            loading={redeeming}
          />
        </View>

        <View style={layout.centerContent}>
          <Text style={styles.note}>{t('premium.note')}</Text>
        </View>
      </ScrollView>
    </>
  );
}

function isYearlyProduct(product: AdaptyPaywallProduct) {
  return product.vendorProductId.includes('year') || product.subscription?.subscriptionPeriod.unit === 'year';
}

function sortProducts(products: AdaptyPaywallProduct[]) {
  return [...products].sort((a, b) => {
    if (isYearlyProduct(a) && !isYearlyProduct(b)) return -1;
    if (!isYearlyProduct(a) && isYearlyProduct(b)) return 1;
    return (a.price?.amount ?? 0) - (b.price?.amount ?? 0);
  });
}
