import { styles } from './styles';
import { getAuthPreferences, signIn } from './service';
import { Link } from 'expo-router';
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

import { FormInput, PrimaryButton } from '@/components/form';
import { useLocalization } from '@/lib/localization-context';

export default function LoginScreen() {
  const { t } = useLocalization();
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
      Alert.alert(t('common.error'), t('auth.login.missing'));
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password, rememberMe);
    setLoading(false);
    if (error) {
      Alert.alert(t('auth.login.failed'), error.message);
      return;
    }
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
          <Text style={styles.eyebrow}>{t('auth.login.eyebrow')}</Text>
          <Text style={styles.title}>AllergyGuard</Text>
          <Text style={styles.subtitle}>{t('auth.login.subtitle')}</Text>

          <View style={styles.formCard}>
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
