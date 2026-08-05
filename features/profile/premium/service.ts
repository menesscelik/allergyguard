import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/types';
import {
  getAdaptyProfile,
  getPremiumProducts,
  hasPremiumAccess,
  premiumExpiresAt,
  purchasePremiumProduct,
  restorePremiumPurchases,
  type AdaptyPaywallProduct,
  type AdaptyProfile,
} from '@/lib/adapty';

export function premiumFeatures() {
  return [
    'premium.features.unlimited',
    'premium.features.history',
    'premium.features.interaction',
    'premium.features.smartReminders',
    'premium.features.priority',
    'premium.features.family',
  ] as const;
}

export async function getPremiumStatus(userId: string) {
  const [profileResult, adaptyProfile] = await Promise.all([
    supabase
    .from('profiles')
    .select('is_premium, premium_until')
    .eq('id', userId)
      .maybeSingle(),
    getAdaptyProfile(userId).catch(() => null),
  ]);

  const promoProfile = profileResult.data as Pick<Profile, 'is_premium' | 'premium_until'> | null;
  const adaptyPremium = hasPremiumAccess(adaptyProfile);
  const adaptyUntil = premiumExpiresAt(adaptyProfile);

  return {
    ...profileResult,
    data: {
      is_premium: Boolean(promoProfile?.is_premium || adaptyPremium),
      premium_until: adaptyUntil ?? promoProfile?.premium_until ?? null,
    } as Pick<Profile, 'is_premium' | 'premium_until'>,
  };
}

export async function redeemPromoCode(code: string) {
  const result = await supabase.rpc('redeem_promo_code', { p_code: code });
  return {
    ...result,
    data: result.data as {
      success: boolean;
      message_key: string;
      premium_until?: string;
      premium_days?: number;
    } | null,
  };
}

export async function loadStoreProducts(userId: string) {
  return getPremiumProducts(userId);
}

export async function buyStoreProduct(product: AdaptyPaywallProduct, userId: string) {
  const profile = await purchasePremiumProduct(product, userId);
  return resolveAdaptyPremium(profile);
}

export async function restoreStorePurchases(userId: string) {
  const profile = await restorePremiumPurchases(userId);
  return resolveAdaptyPremium(profile);
}

// Not: is_premium / premium_until artık istemciden YAZILMIYOR (güvenlik). Bunlar
// yalnızca Adapty webhook Edge Function'ı tarafından service_role ile güncellenir
// (bkz. supabase/functions/adapty-webhook). Burada sadece satın alma/geri yükleme
// sonrası anlık UI için Adapty profilinden premium durumunu okuyoruz.
function resolveAdaptyPremium(profile: AdaptyProfile | null) {
  return {
    isPremium: hasPremiumAccess(profile),
    premiumUntil: premiumExpiresAt(profile),
  };
}

export type { AdaptyPaywallProduct };
