import { clearAuthPreferences } from '@/lib/auth-preferences';
import { notificationsEnabled, setNotificationsEnabled } from '@/lib/notifications';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/types';

export { notificationsEnabled, setNotificationsEnabled };

export async function getProfile(userId: string) {
  const result = await supabase.from('profiles').select('*').eq('id', userId).single();
  return { ...result, data: result.data as Profile | null };
}

export async function getProfileStats() {
  const [allergies, checks, risky] = await Promise.all([
    supabase.from('allergies').select('id', { count: 'exact', head: true }),
    supabase.from('drug_checks').select('id', { count: 'exact', head: true }),
    supabase.from('drug_checks').select('id', { count: 'exact', head: true }).eq('risk_level', 'danger'),
  ]);

  return {
    allergyCount: allergies.count ?? 0,
    totalChecks: checks.count ?? 0,
    riskyChecks: risky.count ?? 0,
  };
}

export function updateProfile(userId: string, fullName: string, username: string, birthDate: string) {
  return supabase
    .from('profiles')
    .update({
      full_name: fullName.trim() || null,
      username: username.trim().toLowerCase() || null,
      birth_date: birthDate || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
}

export async function signOut() {
  const result = await supabase.auth.signOut();
  await Promise.all([clearAuthPreferences(), supabase.auth.signOut({ scope: 'local' })]);
  return result;
}

export async function deleteAccount() {
  const result = await supabase.functions.invoke('delete-account', { body: {} });
  if (!result.error) await supabase.auth.signOut({ scope: 'local' });
  return result;
}
