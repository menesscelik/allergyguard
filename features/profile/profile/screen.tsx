import { styles } from './styles';
import {
  deleteAccount,
  getProfile,
  notificationsEnabled,
  setNotificationsEnabled,
  signOut,
  updateProfile,
} from './service';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormInput, PRIMARY, PrimaryButton } from '@/components/form';
import { useAuth } from '@/lib/auth-context';
import { useLocalization } from '@/lib/localization-context';
import type { Profile } from '@/lib/types';

export default function ProfileScreen() {
  const { session } = useAuth();
  const { t, language, setLanguage: changeLanguage } = useLocalization();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notifsOn, setNotifsOn] = useState(true);

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
      if (!session) return;
      getProfile(session.user.id)
        .then(({ data, error }) => {
          if (!error && data) {
            setProfile(data as Profile);
            setFullName(data.full_name ?? '');
          }
        });
    }, [session])
  );

  async function handleSave() {
    if (!session) return;
    setSaving(true);
    const { error } = await updateProfile(session.user.id, fullName);
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
        onPress: signOut,
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
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHero}>
          <View style={styles.avatar}>
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

        <View style={styles.card}>
          <Text style={styles.emailLabel}>{t('profile.email')}</Text>
          <Text style={styles.email}>{session?.user.email}</Text>
        </View>

        <FormInput
          label={t('profile.fullName')}
          value={fullName}
          onChangeText={setFullName}
          placeholder={t('auth.register.namePlaceholder')}
        />

        <Text style={styles.label}>{t('profile.language')}</Text>
        <View style={styles.langRow}>
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

        <PrimaryButton title={t('common.save')} onPress={handleSave} loading={saving} />

        <View style={styles.settingRow}>
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

        <View style={styles.premiumCard}>
          <Text style={styles.premiumTitle}>
            {profile?.is_premium ? t('profile.premium') : t('profile.free')}
          </Text>
          <Text style={styles.premiumText}>
            {profile?.is_premium
              ? t('profile.unlimited')
              : t('profile.freeDesc')}
          </Text>
        </View>

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
