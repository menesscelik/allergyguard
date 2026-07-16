import { notificationsEnabled, setNotificationsEnabled } from '@/lib/notifications';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/types';

export { notificationsEnabled, setNotificationsEnabled };

export async function getProfile(userId: string) {
  const result = await supabase.from('profiles').select('*').eq('id', userId).single();
  return { ...result, data: result.data as Profile | null };
}

export function updateProfile(userId: string, fullName: string) {
  return supabase
    .from('profiles')
    .update({ full_name: fullName.trim() || null, updated_at: new Date().toISOString() })
    .eq('id', userId);
}

export function signOut() {
  return supabase.auth.signOut();
}

export async function deleteAccount() {
  const result = await supabase.functions.invoke('delete-account', { body: {} });
  if (!result.error) await supabase.auth.signOut({ scope: 'local' });
  return result;
}
