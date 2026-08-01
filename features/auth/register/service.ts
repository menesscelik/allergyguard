import { supabase } from '@/lib/supabase';

const AUTH_CALLBACK_URL = 'com.menescelik.allergyguard://auth/callback';

export type RegisterAccountInput = {
  fullName: string;
  username: string;
  birthDate: string;
  email: string;
  password: string;
};

export function registerAccount({ fullName, username, birthDate, email, password }: RegisterAccountInput) {
  const normalizedUsername = username.trim().toLowerCase();

  return supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        full_name: fullName.trim(),
        username: normalizedUsername,
        birth_date: birthDate,
      },
      emailRedirectTo: AUTH_CALLBACK_URL,
    },
  });
}
