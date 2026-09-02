import { styles } from './styles';
import { registerAccount } from './service';
import { Link, router } from 'expo-router';
import { useState } from 'react';
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
import { PrivacyConsentModal } from '@/components/privacy-consent-modal';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { authErrorKey } from '@/lib/auth-errors';
import { Palette } from '@/constants/theme';
import { useLocalization } from '@/lib/localization-context';
import { useResponsiveLayout } from '@/lib/responsive';

export default function RegisterScreen() {
  const { t } = useLocalization();
  const layout = useResponsiveLayout();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  async function handleRegister() {
    const normalizedUsername = username.trim().toLowerCase();

    if (!fullName.trim() || !normalizedUsername || !email.trim() || !password) {
      Alert.alert(t('common.error'), t('auth.register.missing'));
      return;
    }
    if (!/^[a-z0-9_]{3,24}$/.test(normalizedUsername)) {
      Alert.alert(t('common.error'), t('auth.register.usernameInvalid'));
      return;
    }
    if (password.length < 6) {
      Alert.alert(t('common.error'), t('auth.register.weak'));
      return;
    }
    if (!privacyAccepted) {
      // Gizlilik politikası onaylanmadan kayıt olunamaz — metni aç.
      setShowPrivacy(true);
      return;
    }
    setLoading(true);
    const { data, error } = await registerAccount({
      fullName,
      username: normalizedUsername,
      email,
      password,
    });
    setLoading(false);
    if (error) {
      Alert.alert(t('common.error'), t(authErrorKey(error)));
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
          <View style={styles.iconBadge}><IconSymbol name="shield.checkered" size={34} color={Palette.white} /></View>
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

            <Pressable style={styles.consentRow} onPress={() => setShowPrivacy(true)}>
              <View style={[styles.consentBox, privacyAccepted && styles.consentBoxOn]}>
                {privacyAccepted && <IconSymbol name="checkmark" size={13} color={Palette.white} />}
              </View>
              <Text style={styles.consentText}>
                {t('auth.register.privacyRow')}{' '}
                <Text style={styles.consentLink}>{t('auth.register.privacyRead')}</Text>
              </Text>
            </Pressable>

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

      <PrivacyConsentModal
        visible={showPrivacy}
        onClose={() => setShowPrivacy(false)}
        onAccept={() => setPrivacyAccepted(true)}
      />
    </SafeAreaView>
  );
}
