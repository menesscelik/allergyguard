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
  return syncAdaptyPremiumToSupabase(profile, userId);
}

export async function restoreStorePurchases(userId: string) {
  const profile = await restorePremiumPurchases(userId);
  return syncAdaptyPremiumToSupabase(profile, userId);
}

async function syncAdaptyPremiumToSupabase(profile: AdaptyProfile | null, userId: string) {
  const isPremium = hasPremiumAccess(profile);
  const premiumUntil = premiumExpiresAt(profile);

  if (isPremium) {
    await supabase
      .from('profiles')
      .update({
        is_premium: true,
        premium_until: premiumUntil,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);
  }

  return {
    isPremium,
    premiumUntil,
  };
}

export type { AdaptyPaywallProduct };
