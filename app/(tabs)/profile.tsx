import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormInput, PRIMARY, PrimaryButton } from '@/components/form';
import { Palette, Radius } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { notificationsEnabled, setNotificationsEnabled } from '@/lib/notifications';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/types';

export default function ProfileScreen() {
  const { session } = useAuth();
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
        'İzin gerekli',
        'Bildirimlere izin verilmedi. Telefonun Ayarlar → AllergyGuard → Bildirimler bölümünden izin verebilirsin.'
      );
    }
  }

  useFocusEffect(
    useCallback(() => {
      if (!session) return;
      supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
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
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() || null, updated_at: new Date().toISOString() })
      .eq('id', session.user.id);
    setSaving(false);
    if (error) {
      Alert.alert('Hata', 'Profil kaydedilemedi: ' + error.message);
    } else {
      Alert.alert('Kaydedildi', 'Profilin güncellendi.');
    }
  }

  async function setLanguage(language: 'tr' | 'en') {
    if (!session || !profile) return;
    setProfile({ ...profile, language });
    const { error } = await supabase
      .from('profiles')
      .update({ language, updated_at: new Date().toISOString() })
      .eq('id', session.user.id);
    if (error) {
      Alert.alert('Hata', 'Dil güncellenemedi: ' + error.message);
    }
  }

  function handleSignOut() {
    Alert.alert('Çıkış Yap', 'Hesabından çıkmak istiyor musun?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: () => supabase.auth.signOut(),
      },
    ]);
  }

  function handleDeleteAccount() {
    Alert.alert(
      'Hesabı Kalıcı Olarak Sil',
      'Alerjilerin, analizlerin ve hatırlatıcıların kalıcı olarak silinecek. Bu işlem geri alınamaz.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Hesabımı Sil',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            const { error } = await supabase.functions.invoke('delete-account', { body: {} });
            if (error) {
              setDeleting(false);
              Alert.alert('Hata', 'Hesap silinemedi. Lütfen tekrar dene.');
              return;
            }
            await supabase.auth.signOut({ scope: 'local' });
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
            <Text style={styles.eyebrow}>HESAP VE AYARLAR</Text>
            <Text style={styles.title}>{fullName || 'Profilin'}</Text>
            <Text style={styles.heroEmail}>{session?.user.email}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.emailLabel}>E-posta</Text>
          <Text style={styles.email}>{session?.user.email}</Text>
        </View>

        <FormInput
          label="Ad Soyad"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Adın Soyadın"
        />

        <Text style={styles.label}>Dil / Language</Text>
        <View style={styles.langRow}>
          {(['tr', 'en'] as const).map((lang) => {
            const selected = profile?.language === lang;
            return (
              <Pressable
                key={lang}
                onPress={() => setLanguage(lang)}
                style={[styles.langChip, selected && styles.langChipSelected]}>
                <Text style={[styles.langText, selected && styles.langTextSelected]}>
                  {lang === 'tr' ? '🇹🇷 Türkçe' : '🇬🇧 English'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <PrimaryButton title="Kaydet" onPress={handleSave} loading={saving} />

        <View style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingTitle}>Bildirimler</Text>
            <Text style={styles.settingDesc}>
              İlaç hatırlatıcıları ve haftalık test hakkı bildirimi
            </Text>
          </View>
          <Switch
            value={notifsOn}
            onValueChange={toggleNotifications}
            trackColor={{ true: PRIMARY }}
          />
        </View>

        <View style={styles.premiumCard}>
          <Text style={styles.premiumTitle}>
            {profile?.is_premium ? '⭐ Premium Üye' : 'Ücretsiz Plan'}
          </Text>
          <Text style={styles.premiumText}>
            {profile?.is_premium
              ? 'Sınırsız ilaç testi yapabilirsin.'
              : 'Haftada 1 ilaç testi hakkın var. Premium yakında! (Faz 4)'}
          </Text>
        </View>

        <Pressable onPress={handleSignOut} style={styles.signOut}>
          <Text style={styles.signOutText}>Çıkış Yap</Text>
        </Pressable>

        <Pressable
          onPress={handleDeleteAccount}
          disabled={deleting}
          style={({ pressed }) => [styles.deleteAccount, pressed && { opacity: 0.7 }]}>
          <Text style={styles.deleteAccountText}>
            {deleting ? 'Hesap siliniyor...' : 'Hesabımı Kalıcı Olarak Sil'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  content: {
    padding: 20,
  },
  profileHero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.primary,
    borderRadius: Radius.large,
    padding: 20,
    marginBottom: 20,
    boxShadow: '0 10px 26px rgba(11, 129, 120, 0.22)',
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: Palette.onPrimarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Palette.white,
    fontSize: 25,
    fontWeight: '800',
  },
  profileCopy: {
    flex: 1,
    marginLeft: 14,
  },
  eyebrow: {
    color: Palette.primaryBorder,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Palette.white,
    marginTop: 2,
  },
  heroEmail: {
    color: Palette.onPrimaryMuted,
    fontSize: 12,
    marginTop: 2,
  },
  card: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.medium,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: '0 4px 14px rgba(19, 46, 50, 0.05)',
  },
  emailLabel: {
    fontSize: 12,
    color: Palette.textSecondary,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: Palette.text,
    marginTop: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.textSecondary,
    marginBottom: 6,
  },
  langRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  langChip: {
    borderWidth: 1,
    borderColor: Palette.borderStrong,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Palette.surface,
  },
  langChipSelected: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  langText: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.textSecondary,
  },
  langTextSelected: {
    color: Palette.white,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.surface,
    borderRadius: Radius.medium,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.text,
  },
  settingDesc: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  premiumCard: {
    backgroundColor: Palette.premiumSoft,
    borderColor: Palette.premiumBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.premium,
  },
  premiumText: {
    fontSize: 13,
    color: Palette.premium,
    marginTop: 4,
  },
  signOut: {
    marginTop: 32,
    alignItems: 'center',
    paddingVertical: 12,
  },
  signOutText: {
    color: Palette.danger,
    fontSize: 16,
    fontWeight: '600',
  },
  deleteAccount: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 2,
    marginBottom: 24,
  },
  deleteAccountText: {
    color: Palette.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
