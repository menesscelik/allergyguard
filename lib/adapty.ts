import { Platform } from 'react-native';
import { adapty, FetchPolicy, type AdaptyPaywallProduct, type AdaptyProfile } from 'react-native-adapty';

export const ADAPTY_PREMIUM_ACCESS_LEVEL = 'premium';
export const ADAPTY_PREMIUM_PLACEMENT_ID = 'profile_premium';
const APP_STORE_PREMIUM_PRODUCT_IDS = new Set([
  'allergyguard_premium_monthly',
  'allergyguard_premium_weekly',
]);

let activationPromise: Promise<void> | null = null;
let identifiedUserId: string | null = null;

function getSdkKey() {
  return process.env.EXPO_PUBLIC_ADAPTY_IOS_SDK_KEY;
}

export function isAdaptyConfigured() {
  return Boolean(getSdkKey());
}

export async function activateAdapty(customerUserId?: string | null) {
  const sdkKey = getSdkKey();
  if (!sdkKey || Platform.OS !== 'ios') return;

  if (!activationPromise) {
    activationPromise = adapty.activate(sdkKey, {
      customerUserId: customerUserId ?? undefined,
      __ignoreActivationOnFastRefresh: __DEV__,
    });
    identifiedUserId = customerUserId ?? null;
  }

  await activationPromise;

  if (customerUserId && identifiedUserId !== customerUserId) {
    await adapty.identify(customerUserId);
    identifiedUserId = customerUserId;
  }
}

export function hasPremiumAccess(profile: AdaptyProfile | null | undefined) {
  return Boolean(profile?.accessLevels?.[ADAPTY_PREMIUM_ACCESS_LEVEL]?.isActive);
}

export function premiumExpiresAt(profile: AdaptyProfile | null | undefined) {
  const expiresAt = profile?.accessLevels?.[ADAPTY_PREMIUM_ACCESS_LEVEL]?.expiresAt;
  return expiresAt ? new Date(expiresAt).toISOString() : null;
}

export async function getAdaptyProfile(customerUserId?: string | null) {
  await activateAdapty(customerUserId);
  if (!isAdaptyConfigured() || Platform.OS !== 'ios') return null;
  return adapty.getProfile();
}

export async function getPremiumProducts(customerUserId?: string | null) {
  await activateAdapty(customerUserId);
  if (!isAdaptyConfigured() || Platform.OS !== 'ios') return [];

  const flow = await adapty.getFlow(ADAPTY_PREMIUM_PLACEMENT_ID, {
    fetchPolicy: FetchPolicy.ReloadRevalidatingCacheData,
    loadTimeoutMs: 5000,
  });
  const products = await adapty.getPaywallProducts(flow);
  return products.filter((product) => APP_STORE_PREMIUM_PRODUCT_IDS.has(product.vendorProductId));
}

export async function purchasePremiumProduct(product: AdaptyPaywallProduct, customerUserId?: string | null) {
  await activateAdapty(customerUserId);
  const result = await adapty.makePurchase(product);
  return result.type === 'success' ? result.profile : null;
}

export async function restorePremiumPurchases(customerUserId?: string | null) {
  await activateAdapty(customerUserId);
  if (!isAdaptyConfigured() || Platform.OS !== 'ios') return null;
  return adapty.restorePurchases();
}

export type { AdaptyPaywallProduct, AdaptyProfile };
