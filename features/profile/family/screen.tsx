import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Share, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createInvite, getFamily, isPremiumUser, redeemInvite, removeLink, type Family, type FamilyMember } from './service';
import { styles } from './styles';

import { PrimaryButton } from '@/components/form';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { useLocalization } from '@/lib/localization-context';
import { useResponsiveLayout } from '@/lib/responsive';

export default function FamilyScreen() {
  const { t } = useLocalization();
  const { session } = useAuth();
  const layout = useResponsiveLayout();
  const [family, setFamily] = useState<Family>({ tracking: [], trackers: [] });
  const [premium, setPremium] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  const load = useCallback(() => {
    getFamily()
      .then(setFamily)
      .catch(() => {});
    if (session?.user?.id) {
      isPremiumUser(session.user.id).then(setPremium).catch(() => {});
    }
  }, [session]);

  useFocusEffect(useCallback(() => load(), [load]));

  async function handleGenerate() {
    setGenerating(true);
    try {
      setCode(await createInvite());
    } catch (e) {
      Alert.alert(t('common.error'), (e as Error).message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleShare() {
    if (!code) return;
    await Share.share({ message: t('family.shareMessage', { code }) }).catch(() => {});
  }

  async function handleRedeem() {
    if (!inputCode.trim()) return;
    setRedeeming(true);
    try {
      const result = await redeemInvite(inputCode);
      if (!result.success) {
        Alert.alert(t('common.error'), t(`family.err.${result.message_key ?? 'invalid'}`));
      } else {
        setInputCode('');
        Alert.alert(t('family.connectedTitle'), t('family.connectedText', { name: result.owner_name || '' }));
        load();
      }
    } catch (e) {
      Alert.alert(t('common.error'), (e as Error).message);
    } finally {
      setRedeeming(false);
    }
  }

  function confirmRemove(member: FamilyMember) {
    Alert.alert(t('family.removeTitle'), t('family.removeMessage', { name: member.name || member.username || '' }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('family.remove'),
        style: 'destructive',
        onPress: async () => {
          await removeLink(member.link_id);
          load();
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingHorizontal: layout.pagePadding }]}
        contentInsetAdjustmentBehavior="automatic">
        <View style={[styles.hero, layout.centerContent]}>
          <View style={styles.heroIcon}>
            <IconSymbol name="person.crop.circle.fill" size={30} color={Palette.primary} />
          </View>
          <Text style={styles.heroTitle}>{t('family.hero')}</Text>
          <Text style={styles.heroText}>{t('family.heroText')}</Text>
        </View>

        {/* Beni takip etsinler → kod üret */}
        <View style={[styles.card, layout.centerContent]}>
          <Text style={styles.cardTitle}>{t('family.shareTitle')}</Text>
          <Text style={styles.cardText}>{t('family.shareDesc')}</Text>
          {code ? (
            <>
              <View style={styles.codeBox}>
                <Text style={styles.codeText}>{code}</Text>
              </View>
              <Text style={styles.codeHint}>{t('family.codeHint')}</Text>
              <View style={styles.codeActions}>
                <Pressable style={styles.secondaryBtn} onPress={handleShare}>
                  <Text style={styles.secondaryBtnText}>{t('family.share')}</Text>
                </Pressable>
                <Pressable style={styles.secondaryBtn} onPress={handleGenerate}>
                  <Text style={styles.secondaryBtnText}>{t('family.regenerate')}</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <PrimaryButton title={t('family.generate')} onPress={handleGenerate} loading={generating} />
          )}
        </View>

        {/* Aile üyesi ekle → kod gir (Premium) */}
        {premium ? (
          <View style={[styles.card, layout.centerContent]}>
            <Text style={styles.cardTitle}>{t('family.addTitle')}</Text>
            <Text style={styles.cardText}>{t('family.addDesc')}</Text>
            <TextInput
              value={inputCode}
              onChangeText={(v) => setInputCode(v.toUpperCase())}
              autoCapitalize="characters"
              autoCorrect={false}
              placeholder={t('family.codePlaceholder')}
              placeholderTextColor={Palette.textMuted}
              style={styles.codeInput}
            />
            <PrimaryButton title={t('family.connect')} onPress={handleRedeem} loading={redeeming} />
          </View>
        ) : (
          <View style={[styles.lockCard, layout.centerContent]}>
            <View style={styles.lockIcon}>
              <IconSymbol name="lock.fill" size={24} color={Palette.premium} />
            </View>
            <Text style={styles.lockTitle}>{t('family.premiumTitle')}</Text>
            <Text style={styles.lockText}>{t('family.premiumText')}</Text>
            <View style={styles.lockButton}>
              <PrimaryButton title={t('premium.cta')} onPress={() => router.push('/premium' as never)} />
            </View>
          </View>
        )}

        {/* Takip ettiklerim (Premium) */}
        {premium && (
        <View style={[styles.section, layout.centerContent]}>
          <Text style={styles.sectionTitle}>{t('family.tracking')}</Text>
          {family.tracking.length === 0 ? (
            <Text style={styles.empty}>{t('family.trackingEmpty')}</Text>
          ) : (
            family.tracking.map((m) => (
              <Pressable
                key={m.link_id}
                style={styles.memberRow}
                onPress={() => router.push({ pathname: '/family-member' as never, params: { id: m.user_id, name: m.name || m.username || '' } })}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>{(m.name || m.username || '?').slice(0, 1).toUpperCase()}</Text>
                </View>
                <View style={styles.memberGrow}>
                  <Text style={styles.memberName}>{m.name || m.username || '—'}</Text>
                  <Text style={styles.memberSub}>{t('family.tapToView')}</Text>
                </View>
                <IconSymbol name="chevron.right" size={18} color={Palette.textMuted} />
              </Pressable>
            ))
          )}
        </View>
        )}

        {/* Beni takip edenler */}
        <View style={[styles.section, layout.centerContent]}>
          <Text style={styles.sectionTitle}>{t('family.trackers')}</Text>
          {family.trackers.length === 0 ? (
            <Text style={styles.empty}>{t('family.trackersEmpty')}</Text>
          ) : (
            family.trackers.map((m) => (
              <View key={m.link_id} style={styles.memberRow}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>{(m.name || m.username || '?').slice(0, 1).toUpperCase()}</Text>
                </View>
                <View style={styles.memberGrow}>
                  <Text style={styles.memberName}>{m.name || m.username || '—'}</Text>
                </View>
                <Pressable hitSlop={8} onPress={() => confirmRemove(m)} accessibilityRole="button">
                  <IconSymbol name="trash" size={18} color={Palette.textMuted} />
                </Pressable>
              </View>
            ))
          )}
        </View>

        {generating || redeeming ? <ActivityIndicator style={{ marginTop: 8 }} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}
