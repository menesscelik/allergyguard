import { getAuthPreferences, saveAuthPreferences } from '@/lib/auth-preferences';
import { supabase } from '@/lib/supabase';

export { getAuthPreferences };

export async function signIn(email: string, password: string, rememberSession: boolean) {
  const normalizedEmail = email.trim();
  const result = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
  if (!result.error) await saveAuthPreferences(rememberSession, normalizedEmail);
  return result;
}
