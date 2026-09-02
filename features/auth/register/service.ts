import { supabase } from '@/lib/supabase';

const AUTH_CALLBACK_URL = 'com.menescelik.allergyguard://auth/callback';

export type RegisterAccountInput = {
  fullName: string;
  username: string;
  email: string;
  password: string;
};

export function registerAccount({ fullName, username, email, password }: RegisterAccountInput) {
  const normalizedUsername = username.trim().toLowerCase();

  return supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        full_name: fullName.trim(),
        username: normalizedUsername,
      },
      emailRedirectTo: AUTH_CALLBACK_URL,
    },
  });
}
