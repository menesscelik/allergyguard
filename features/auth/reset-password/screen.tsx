import { styles } from './styles';
import { updatePassword } from './service';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormInput, PrimaryButton } from '@/components/form';
import { useAuth } from '@/lib/auth-context';
import { useLocalization } from '@/lib/localization-context';

export default function ResetPasswordScreen() {
  const { session } = useAuth();
  const { t } = useLocalization();
  const params = useLocalSearchParams<{ verified?: string }>();
  const verifiedByLink = params.verified === '1' && !!session;
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleUpdatePassword() {
    if (!verifiedByLink) {
      Alert.alert(t('common.error'), t('auth.reset.missingSession'));
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
        <ScrollView
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled">
          <View style={styles.iconBadge}>
            <Text style={styles.icon}>🔐</Text>
          </View>
          <Text style={styles.title}>{t('auth.reset.title')}</Text>
          <Text style={styles.subtitle}>
            {verifiedByLink ? t('auth.reset.subtitle') : t('auth.reset.missingSession')}
          </Text>

          {!verifiedByLink ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>{t('auth.reset.linkFailed')}</Text>
              <Text style={styles.errorText}>{t('auth.reset.request')}</Text>
              <Pressable onPress={() => router.replace('/(auth)/forgot-password')} style={styles.errorAction}>
                <Text style={styles.errorActionText}>{t('auth.reset.requestButton')}</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.card}>
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
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
