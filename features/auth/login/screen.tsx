import { styles } from './styles';
import { getAuthPreferences, isAppleSignInAvailable, signIn, signInWithApple, signInWithGoogle } from './service';
import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as AppleAuthentication from 'expo-apple-authentication';

import { FormInput, PrimaryButton } from '@/components/form';
import { authErrorKey } from '@/lib/auth-errors';
import { useLocalization } from '@/lib/localization-context';
import { useOnboarding } from '@/lib/onboarding-context';
import { useResponsiveLayout } from '@/lib/responsive';

export default function LoginScreen() {
  const { t } = useLocalization();
  const onboarding = useOnboarding();
  const layout = useResponsiveLayout();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | null>(null);
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    getAuthPreferences().then((preferences) => {
      setRememberMe(preferences.rememberSession);
      setEmail(preferences.rememberedEmail);
    });
    isAppleSignInAvailable().then(setAppleAvailable).catch(() => setAppleAvailable(false));
  }, []);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert(t('common.error'), t('auth.login.missing'));
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password, rememberMe);
    setLoading(false);
    if (error) {
      Alert.alert(t('auth.login.failed'), t(authErrorKey(error)));
      return;
    }
    await onboarding.complete();
    router.replace('/(tabs)' as never);
  }

  async function handleGoogleLogin() {
    setSocialLoading('google');
    const result = await signInWithGoogle().catch((error: Error) => ({ data: null, error }));
    setSocialLoading(null);
    if ('cancelled' in result && result.cancelled) return;
    if (result.error) {
      Alert.alert(t('auth.login.socialFailed'), result.error.message);
      return;
    }
    await onboarding.complete();
    router.replace('/(tabs)' as never);
  }

  async function handleAppleLogin() {
    setSocialLoading('apple');
    const result = await signInWithApple().catch((error: { code?: string; message: string }) => {
      if (error.code === 'ERR_REQUEST_CANCELED') return { data: null, error: null, cancelled: true };
      return { data: null, error };
    });
    setSocialLoading(null);
    if ('cancelled' in result && result.cancelled) return;
    if (result.error) {
      Alert.alert(t('auth.login.socialFailed'), result.error.message);
      return;
    }
    await onboarding.complete();
    router.replace('/(tabs)' as never);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={[
            styles.container,
            {
              paddingHorizontal: layout.pagePadding,
              paddingVertical: layout.isShort ? 18 : 28,
              justifyContent: layout.isShort ? 'flex-start' : 'center',
            },
          ]}
          keyboardShouldPersistTaps="handled">
          <View style={styles.glowTop} />
          <View style={styles.glowBottom} />
          <View style={[styles.logoWrap, { width: layout.badgeSize, height: layout.badgeSize }]}>
            <Text style={styles.logo}>✚</Text>
          </View>
          <Text style={styles.eyebrow}>{t('auth.login.eyebrow')}</Text>
          <Text style={[styles.title, { fontSize: layout.largeTitleSize }]}>AllergyGuard</Text>
          <Text style={styles.subtitle}>{t('auth.login.subtitle')}</Text>

          <View style={[styles.formCard, layout.centerContent, { padding: layout.heroPadding }]}>
            <View style={styles.trustRow}>
              <View style={styles.trustItem}>
                <Text style={styles.trustIcon}>✓</Text>
                <Text style={styles.trustText}>{t('auth.login.personalCheck')}</Text>
              </View>
              <View style={styles.trustDivider} />
              <View style={styles.trustItem}>
                <Text style={styles.trustIcon}>⌁</Text>
                <Text style={styles.trustText}>{t('auth.login.barcode')}</Text>
              </View>
            </View>
            <FormInput
              label={t('common.email')}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              placeholder="ornek@eposta.com"
            />
            <FormInput
              label={t('common.password')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
            />

            <View style={styles.optionsRow}>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityLabel={t('auth.login.remember')}
                accessibilityState={{ checked: rememberMe }}
                hitSlop={8}
                onPress={() => setRememberMe((value) => !value)}
                style={styles.rememberButton}>
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.rememberText}>{t('auth.login.remember')}</Text>
              </Pressable>

              <Link href="/(auth)/forgot-password" style={styles.forgotLink}>
                {t('auth.login.forgot')}
              </Link>
            </View>

            <PrimaryButton title={t('auth.login.submit')} onPress={handleLogin} loading={loading} />

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('auth.login.or')}</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              disabled={Boolean(socialLoading) || loading}
              onPress={handleGoogleLogin}
              style={({ pressed }) => [
                styles.socialButton,
                (pressed || socialLoading === 'google') && styles.socialButtonPressed,
              ]}>
              <Text style={styles.socialIcon}>G</Text>
              <Text style={styles.socialText}>
                {socialLoading === 'google' ? t('auth.login.socialLoading') : t('auth.login.google')}
              </Text>
            </Pressable>

            {appleAvailable && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={12}
                onPress={handleAppleLogin}
                style={[styles.appleNativeButton, (Boolean(socialLoading) || loading) && styles.socialButtonDisabled]}
                pointerEvents={Boolean(socialLoading) || loading ? 'none' : 'auto'}
              />
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('auth.login.noAccount')} </Text>
            <Link href="/(auth)/register" style={[styles.link, { marginTop: 0 }]}>
              {t('auth.login.register')}
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
