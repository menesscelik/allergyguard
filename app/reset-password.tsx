import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormInput, PrimaryButton } from '@/components/form';
import { Palette, Radius } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordScreen() {
  const url = Linking.useURL();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  useEffect(() => {
    async function prepareRecovery() {
      if (!url) {
        const { data } = await supabase.auth.getSession();
        setReady(!!data.session);
        return;
      }

      try {
        const parsed = new URL(url.replace('#', '?'));
        const errorDescription = parsed.searchParams.get('error_description');
        const accessToken = parsed.searchParams.get('access_token');
        const refreshToken = parsed.searchParams.get('refresh_token');
        const code = parsed.searchParams.get('code');

        if (errorDescription) throw new Error(errorDescription);

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
        } else if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        const { data } = await supabase.auth.getSession();
        if (!data.session) throw new Error('Şifre sıfırlama oturumu bulunamadı.');
        setReady(true);
      } catch (error) {
        setLinkError(error instanceof Error ? error.message : 'Bağlantı doğrulanamadı.');
      }
    }

    prepareRecovery();
  }, [url]);

  async function handleUpdatePassword() {
    if (password.length < 6) {
      Alert.alert('Zayıf şifre', 'Şifre en az 6 karakter olmalı.');
      return;
    }
    if (password !== confirmation) {
      Alert.alert('Şifreler eşleşmiyor', 'İki alana da aynı şifreyi yaz.');
      return;
    }

    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setSaving(false);
      Alert.alert('Hata', error.message);
      return;
    }

    await supabase.auth.signOut({ scope: 'local' });
    setSaving(false);
    Alert.alert('Şifre güncellendi', 'Yeni şifrenle giriş yapabilirsin.', [
      { text: 'Giriş Yap', onPress: () => router.replace('/(auth)/login') },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <View style={styles.iconBadge}>
            <Text style={styles.icon}>🔐</Text>
          </View>
          <Text style={styles.title}>Yeni şifreni belirle</Text>
          <Text style={styles.subtitle}>Güvenliğin için en az 6 karakter kullan.</Text>

          {linkError ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>Bağlantı geçersiz veya süresi dolmuş</Text>
              <Text style={styles.errorText}>{linkError}</Text>
              <PrimaryButton
                title="Yeni bağlantı iste"
                onPress={() => router.replace('/(auth)/forgot-password')}
              />
            </View>
          ) : (
            <View style={styles.card}>
              <FormInput
                label="Yeni şifre"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="En az 6 karakter"
                editable={ready}
              />
              <FormInput
                label="Yeni şifre tekrar"
                value={confirmation}
                onChangeText={setConfirmation}
                secureTextEntry
                placeholder="Şifreni tekrar yaz"
                editable={ready}
              />
              <PrimaryButton
                title={ready ? 'Şifreyi Güncelle' : 'Bağlantı doğrulanıyor...'}
                onPress={handleUpdatePassword}
                loading={saving}
                disabled={!ready}
              />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.background },
  keyboard: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: Palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  icon: { fontSize: 31 },
  title: {
    color: Palette.text,
    fontSize: 27,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 18,
  },
  subtitle: {
    color: Palette.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
  },
  card: {
    padding: 20,
    borderRadius: Radius.large,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: '0 12px 32px rgba(23, 32, 51, 0.08)',
  },
  errorCard: {
    padding: 20,
    borderRadius: Radius.large,
    backgroundColor: Palette.dangerSoft,
    borderWidth: 1,
    borderColor: Palette.danger,
  },
  errorTitle: { color: Palette.danger, fontSize: 16, fontWeight: '800' },
  errorText: { color: Palette.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 6 },
});
