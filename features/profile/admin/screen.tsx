import { Stack, router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import {
  createPromoCode,
  grantPremiumByEmail,
  isCurrentUserAdmin,
  listPromoCodes,
  setAdminByEmail,
  setPromoCodeActive,
} from './service';
import { styles } from './styles';

import { PrimaryButton } from '@/components/form';
import { KEYBOARD_DISMISS_ACCESSORY_ID } from '@/components/keyboard-dismiss-accessory';
import { useLocalization } from '@/lib/localization-context';
import { useResponsiveLayout } from '@/lib/responsive';
import type { PromoCode } from '@/lib/types';

function normalizeCode(value: string) {
  return value.toLocaleUpperCase('en').replace(/[^A-Z0-9_-]/g, '');
}

function randomPromoCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const value = Array.from({ length: 8 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
  return `AG-${value}`;
}

export default function AdminScreen() {
  const { t, language } = useLocalization();
  const layout = useResponsiveLayout();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [premiumDays, setPremiumDays] = useState('30');
  const [maxRedemptions, setMaxRedemptions] = useState('10');
  const [expiresAt, setExpiresAt] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'passive'>('all');
  const [userEmail, setUserEmail] = useState('');
  const [userPremiumDays, setUserPremiumDays] = useState('365');
  const [grantingPremium, setGrantingPremium] = useState(false);
  const [changingAdmin, setChangingAdmin] = useState(false);

  const stats = useMemo(() => ({
    total: codes.length,
    active: codes.filter((item) => item.is_active).length,
    redemptions: codes.reduce((sum, item) => sum + item.redeemed_count, 0),
  }), [codes]);

  const filteredCodes = useMemo(() => {
    if (filter === 'active') return codes.filter((item) => item.is_active);
    if (filter === 'passive') return codes.filter((item) => !item.is_active);
    return codes;
  }, [codes, filter]);

  const load = useCallback(async () => {
    setLoading(true);
    const adminResult = await isCurrentUserAdmin();
    setIsAdmin(adminResult.data);
    if (adminResult.data) {
      const promoResult = await listPromoCodes();
      if (!promoResult.error) setCodes(promoResult.data);
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function formatDate(value: string | null) {
    if (!value) return t('admin.noExpiry');
    return new Intl.DateTimeFormat(language === 'tr' ? 'tr-TR' : 'en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  }

  async function handleCreate() {
    const days = Number(premiumDays);
    const limit = maxRedemptions.trim() ? Number(maxRedemptions) : null;
    const expiry = expiresAt.trim() ? new Date(expiresAt.trim()).toISOString() : null;

    if (!code.trim()) {
      Alert.alert(t('common.error'), t('admin.errors.empty_code'));
      return;
    }

    if (!Number.isFinite(days) || days <= 0) {
      Alert.alert(t('common.error'), t('admin.errors.bad_days'));
      return;
    }

    if (limit !== null && (!Number.isFinite(limit) || limit <= 0)) {
      Alert.alert(t('common.error'), t('admin.errors.bad_limit'));
      return;
    }

    setSaving(true);
    const { data, error } = await createPromoCode({
      code,
      description,
      premiumDays: days,
      maxRedemptions: limit,
      expiresAt: expiry,
    });
    setSaving(false);

    if (error) {
      Alert.alert(t('common.error'), error.message);
      return;
    }

    if (!data?.success) {
      Alert.alert(t('common.error'), t(`admin.errors.${data?.message_key ?? 'unknown'}`));
      return;
    }

    Alert.alert(t('admin.createdTitle'), t('admin.createdText', { code: data.code ?? code }));
    setCode('');
    setDescription('');
    setPremiumDays('30');
    setMaxRedemptions('10');
    setExpiresAt('');
    load();
  }

  async function handleToggleStatus(item: PromoCode) {
    const nextStatus = !item.is_active;
    const title = nextStatus ? t('admin.activateTitle') : t('admin.deactivateTitle');
    const message = nextStatus
      ? t('admin.activateText', { code: item.code })
      : t('admin.deactivateText', { code: item.code });

    Alert.alert(title, message, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: nextStatus ? t('admin.activate') : t('admin.deactivate'),
        style: nextStatus ? 'default' : 'destructive',
        onPress: async () => {
          setCodes((prev) => prev.map((codeItem) =>
            codeItem.code === item.code ? { ...codeItem, is_active: nextStatus } : codeItem
          ));

          const { data, error } = await setPromoCodeActive(item.code, nextStatus);
          if (error || !data?.success) {
            Alert.alert(t('common.error'), error?.message ?? t(`admin.errors.${data?.message_key ?? 'unknown'}`));
            load();
          }
        },
      },
    ]);
  }

  async function handleGrantPremium() {
    const days = Number(userPremiumDays);
    if (!userEmail.trim()) {
      Alert.alert(t('common.error'), t('admin.errors.empty_email'));
      return;
    }
    if (!Number.isFinite(days) || days <= 0) {
      Alert.alert(t('common.error'), t('admin.errors.bad_days'));
      return;
    }

    setGrantingPremium(true);
    const { data, error } = await grantPremiumByEmail(userEmail, days);
    setGrantingPremium(false);

    if (error) {
      Alert.alert(t('common.error'), error.message);
      return;
    }
    if (!data?.success) {
      Alert.alert(t('common.error'), t(`admin.errors.${data?.message_key ?? 'unknown'}`));
      return;
    }

    Alert.alert(t('admin.userPremiumGrantedTitle'), t('admin.userPremiumGrantedText', { email: data.email ?? userEmail }));
  }

  function confirmSetAdmin(nextStatus: boolean) {
    if (!userEmail.trim()) {
      Alert.alert(t('common.error'), t('admin.errors.empty_email'));
      return;
    }

    Alert.alert(
      nextStatus ? t('admin.makeAdminTitle') : t('admin.removeAdminTitle'),
      nextStatus
        ? t('admin.makeAdminText', { email: userEmail.trim() })
        : t('admin.removeAdminText', { email: userEmail.trim() }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: nextStatus ? t('admin.makeAdmin') : t('admin.removeAdmin'),
          style: nextStatus ? 'default' : 'destructive',
          onPress: async () => {
            setChangingAdmin(true);
            const { data, error } = await setAdminByEmail(userEmail, nextStatus);
            setChangingAdmin(false);

            if (error) {
              Alert.alert(t('common.error'), error.message);
              return;
            }
            if (!data?.success) {
              Alert.alert(t('common.error'), t(`admin.errors.${data?.message_key ?? 'unknown'}`));
              return;
            }
            Alert.alert(t('admin.adminChangedTitle'), t('admin.adminChangedText', { email: data.email ?? userEmail }));
          },
        },
      ]
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: t('admin.title') }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingHorizontal: layout.pagePadding }]}
        automaticallyAdjustKeyboardInsets
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled">
        <View style={[styles.hero, layout.centerContent]}>
          <Text style={styles.badge}>🛠️</Text>
          <Text style={[styles.title, { fontSize: layout.titleSize }]}>{t('admin.hero')}</Text>
          <Text style={styles.subtitle}>{t('admin.subtitle')}</Text>
        </View>

        {!loading && !isAdmin ? (
          <View style={[styles.lockCard, layout.centerContent]}>
            <Text style={styles.lockIcon}>🔒</Text>
            <Text style={styles.lockTitle}>{t('admin.notAdminTitle')}</Text>
            <Text style={styles.lockText}>{t('admin.notAdminText')}</Text>
            <PrimaryButton title={t('tabs.profile')} onPress={() => router.back()} />
          </View>
        ) : (
          <>
            <View style={[styles.statsRow, layout.centerContent]}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.total}</Text>
                <Text style={styles.statLabel}>{t('admin.statsTotal')}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats.active}</Text>
                <Text style={styles.statLabel}>{t('admin.statsActive')}</Text>
              </View>
              <View style={styles.statCardPremium}>
                <Text style={styles.statValuePremium}>{stats.redemptions}</Text>
                <Text style={styles.statLabel}>{t('admin.statsRedemptions')}</Text>
              </View>
            </View>

            <View style={[styles.card, layout.centerContent]}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('admin.createTitle')}</Text>
                <Pressable style={styles.generateButton} onPress={() => setCode(randomPromoCode())}>
                  <Text style={styles.generateText}>{t('admin.generate')}</Text>
                </Pressable>
              </View>
              <Text style={styles.label}>{t('admin.code')}</Text>
              <TextInput
                inputAccessoryViewID={KEYBOARD_DISMISS_ACCESSORY_ID}
                value={code}
                onChangeText={(value) => setCode(normalizeCode(value))}
                autoCapitalize="characters"
                autoCorrect={false}
                placeholder="SUMMER30"
                placeholderTextColor="#9CA3AF"
                style={styles.inputStrong}
              />
              <Text style={styles.label}>{t('admin.description')}</Text>
              <TextInput
                inputAccessoryViewID={KEYBOARD_DISMISS_ACCESSORY_ID}
                value={description}
                onChangeText={setDescription}
                placeholder={t('admin.descriptionPlaceholder')}
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />
              <View style={styles.twoColumn}>
                <View style={styles.field}>
                  <Text style={styles.label}>{t('admin.days')}</Text>
                  <TextInput
                    inputAccessoryViewID={KEYBOARD_DISMISS_ACCESSORY_ID}
                    value={premiumDays}
                    onChangeText={setPremiumDays}
                    keyboardType="number-pad"
                    style={styles.input}
                  />
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>{t('admin.limit')}</Text>
                  <TextInput
                    inputAccessoryViewID={KEYBOARD_DISMISS_ACCESSORY_ID}
                    value={maxRedemptions}
                    onChangeText={setMaxRedemptions}
                    keyboardType="number-pad"
                    placeholder={t('admin.unlimited')}
                    placeholderTextColor="#9CA3AF"
                    style={styles.input}
                  />
                </View>
              </View>
              <Text style={styles.label}>{t('admin.expiresAt')}</Text>
              <TextInput
                inputAccessoryViewID={KEYBOARD_DISMISS_ACCESSORY_ID}
                value={expiresAt}
                onChangeText={setExpiresAt}
                placeholder="2026-12-31"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />
              <PrimaryButton
                title={saving ? t('admin.creating') : t('admin.createButton')}
                onPress={handleCreate}
                loading={saving}
              />
            </View>

            <View style={[styles.card, layout.centerContent]}>
              <Text style={styles.sectionTitle}>{t('admin.userManageTitle')}</Text>
              <Text style={styles.helperText}>{t('admin.userManageSubtitle')}</Text>
              <Text style={styles.label}>{t('admin.userEmail')}</Text>
              <TextInput
                inputAccessoryViewID={KEYBOARD_DISMISS_ACCESSORY_ID}
                value={userEmail}
                onChangeText={setUserEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                placeholder="kullanici@eposta.com"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />
              <Text style={styles.label}>{t('admin.userPremiumDays')}</Text>
              <TextInput
                inputAccessoryViewID={KEYBOARD_DISMISS_ACCESSORY_ID}
                value={userPremiumDays}
                onChangeText={setUserPremiumDays}
                keyboardType="number-pad"
                style={styles.input}
              />
              <PrimaryButton
                title={grantingPremium ? t('admin.grantingPremium') : t('admin.grantPremium')}
                onPress={handleGrantPremium}
                loading={grantingPremium}
              />
              <View style={styles.adminButtonRow}>
                <Pressable
                  style={[styles.adminActionButton, changingAdmin && styles.disabledButton]}
                  disabled={changingAdmin}
                  onPress={() => confirmSetAdmin(true)}>
                  <Text style={styles.adminActionText}>{t('admin.makeAdmin')}</Text>
                </Pressable>
                <Pressable
                  style={[styles.adminActionButtonDanger, changingAdmin && styles.disabledButton]}
                  disabled={changingAdmin}
                  onPress={() => confirmSetAdmin(false)}>
                  <Text style={styles.adminActionTextDanger}>{t('admin.removeAdmin')}</Text>
                </Pressable>
              </View>
            </View>

            <View style={[styles.card, layout.centerContent]}>
              <Text style={styles.sectionTitle}>{t('admin.codesTitle')}</Text>
              <View style={styles.filterRow}>
                {(['all', 'active', 'passive'] as const).map((item) => {
                  const selected = filter === item;
                  return (
                    <Pressable
                      key={item}
                      style={[styles.filterChip, selected && styles.filterChipSelected]}
                      onPress={() => setFilter(item)}>
                      <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
                        {t(`admin.filters.${item}`)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {filteredCodes.length === 0 ? (
                <Text style={styles.emptyText}>{t('admin.emptyCodes')}</Text>
              ) : (
                filteredCodes.map((item) => (
                  <View key={item.code} style={styles.codeRow}>
                    <View style={styles.codeCopy}>
                      <Text selectable style={styles.codeText}>{item.code}</Text>
                      {!!item.description && <Text style={styles.codeDescription}>{item.description}</Text>}
                      <Text style={styles.codeMeta}>
                        {t('admin.codeMeta', {
                          days: item.premium_days,
                          used: item.redeemed_count,
                          limit: item.max_redemptions ?? '∞',
                        })}
                      </Text>
                      <Text style={styles.codeMeta}>{formatDate(item.expires_at)}</Text>
                    </View>
                    <View style={styles.codeActions}>
                      <View style={[styles.statusPill, !item.is_active && styles.statusPillOff]}>
                        <Text style={[styles.statusText, !item.is_active && styles.statusTextOff]}>
                          {item.is_active ? t('admin.active') : t('admin.passive')}
                        </Text>
                      </View>
                      <Pressable
                        style={[styles.statusButton, !item.is_active && styles.statusButtonOn]}
                        onPress={() => handleToggleStatus(item)}>
                        <Text style={[styles.statusButtonText, !item.is_active && styles.statusButtonTextOn]}>
                          {item.is_active ? t('admin.deactivate') : t('admin.activate')}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </>
  );
}
