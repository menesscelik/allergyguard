import { Link } from 'expo-router';
import * as Linking from 'expo-linking';
import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormInput, PRIMARY, PrimaryButton } from '@/components/form';
import { Palette } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    if (!email.trim()) {
      Alert.alert('Eksik bilgi', 'E-posta adresini gir.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: Linking.createURL('/reset-password'),
    });
    setLoading(false);
    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }
    Alert.alert(
      'E-posta gönderildi',
      'Şifre sıfırlama bağlantısı e-postana gönderildi.'
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>Şifre Sıfırlama</Text>
      <Text style={styles.subtitle}>
        Kayıtlı e-posta adresini gir, sana sıfırlama bağlantısı gönderelim.
      </Text>

      <FormInput
        label="E-posta"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        placeholder="ornek@eposta.com"
      />

      <PrimaryButton title="Bağlantı Gönder" onPress={handleReset} loading={loading} />

      <Link href="/(auth)/login" style={styles.link}>
        Girişe dön
      </Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Palette.background,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    color: Palette.text,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: Palette.textSecondary,
    marginTop: 4,
    marginBottom: 32,
  },
  link: {
    color: PRIMARY,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
  },
});
