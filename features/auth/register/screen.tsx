import { styles } from './styles';
import { registerAccount } from './service';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormInput, PrimaryButton } from '@/components/form';
import { useLocalization } from '@/lib/localization-context';

export default function RegisterScreen() {
  const { t } = useLocalization();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!fullName.trim() || !email.trim() || !password) {
      Alert.alert(t('common.error'), t('auth.register.missing'));
      return;
    }
    if (password.length < 6) {
      Alert.alert(t('common.error'), t('auth.register.weak'));
      return;
    }
    setLoading(true);
    const { data, error } = await registerAccount(fullName, email, password);
    setLoading(false);
    if (error) {
      Alert.alert(t('common.error'), error.message);
      return;
    }
    if (!data.session) {
      // E-posta doğrulaması açıksa oturum dönmez
      Alert.alert(
        t('auth.register.checkEmail'),
        t('auth.register.confirmEmail'),
        [{ text: t('common.ok'), onPress: () => router.replace('/(auth)/login') }]
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
          <View style={styles.iconBadge}><Text style={styles.icon}>🛡️</Text></View>
          <Text style={styles.title}>{t('auth.register.title')}</Text>
          <Text style={styles.subtitle}>{t('auth.register.subtitle')}</Text>

          <View style={styles.formCard}>
            <FormInput
              label={t('auth.register.name')}
              value={fullName}
              onChangeText={setFullName}
              autoComplete="name"
              placeholder={t('auth.register.namePlaceholder')}
            />
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
              placeholder={t('auth.register.passwordHint')}
            />

            <PrimaryButton title={t('auth.register.submit')} onPress={handleRegister} loading={loading} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('auth.register.hasAccount')} </Text>
            <Link href="/(auth)/login" style={styles.link}>
              {t('auth.register.login')}
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
