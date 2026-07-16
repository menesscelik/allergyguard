import { supabase } from '@/lib/supabase';

// E-postaya 6 haneli doğrulama kodu gönderir (şablonda {{ .Token }} kullanılır).
// Bağlantı yerine kod: Outlook gibi istemcilerin bağlantıyı önceden açıp
// tek kullanımlık token'ı tüketmesi sorununu ortadan kaldırır.
export function sendPasswordReset(email: string) {
  return supabase.auth.resetPasswordForEmail(email.trim());
}
