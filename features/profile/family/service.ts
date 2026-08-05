import { supabase } from '@/lib/supabase';

export type FamilyMember = {
  link_id: string;
  user_id: string;
  name: string | null;
  username: string | null;
};

export type Family = {
  tracking: FamilyMember[]; // benim takip ettiklerim
  trackers: FamilyMember[]; // beni takip edenler
};

export async function getFamily(): Promise<Family> {
  const { data, error } = await supabase.rpc('list_family');
  if (error) throw error;
  const d = data as { tracking?: FamilyMember[]; trackers?: FamilyMember[] } | null;
  return { tracking: d?.tracking ?? [], trackers: d?.trackers ?? [] };
}

export async function createInvite(): Promise<string> {
  const { data, error } = await supabase.rpc('create_caregiver_invite');
  if (error) throw error;
  return data as string;
}

export async function redeemInvite(code: string) {
  const { data, error } = await supabase.rpc('redeem_caregiver_invite', {
    p_code: code.trim().toUpperCase(),
  });
  if (error) throw error;
  return data as { success: boolean; message_key?: string; owner_name?: string };
}

export async function removeLink(linkId: string) {
  return supabase.from('caregiver_links').delete().eq('id', linkId);
}

// Takip eden taraf (bakıcı) için premium kontrolü. is_premium sunucu tarafında
// (webhook/promo) belirlenir; istemci yazamaz.
export async function isPremiumUser(userId: string): Promise<boolean> {
  const { data } = await supabase.from('profiles').select('is_premium').eq('id', userId).single();
  return Boolean((data as { is_premium?: boolean } | null)?.is_premium);
}
