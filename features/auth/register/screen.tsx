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
import { useResponsiveLayout } from '@/lib/responsive';

export default function RegisterScreen() {
  const { t } = useLocalization();
  const layout = useResponsiveLayout();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [birthDateInput, setBirthDateInput] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    const normalizedUsername = username.trim().toLowerCase();
    const birthDate = parseBirthDate(birthDateInput);

    if (!fullName.trim() || !normalizedUsername || !birthDateInput.trim() || !email.trim() || !password) {
      Alert.alert(t('common.error'), t('auth.register.missing'));
      return;
    }
    if (!/^[a-z0-9_]{3,24}$/.test(normalizedUsername)) {
      Alert.alert(t('common.error'), t('auth.register.usernameInvalid'));
      return;
    }
    if (!birthDate) {
      Alert.alert(t('common.error'), t('auth.register.birthDateInvalid'));
      return;
    }
    if (password.length < 6) {
      Alert.alert(t('common.error'), t('auth.register.weak'));
      return;
    }
    setLoading(true);
    const { data, error } = await registerAccount({
      fullName,
      username: normalizedUsername,
      birthDate,
      email,
      password,
    });
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
          <View style={[styles.iconBadge, { width: layout.badgeSize, height: layout.badgeSize }]}><Text style={styles.icon}>🛡️</Text></View>
          <Text style={[styles.title, { fontSize: layout.titleSize }]}>{t('auth.register.title')}</Text>
          <Text style={styles.subtitle}>{t('auth.register.subtitle')}</Text>

          <View style={[styles.formCard, layout.centerContent, { padding: layout.heroPadding }]}>
            <FormInput
              label={t('auth.register.name')}
              value={fullName}
              onChangeText={setFullName}
              autoComplete="name"
              placeholder={t('auth.register.namePlaceholder')}
            />
            <FormInput
              label={t('auth.register.username')}
              value={username}
              onChangeText={(value) => setUsername(value.replace(/\s+/g, '').toLowerCase())}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={24}
              placeholder={t('auth.register.usernamePlaceholder')}
            />
            <FormInput
              label={t('auth.register.birthDate')}
              value={birthDateInput}
              onChangeText={(value) => setBirthDateInput(formatBirthDateInput(value))}
              keyboardType="number-pad"
              maxLength={10}
              placeholder={t('auth.register.birthDatePlaceholder')}
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

function formatBirthDateInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
}

function parseBirthDate(value: string) {
  const [dayText, monthText, yearText] = value.split('.');
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  if (!day || !month || !year || year < 1900) return null;

  const date = new Date(Date.UTC(year, month - 1, day));
  const isValid =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day &&
    date.getTime() <= Date.now();

  return isValid ? date.toISOString().slice(0, 10) : null;
}
