import { styles } from './styles';
import {
  deleteAccount,
  getProfileStats,
  getProfile,
  notificationsEnabled,
  setNotificationsEnabled,
  signOut,
  updateProfile,
} from './service';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormInput, PRIMARY, PrimaryButton } from '@/components/form';
import { useAuth } from '@/lib/auth-context';
import { useLocalization } from '@/lib/localization-context';
import { useResponsiveLayout } from '@/lib/responsive';
import type { Profile } from '@/lib/types';

type ProfileStats = {
  allergyCount: number;
  totalChecks: number;
  riskyChecks: number;
};

export default function ProfileScreen() {
  const { session } = useAuth();
  const { t, language, setLanguage: changeLanguage } = useLocalization();
  const layout = useResponsiveLayout();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [birthDateInput, setBirthDateInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notifsOn, setNotifsOn] = useState(true);
  const [stats, setStats] = useState<ProfileStats>({ allergyCount: 0, totalChecks: 0, riskyChecks: 0 });

  useEffect(() => {
    notificationsEnabled().then(setNotifsOn);
  }, []);

  async function toggleNotifications(value: boolean) {
    setNotifsOn(value);
    const ok = await setNotificationsEnabled(value);
    if (value && !ok) {
      setNotifsOn(false);
      Alert.alert(
        t('profile.permissionRequired'),
        t('profile.permissionInstructions')
      );
    }
  }

  useFocusEffect(
    useCallback(() => {
      if (!session) {
        setProfile(null);
        setFullName('');
        setUsername('');
        setBirthDateInput('');
        setStats({ allergyCount: 0, totalChecks: 0, riskyChecks: 0 });
        return;
      }
      getProfile(session.user.id)
        .then(({ data, error }) => {
          if (!error && data) {
            setProfile(data as Profile);
            setFullName(data.full_name ?? '');
            setUsername(data.username ?? '');
            setBirthDateInput(formatBirthDateForDisplay(data.birth_date));
          } else {
            setProfile(null);
            setFullName('');
            setUsername('');
            setBirthDateInput('');
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
      Alert.alert(t('common.error'), error.message);
    } else {
      Alert.alert(t('profile.saved'), t('profile.savedMessage'));
    }
  }

  function handleSignOut() {
    Alert.alert(t('profile.signOut'), t('profile.signOutQuestion'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.signOut'),
        style: 'destructive',
        onPress: async () => {
          const { error } = await signOut();
          if (error) {
            Alert.alert(t('common.error'), error.message);
            return;
          }
          router.replace('/(auth)/login' as never);
        },
      },
    ]);
  }

  function handleDeleteAccount() {
    Alert.alert(
      t('profile.deleteTitle'),
      t('profile.deleteWarning'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            const { error } = await deleteAccount();
            if (error) {
              setDeleting(false);
              Alert.alert(t('common.error'), t('profile.deleteFailed'));
              return;
            }
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: layout.pagePadding, paddingTop: layout.cardGap },
        ]}
        keyboardShouldPersistTaps="handled">
        <View style={[styles.profileHero, layout.centerContent, { padding: layout.heroPadding }]}>
          <View style={[styles.avatar, { width: layout.badgeSize, height: layout.badgeSize }]}>
            <Text style={styles.avatarText}>
              {(fullName || session?.user.email || 'A').slice(0, 1).toLocaleUpperCase('tr')}
            </Text>
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.eyebrow}>{t('profile.eyebrow')}</Text>
            <Text style={styles.title}>{fullName || t('profile.fallbackName')}</Text>
            <Text style={styles.heroEmail}>{session?.user.email}</Text>
          </View>
        </View>

        <View style={[styles.card, layout.centerContent]}>
          <Text style={styles.emailLabel}>{t('profile.email')}</Text>
          <Text style={styles.email}>{session?.user.email}</Text>
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
            label={t('profile.birthDate')}
            value={birthDateInput}
            onChangeText={(value) => setBirthDateInput(formatBirthDateInput(value))}
            keyboardType="number-pad"
            maxLength={10}
            placeholder={t('auth.register.birthDatePlaceholder')}
          />
        </View>

        <View style={layout.centerContent}>
          <Text style={styles.label}>{t('profile.language')}</Text>
        </View>
        <View style={[styles.langRow, layout.centerContent]}>
          {(['tr', 'en'] as const).map((lang) => {
            const selected = language === lang;
            return (
              <Pressable
                key={lang}
                onPress={() => changeLanguage(lang).catch((error) => Alert.alert(t('common.error'), error.message))}
                style={[styles.langChip, selected && styles.langChipSelected]}>
                <Text style={[styles.langText, selected && styles.langTextSelected]}>
                  {lang === 'tr' ? '🇹🇷 Türkçe' : '🇬🇧 English'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={layout.centerContent}>
          <PrimaryButton title={t('common.save')} onPress={handleSave} loading={saving} />
        </View>

        <View style={[styles.settingRow, layout.centerContent]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingTitle}>{t('profile.notifications')}</Text>
            <Text style={styles.settingDesc}>{t('profile.notificationDesc')}</Text>
          </View>
          <Switch
            value={notifsOn}
            onValueChange={toggleNotifications}
            trackColor={{ true: PRIMARY }}
          />
        </View>

        <Pressable style={[styles.navRow, layout.centerContent]} onPress={() => router.push('/settings' as never)}>
          <Text style={styles.navTitle}>⚙️ {t('settings.title')}</Text>
          <Text style={styles.navArrow}>›</Text>
        </Pressable>

        <Pressable style={[styles.navRow, layout.centerContent]} onPress={() => router.push('/emergency-card' as never)}>
          <Text style={styles.navTitle}>🆘 {t('emergency.title')}</Text>
          <Text style={styles.navArrow}>›</Text>
        </Pressable>

        <Pressable style={[styles.navRow, layout.centerContent]} onPress={() => router.push('/interaction-check' as never)}>
          <Text style={styles.navTitle}>🔒 {t('interaction.title')}</Text>
          <Text style={styles.navArrow}>›</Text>
        </Pressable>

        <Pressable style={[styles.navRow, layout.centerContent]} onPress={() => router.push('/feedback' as never)}>
          <Text style={styles.navTitle}>💬 {t('feedback.title')}</Text>
          <Text style={styles.navArrow}>›</Text>
        </Pressable>

        {profile?.is_admin && (
          <Pressable style={[styles.adminRow, layout.centerContent]} onPress={() => router.push('/admin' as never)}>
            <Text style={styles.adminTitle}>🛠️ {t('admin.title')}</Text>
            <Text style={styles.adminArrow}>›</Text>
          </Pressable>
        )}

        <Pressable style={[styles.premiumCard, layout.centerContent]} onPress={() => router.push('/premium' as never)}>
          <Text style={styles.premiumTitle}>
            {profile?.is_premium ? t('profile.premium') : t('profile.free')}
          </Text>
          <Text style={styles.premiumText}>
            {profile?.is_premium
              ? t('profile.unlimited')
              : t('profile.freeDesc')}
          </Text>
          <Text style={styles.premiumLink}>{t('premium.open')}</Text>
        </Pressable>

        <Pressable onPress={handleSignOut} style={styles.signOut}>
          <Text style={styles.signOutText}>{t('profile.signOut')}</Text>
        </Pressable>

        <Pressable
          onPress={handleDeleteAccount}
          disabled={deleting}
          style={({ pressed }) => [styles.deleteAccount, pressed && { opacity: 0.7 }]}>
          <Text style={styles.deleteAccountText}>
            {deleting ? t('profile.deleting') : t('profile.deleteAccount')}
          </Text>
        </Pressable>
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
