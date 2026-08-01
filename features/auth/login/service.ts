import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { getAuthPreferences, saveAuthPreferences } from '@/lib/auth-preferences';
import { supabase } from '@/lib/supabase';

export { getAuthPreferences };

const AUTH_CALLBACK_URL = 'com.menescelik.allergyguard://auth/callback';

WebBrowser.maybeCompleteAuthSession();

export async function signIn(email: string, password: string, rememberSession: boolean) {
  const normalizedEmail = email.trim();
  const result = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
  if (!result.error) await saveAuthPreferences(rememberSession, normalizedEmail);
  return result;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: AUTH_CALLBACK_URL,
      skipBrowserRedirect: true,
    },
  });

  if (error) return { data: null, error };
  if (!data.url) return { data: null, error: new Error('Google giriş bağlantısı oluşturulamadı.') };

  const result = await WebBrowser.openAuthSessionAsync(data.url, AUTH_CALLBACK_URL);

  if (result.type !== 'success') {
    return { data: null, error: null, cancelled: true };
  }

  const authResult = await completeOAuthCallback(result.url);
  if (!authResult.error) await persistSuccessfulSocialSession();
  return authResult;
}

export async function isAppleSignInAvailable() {
  return Platform.OS === 'ios' && AppleAuthentication.isAvailableAsync();
}

export async function signInWithApple() {
  if (Platform.OS !== 'ios') {
    return { data: null, error: new Error('Apple ile giriş yalnızca iOS cihazlarda kullanılabilir.') };
  }

  const rawNonce = randomNonce();
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);

  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
    nonce: hashedNonce,
  });

  if (!credential.identityToken) {
    return { data: null, error: new Error('Apple kimlik doğrulama bilgisi alınamadı.') };
  }

  const result = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
    nonce: rawNonce,
  });

  if (!result.error) await persistSuccessfulSocialSession();
  return result;
}

function queryFromUrl(url: string) {
  const [, queryString = ''] = url.replace('#', '?').split('?');
  return new URLSearchParams(queryString);
}

async function completeOAuthCallback(url: string) {
  const params = queryFromUrl(url);
  const errorDescription = params.get('error_description') ?? params.get('error');
  if (errorDescription) {
    return { data: null, error: new Error(decodeURIComponent(errorDescription)) };
  }

  const code = params.get('code');
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');

  if (code) {
    return supabase.auth.exchangeCodeForSession(code);
  }

  if (accessToken && refreshToken) {
    return supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  return { data: null, error: new Error('Giriş bağlantısı doğrulanamadı.') };
}

async function persistSuccessfulSocialSession() {
  const { data } = await supabase.auth.getSession();
  await saveAuthPreferences(true, data.session?.user.email ?? '');
}

function randomNonce(length = 32) {
  const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._';
  const bytes = Crypto.getRandomBytes(length);
  return Array.from(bytes, (byte) => charset[byte % charset.length]).join('');
}
