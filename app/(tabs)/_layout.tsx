import { Redirect } from 'expo-router';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { SwipeableTabsShell } from '@/components/swipeable-tabs-shell';
import { Palette } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { useLocalization } from '@/lib/localization-context';
import { syncAllNotifications } from '@/lib/notifications';

export default function TabLayout() {
  const { session, loading } = useAuth();
  const { t } = useLocalization();
  // Uygulama açılınca zamanlanmış bildirimleri veritabanıyla eşitle
  useEffect(() => {
    if (session?.user?.id) {
      syncAllNotifications().catch(() => {});
    }
  }, [session?.user?.id]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session?.user?.id) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <SwipeableTabsShell>
      <NativeTabs
        blurEffect="systemMaterial"
        iconColor={{ default: Palette.textMuted, selected: Palette.primary }}
        labelStyle={{
          default: {
            fontSize: 11,
            fontWeight: '600',
          },
          selected: {
            color: Palette.primary,
            fontSize: 11,
            fontWeight: '700',
          },
        }}
        minimizeBehavior="onScrollDown"
        tintColor={Palette.primary}>
        <NativeTabs.Trigger name="index">
          <Icon sf={{ default: 'list.bullet', selected: 'list.bullet' }} drawable="ic_menu_sort_by_size" />
          <Label>{t('tabs.allergies')}</Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="test">
          <Icon sf={{ default: 'pills', selected: 'pills.fill' }} drawable="ic_menu_search" />
          <Label>{t('tabs.test')}</Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="family">
          <Icon sf={{ default: 'person.2', selected: 'person.2.fill' }} drawable="ic_menu_myplaces" />
          <Label>{t('tabs.family')}</Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="reminders">
          <Icon sf={{ default: 'alarm', selected: 'alarm.fill' }} drawable="ic_lock_idle_alarm" />
          <Label>{t('tabs.reminders')}</Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="profile">
          <Icon sf={{ default: 'gearshape', selected: 'gearshape.fill' }} drawable="ic_menu_manage" />
          <Label>{t('tabs.settings')}</Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </SwipeableTabsShell>
  );
}
