import { supabase } from '@/lib/supabase';

// E-postadaki 6 haneli kodu doğrular; başarılıysa geçici oturum açılır.
export function verifyRecoveryCode(email: string, code: string) {
  return supabase.auth.verifyOtp({
    email: email.trim(),
    token: code.trim(),
    type: 'recovery',
  });
}

export async function updatePassword(password: string) {
  const result = await supabase.auth.updateUser({ password });
  if (!result.error) await supabase.auth.signOut({ scope: 'local' });
  return result;
}
