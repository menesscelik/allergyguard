import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormInput, PRIMARY, PrimaryButton } from '@/components/form';
import { Palette } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!fullName.trim() || !email.trim() || !password) {
      Alert.alert('Eksik bilgi', 'Tüm alanları doldur.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Zayıf şifre', 'Şifre en az 6 karakter olmalı.');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
      },
    });
    setLoading(false);
    if (error) {
      Alert.alert('Kayıt başarısız', error.message);
      return;
    }
    if (!data.session) {
      // E-posta doğrulaması açıksa oturum dönmez
      Alert.alert(
        'E-postanı kontrol et',
        'Hesabını doğrulamak için e-postana gelen bağlantıya tıkla, sonra giriş yap.',
        [{ text: 'Tamam', onPress: () => router.replace('/(auth)/login') }]
      );
    }
    // Oturum döndüyse Stack.Protected otomatik olarak uygulamaya alır
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Kayıt Ol</Text>
          <Text style={styles.subtitle}>Alerji listeni oluşturmaya başla</Text>

          <FormInput
            label="Ad Soyad"
            value={fullName}
            onChangeText={setFullName}
            autoComplete="name"
            placeholder="Adın Soyadın"
          />
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
            placeholder="En az 6 karakter"
          />

          <PrimaryButton title="Kayıt Ol" onPress={handleRegister} loading={loading} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Zaten hesabın var mı? </Text>
            <Link href="/(auth)/login" style={styles.link}>
              Giriş yap
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
