import { supabase } from '@/lib/supabase';

export function registerAccount(fullName: string, email: string, password: string) {
  return supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { full_name: fullName.trim() } },
  });
}
