import { styles } from './styles';
import { deleteAccount, getProfile, notificationsEnabled, setNotificationsEnabled, signOut } from './service';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState, type ComponentProps } from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PRIMARY } from '@/components/form';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { useLocalization } from '@/lib/localization-context';
import { useResponsiveLayout } from '@/lib/responsive';
import type { Profile } from '@/lib/types';

export default function SettingsScreen() {
  const { session } = useAuth();
  const { t, language, setLanguage: changeLanguage } = useLocalization();
  const layout = useResponsiveLayout();
  const [profile, setProfile] = useState<Profile | null>(null);
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
      Alert.alert(t('profile.permissionRequired'), t('profile.permissionInstructions'));
    }
  }

  useFocusEffect(
    useCallback(() => {
      if (!session) {
        setProfile(null);
        return;
      }
      getProfile(session.user.id).then(({ data, error }) => {
        setProfile(!error && data ? (data as Profile) : null);
      });
    }, [session])
  );

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
    Alert.alert(t('profile.deleteTitle'), t('profile.deleteWarning'), [
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
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: layout.pagePadding, paddingTop: layout.cardGap },
        ]}
        keyboardShouldPersistTaps="handled">
        {/* Profil kartı → düzenleme ekranı */}
        <Pressable
          style={({ pressed }) => [styles.profileHero, layout.centerContent, { padding: layout.heroPadding }, pressed && { opacity: 0.75 }]}
          onPress={() => router.push('/edit-profile' as never)}>
          <View style={[styles.avatar, { width: layout.badgeSize, height: layout.badgeSize }]}>
            <Text style={styles.avatarText}>
              {(profile?.full_name || session?.user.email || 'A').slice(0, 1).toLocaleUpperCase('tr')}
            </Text>
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.eyebrow}>{t('profile.eyebrow')}</Text>
            <Text style={styles.title}>{profile?.full_name || t('profile.fallbackName')}</Text>
            <Text style={styles.heroEmail}>{session?.user.email}</Text>
          </View>
          <IconSymbol name="chevron.right" size={20} color={Palette.textMuted} />
        </Pressable>

        {/* Dil */}
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

        {/* Bildirimler */}
        <View style={[styles.settingRow, layout.centerContent]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingTitle}>{t('profile.notifications')}</Text>
            <Text style={styles.settingDesc}>{t('profile.notificationDesc')}</Text>
          </View>
          <Switch value={notifsOn} onValueChange={toggleNotifications} trackColor={{ true: PRIMARY }} />
        </View>

        {/* Diğer */}
        <View style={[styles.navGroup, layout.centerContent]}>
          <NavRow
            icon="gearshape.fill"
            tint={Palette.textSecondary}
            soft={Palette.surfaceMuted}
            title={t('settings.appearance')}
            onPress={() => router.push('/settings' as never)}
          />
          <NavRow
            icon="clock.arrow.circlepath"
            tint={Palette.primary}
            soft={Palette.primarySoft}
            title={t('history.title')}
            onPress={() => router.push('/history' as never)}
          />
          <NavRow
            icon="cross.case.fill"
            tint={Palette.coral}
            soft={Palette.coralSoft}
            title={t('emergency.title')}
            onPress={() => router.push('/emergency-card' as never)}
          />
          <NavRow
            icon="lock.fill"
            tint={Palette.premium}
            soft={Palette.premiumSoft}
            title={t('interaction.title')}
            onPress={() => router.push('/interaction-check' as never)}
          />
          <NavRow
            icon="bubble.left.fill"
            tint={Palette.primary}
            soft={Palette.primarySoft}
            title={t('feedback.title')}
            onPress={() => router.push('/feedback' as never)}
          />
        </View>

        <Pressable style={[styles.premiumCard, layout.centerContent]} onPress={() => router.push('/premium' as never)}>
          <Text style={styles.premiumTitle}>
            {profile?.is_premium ? t('profile.premium') : t('profile.free')}
          </Text>
          <Text style={styles.premiumText}>
            {profile?.is_premium ? t('profile.unlimited') : t('profile.freeDesc')}
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

function NavRow({
  icon,
  tint,
  soft,
  title,
  onPress,
}: {
  icon: ComponentProps<typeof IconSymbol>['name'];
  tint: string;
  soft: string;
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.navRow, pressed && styles.navRowPressed]}>
      <View style={[styles.navIcon, { backgroundColor: soft }]}>
        <IconSymbol name={icon} size={16} color={tint} />
      </View>
      <Text style={styles.navTitle}>{title}</Text>
      <IconSymbol name="chevron.right" size={18} color={Palette.textMuted} />
    </Pressable>
  );
}
