import { styles } from './styles';
import { sendPasswordReset } from './service';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormInput, PrimaryButton } from '@/components/form';
import { useLocalization } from '@/lib/localization-context';

export default function ForgotPasswordScreen() {
  const { t } = useLocalization();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    if (!email.trim()) {
      Alert.alert(t('common.error'), t('auth.forgot.missing'));
      return;
    }
    setLoading(true);
    const { error } = await sendPasswordReset(email);
    setLoading(false);
    if (error) {
      Alert.alert(t('common.error'), error.message);
      return;
    }
    Alert.alert(t('auth.forgot.sent'), t('auth.forgot.sentMessage'), [
      {
        text: 'OK',
        onPress: () =>
          router.push({ pathname: '/reset-password', params: { email: email.trim() } }),
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.iconBadge}><Text style={styles.icon}>✉️</Text></View>
      <Text style={styles.title}>{t('auth.forgot.title')}</Text>
      <Text style={styles.subtitle}>{t('auth.forgot.subtitle')}</Text>

      <View style={styles.formCard}>
        <FormInput
          label={t('common.email')}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          placeholder="ornek@eposta.com"
        />

        <PrimaryButton title={t('auth.forgot.submit')} onPress={handleReset} loading={loading} />
      </View>

      <Link href="/(auth)/login" style={styles.link}>
        {t('auth.forgot.back')}
      </Link>
    </SafeAreaView>
  );
}
