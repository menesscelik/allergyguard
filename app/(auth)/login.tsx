import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormInput, PRIMARY, PrimaryButton } from '@/components/form';
import { Palette, Radius } from '@/constants/theme';
import { getAuthPreferences, saveAuthPreferences } from '@/lib/auth-preferences';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAuthPreferences().then((preferences) => {
      setRememberMe(preferences.rememberSession);
      setEmail(preferences.rememberedEmail);
    });
  }, []);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Eksik bilgi', 'E-posta ve şifreni gir.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (error) {
      Alert.alert('Giriş başarısız', error.message);
      return;
    }
    await saveAuthPreferences(rememberMe, email.trim());
    // Başarılıysa yönlendirmeyi root layout'taki Stack.Protected yapar
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled">
          <View style={styles.glowTop} />
          <View style={styles.glowBottom} />
          <View style={styles.logoWrap}>
            <Text style={styles.logo}>✚</Text>
          </View>
          <Text style={styles.eyebrow}>SAĞLIĞIN, KONTROLÜNDE</Text>
          <Text style={styles.title}>AllergyGuard</Text>
          <Text style={styles.subtitle}>Alerjilerini tanı, ilaçlarını daha güvenli kontrol et.</Text>

          <View style={styles.formCard}>
            <View style={styles.trustRow}>
              <View style={styles.trustItem}>
                <Text style={styles.trustIcon}>✓</Text>
                <Text style={styles.trustText}>Kişisel alerji kontrolü</Text>
              </View>
              <View style={styles.trustDivider} />
              <View style={styles.trustItem}>
                <Text style={styles.trustIcon}>⌁</Text>
                <Text style={styles.trustText}>Hızlı barkod tarama</Text>
              </View>
            </View>
            <FormInput
              label="E-posta"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              placeholder="ornek@eposta.com"
            />
            <FormInput
              label="Şifre"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
            />

            <View style={styles.optionsRow}>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityLabel="Beni hatırla"
                accessibilityState={{ checked: rememberMe }}
                hitSlop={8}
                onPress={() => setRememberMe((value) => !value)}
                style={styles.rememberButton}>
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.rememberText}>Beni hatırla</Text>
              </Pressable>

              <Link href="/(auth)/forgot-password" style={styles.forgotLink}>
                Şifremi unuttum
              </Link>
            </View>

            <PrimaryButton title="Giriş Yap" onPress={handleLogin} loading={loading} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Hesabın yok mu? </Text>
            <Link href="/(auth)/register" style={[styles.link, { marginTop: 0 }]}>
              Kayıt ol
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    overflow: 'hidden',
  },
  glowTop: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: Palette.primarySoft,
    top: -100,
    right: -90,
  },
  glowBottom: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Palette.accentSoft,
    bottom: -80,
    left: -80,
  },
  logoWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.primary,
    boxShadow: '0 10px 26px rgba(11, 129, 120, 0.28)',
  },
  logo: {
    fontSize: 34,
    fontWeight: '500',
    color: Palette.white,
    textAlign: 'center',
  },
  eyebrow: {
    marginTop: 20,
    color: Palette.primary,
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    color: Palette.text,
    marginTop: 6,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: Palette.textSecondary,
    marginTop: 4,
    marginBottom: 24,
    paddingHorizontal: 22,
    lineHeight: 21,
  },
  formCard: {
    backgroundColor: Palette.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: 20,
    boxShadow: '0 12px 32px rgba(19, 46, 50, 0.09)',
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.primarySoft,
    borderRadius: Radius.medium,
    padding: 11,
    marginBottom: 18,
  },
  trustItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  trustIcon: {
    color: Palette.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  trustText: {
    color: Palette.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  trustDivider: {
    width: 1,
    height: 30,
    backgroundColor: Palette.primaryBorder,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -4,
    marginBottom: 6,
  },
  rememberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 40,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: Palette.borderStrong,
    backgroundColor: Palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  checkmark: {
    color: Palette.white,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 17,
  },
  rememberText: {
    color: Palette.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  forgotLink: {
    color: PRIMARY,
    fontSize: 13,
    fontWeight: '700',
  },
  link: {
    color: PRIMARY,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: Palette.textSecondary,
  },
});
