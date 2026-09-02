// Supabase/Postgres hata mesajlarını kullanıcı dostu i18n anahtarlarına eşler.
// Kullanım: t(authErrorKey(error))

type AnyError = { message?: string; code?: string } | null | undefined;

export function authErrorKey(error: AnyError): string {
  const msg = (error?.message ?? '').toLowerCase();
  const code = String((error as { code?: string } | null)?.code ?? '');

  if (!msg && !code) return 'auth.errors.generic';

  // Aynı e-posta
  if (
    msg.includes('already registered') ||
    msg.includes('already been registered') ||
    msg.includes('already exists') ||
    msg.includes('email address is already') ||
    msg.includes('user already')
  ) {
    return 'auth.errors.emailTaken';
  }

  // Aynı kullanıcı adı (unique index) — hem doğrudan hem de kayıt sırasında
  // trigger başarısızlığından gelen "Database error saving new user".
  if (
    code === '23505' ||
    msg.includes('profiles_username_unique') ||
    msg.includes('duplicate key') ||
    msg.includes('unique constraint') ||
    msg.includes('database error saving new user')
  ) {
    return 'auth.errors.usernameTaken';
  }

  // Şifre
  if (msg.includes('password') && (msg.includes('at least') || msg.includes('6') || msg.includes('weak') || msg.includes('short'))) {
    return 'auth.errors.weakPassword';
  }

  // E-posta formatı
  if (msg.includes('invalid') && msg.includes('email')) return 'auth.errors.invalidEmail';
  if (msg.includes('unable to validate email') || msg.includes('invalid format')) return 'auth.errors.invalidEmail';

  // Giriş bilgileri
  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) return 'auth.errors.invalidCredentials';

  // E-posta doğrulama
  if (msg.includes('email not confirmed')) return 'auth.errors.emailNotConfirmed';

  // Bağlantı
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('timeout')) return 'auth.errors.network';

  return 'auth.errors.generic';
}
