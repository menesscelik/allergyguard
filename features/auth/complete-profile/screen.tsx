import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getProfile, updateProfile } from '@/features/profile/profile/service';
import { authErrorKey } from '@/lib/auth-errors';
import { FormInput, PrimaryButton } from '@/components/form';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { useLocalization } from '@/lib/localization-context';
import { useResponsiveLayout } from '@/lib/responsive';

import { styles } from './styles';

export default function CompleteProfileScreen() {
  const { session } = useAuth();
  const { t } = useLocalization();
  const layout = useResponsiveLayout();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [birthDateInput, setBirthDateInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Sosyal girişten gelen adı ön-doldur.
    const meta = session?.user?.user_metadata as { full_name?: string; name?: string } | undefined;
    const socialName = meta?.full_name ?? meta?.name ?? '';
    setFullName(socialName);
    // Mevcut kısmi profil varsa doldur.
    if (session?.user?.id) {
      getProfile(session.user.id).then(({ data }) => {
        if (data) {
          if (data.full_name) setFullName(data.full_name);
          if (data.username) setUsername(data.username);
          if (data.birth_date) setBirthDateInput(formatBirthDateForDisplay(data.birth_date));
        }
      });
    }
  }, [session]);

  async function handleSave() {
    if (!session) return;
    const name = fullName.trim();
    const normalizedUsername = username.trim().toLowerCase();
    const birthDate = parseBirthDate(birthDateInput);

    if (!name) {
      Alert.alert(t('common.error'), t('auth.register.missing'));
      return;
    }
    if (!/^[a-z0-9_]{3,24}$/.test(normalizedUsername)) {
      Alert.alert(t('common.error'), t('auth.register.usernameInvalid'));
      return;
    }
    if (birthDateInput.trim() && !birthDate) {
      Alert.alert(t('common.error'), t('auth.register.birthDateInvalid'));
      return;
    }

    setSaving(true);
    const { error } = await updateProfile(session.user.id, name, normalizedUsername, birthDate ?? '');
    setSaving(false);
    if (error) {
      Alert.alert(t('common.error'), t(authErrorKey(error)));
      return;
    }
    router.replace('/(tabs)' as never);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={[styles.content, { paddingHorizontal: layout.pagePadding }]}
          keyboardShouldPersistTaps="handled">
          <View style={styles.heroIcon}>
            <IconSymbol name="person.crop.circle.fill" size={40} color={Palette.white} />
          </View>
          <Text style={styles.title}>{t('auth.complete.title')}</Text>
          <Text style={styles.subtitle}>{t('auth.complete.subtitle')}</Text>

          <View style={[styles.card, layout.centerContent]}>
            <FormInput
              label={t('profile.fullName')}
              value={fullName}
              onChangeText={setFullName}
              autoComplete="name"
              placeholder={t('auth.register.namePlaceholder')}
            />
            <FormInput
              label={t('profile.username')}
              value={username}
              onChangeText={(v) => setUsername(v.replace(/\s+/g, '').toLowerCase())}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={24}
              placeholder={t('auth.register.usernamePlaceholder')}
            />
            <FormInput
              label={`${t('profile.birthDate')} (${t('common.optional')})`}
              value={birthDateInput}
              onChangeText={(v) => setBirthDateInput(formatBirthDateInput(v))}
              keyboardType="number-pad"
              maxLength={10}
              placeholder={t('auth.register.birthDatePlaceholder')}
            />
            <PrimaryButton title={t('auth.complete.save')} onPress={handleSave} loading={saving} />
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

function formatBirthDateForDisplay(value: string | null) {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return '';
  return `${day}.${month}.${year}`;
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
