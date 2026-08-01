import { supabase } from '@/lib/supabase';
import type { PromoCode } from '@/lib/types';

export async function isCurrentUserAdmin() {
  const result = await supabase.rpc('current_user_is_admin');
  return { ...result, data: Boolean(result.data) };
}

export async function listPromoCodes() {
  const result = await supabase.rpc('admin_list_promo_codes');
  return { ...result, data: (result.data ?? []) as PromoCode[] };
}

export async function createPromoCode(input: {
  code: string;
  description: string;
  premiumDays: number;
  maxRedemptions: number | null;
  expiresAt: string | null;
}) {
  const result = await supabase.rpc('admin_create_promo_code', {
    p_code: input.code,
    p_description: input.description,
    p_premium_days: input.premiumDays,
    p_max_redemptions: input.maxRedemptions,
    p_expires_at: input.expiresAt,
  });

  return {
    ...result,
    data: result.data as { success: boolean; message_key: string; code?: string } | null,
  };
}

export async function setPromoCodeActive(code: string, isActive: boolean) {
  const result = await supabase.rpc('admin_set_promo_code_active', {
    p_code: code,
    p_is_active: isActive,
  });

  return {
    ...result,
    data: result.data as { success: boolean; message_key: string; code?: string; is_active?: boolean } | null,
  };
}

export async function grantPremiumByEmail(email: string, premiumDays: number) {
  const result = await supabase.rpc('admin_grant_premium_by_email', {
    p_email: email,
    p_premium_days: premiumDays,
  });

  return {
    ...result,
    data: result.data as {
      success: boolean;
      message_key: string;
      email?: string;
      premium_until?: string;
    } | null,
  };
}

export async function setAdminByEmail(email: string, isAdmin: boolean) {
  const result = await supabase.rpc('admin_set_admin_by_email', {
    p_email: email,
    p_is_admin: isAdmin,
  });

  return {
    ...result,
    data: result.data as {
      success: boolean;
      message_key: string;
      email?: string;
      is_admin?: boolean;
    } | null,
  };
}
