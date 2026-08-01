import { supabase } from '@/lib/supabase';

const AUTH_CALLBACK_URL = 'com.menescelik.allergyguard://auth/callback';

export function sendPasswordReset(email: string) {
  return supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: AUTH_CALLBACK_URL,
  });
}
