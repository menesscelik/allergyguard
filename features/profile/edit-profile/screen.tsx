import { Stack, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getProfile, getProfileStats, updateProfile } from '@/features/profile/profile/service';
import { authErrorKey } from '@/lib/auth-errors';
import { FormInput, PrimaryButton } from '@/components/form';
import { useAuth } from '@/lib/auth-context';
import { useLocalization } from '@/lib/localization-context';
import { useResponsiveLayout } from '@/lib/responsive';

import { styles } from './styles';

type ProfileStats = { allergyCount: number; totalChecks: number; riskyChecks: number };

export default function EditProfileScreen() {
  const { session } = useAuth();
  const { t } = useLocalization();
  const layout = useResponsiveLayout();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [birthDateInput, setBirthDateInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<ProfileStats>({ allergyCount: 0, totalChecks: 0, riskyChecks: 0 });

  useFocusEffect(
    useCallback(() => {
      if (!session) return;
      getProfile(session.user.id).then(({ data, error }) => {
        if (!error && data) {
          setFullName(data.full_name ?? '');
          setUsername(data.username ?? '');
          setBirthDateInput(formatBirthDateForDisplay(data.birth_date));
        }
      });
      getProfileStats().then(setStats).catch(() => {});
    }, [session])
  );

  async function handleSave() {
    if (!session) return;
    const normalizedUsername = username.trim().toLowerCase();
    const birthDate = parseBirthDate(birthDateInput);

    if (normalizedUsername && !/^[a-z0-9_]{3,24}$/.test(normalizedUsername)) {
      Alert.alert(t('common.error'), t('auth.register.usernameInvalid'));
      return;
    }
    if (birthDateInput.trim() && !birthDate) {
      Alert.alert(t('common.error'), t('auth.register.birthDateInvalid'));
      return;
    }

    setSaving(true);
    const { error } = await updateProfile(session.user.id, fullName, normalizedUsername, birthDate ?? '');
    setSaving(false);
    if (error) {
      Alert.alert(t('common.error'), t(authErrorKey(error)));
    } else {
      Alert.alert(t('profile.saved'), t('profile.savedMessage'));
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <Stack.Screen options={{ title: t('profile.editTitle') }} />
      <ScrollView
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled">
        <View style={[styles.hero, layout.centerContent]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(fullName || session?.user.email || 'A').slice(0, 1).toLocaleUpperCase('tr')}
            </Text>
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>{t('profile.eyebrow')}</Text>
            <Text style={styles.name}>{fullName || t('profile.fallbackName')}</Text>
            <Text style={styles.heroEmail}>{session?.user.email}</Text>
          </View>
        </View>

        <View style={[styles.statsRow, layout.centerContent]}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.allergyCount}</Text>
            <Text style={styles.statLabel}>{t('profile.statsAllergies')}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalChecks}</Text>
            <Text style={styles.statLabel}>{t('profile.statsChecks')}</Text>
          </View>
          <View style={styles.statCardDanger}>
            <Text style={styles.statValueDanger}>{stats.riskyChecks}</Text>
            <Text style={styles.statLabel}>{t('profile.statsRisky')}</Text>
          </View>
        </View>

        <View style={[styles.card, layout.centerContent]}>
          <Text style={styles.emailLabel}>{t('profile.email')}</Text>
          <Text style={styles.email}>{session?.user.email}</Text>
        </View>

        <View style={layout.centerContent}>
          <FormInput
            label={t('profile.fullName')}
            value={fullName}
            onChangeText={setFullName}
            placeholder={t('auth.register.namePlaceholder')}
          />
          <FormInput
            label={t('profile.username')}
            value={username}
            onChangeText={(value) => setUsername(value.replace(/\s+/g, '').toLowerCase())}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={24}
            placeholder={t('auth.register.usernamePlaceholder')}
          />
          <FormInput
            label={`${t('profile.birthDate')} (${t('common.optional')})`}
            value={birthDateInput}
            onChangeText={(value) => setBirthDateInput(formatBirthDateInput(value))}
            keyboardType="number-pad"
            maxLength={10}
            placeholder={t('auth.register.birthDatePlaceholder')}
          />
          <PrimaryButton title={t('common.save')} onPress={handleSave} loading={saving} />
        </View>
      </ScrollView>
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
