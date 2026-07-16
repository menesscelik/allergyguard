import { styles } from './styles';
import { updatePassword, verifyRecoveryCode } from './service';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormInput, PrimaryButton } from '@/components/form';
import { useLocalization } from '@/lib/localization-context';

export default function ResetPasswordScreen() {
  const { t } = useLocalization();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleUpdatePassword() {
    if (!email.trim()) {
      Alert.alert(t('common.error'), t('auth.forgot.missing'));
      return;
    }
    if (code.trim().length < 6) {
      Alert.alert(t('common.error'), t('auth.reset.codeMissing'));
      return;
    }
    if (password.length < 6) {
      Alert.alert(t('common.error'), t('auth.register.weak'));
      return;
    }
    if (password !== confirmation) {
      Alert.alert(t('auth.reset.mismatchTitle'), t('auth.reset.mismatch'));
      return;
    }

    setSaving(true);

    // 1) Kodu doğrula (başarılıysa geçici oturum açılır)
    const { error: verifyError } = await verifyRecoveryCode(email, code);
    if (verifyError) {
      setSaving(false);
      Alert.alert(t('auth.reset.invalid'), verifyError.message);
      return;
    }

    // 2) Yeni şifreyi kaydet
    const { error } = await updatePassword(password);
    setSaving(false);
    if (error) {
      Alert.alert(t('common.error'), error.message);
      return;
    }

    Alert.alert(t('auth.reset.updated'), t('auth.reset.updatedMessage'), [
      { text: t('auth.login.submit'), onPress: () => router.replace('/(auth)/login') },
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
          <Text style={styles.title}>{t('auth.reset.title')}</Text>
          <Text style={styles.subtitle}>{t('auth.reset.subtitle')}</Text>

          <View style={styles.card}>
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
              label={t('auth.reset.code')}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
              placeholder={t('auth.reset.codePlaceholder')}
            />
            <FormInput
              label={t('auth.reset.newPassword')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder={t('auth.register.passwordHint')}
            />
            <FormInput
              label={t('auth.reset.repeat')}
              value={confirmation}
              onChangeText={setConfirmation}
              secureTextEntry
              placeholder={t('auth.reset.repeatPlaceholder')}
            />
            <PrimaryButton
              title={t('auth.reset.update')}
              onPress={handleUpdatePassword}
              loading={saving}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
