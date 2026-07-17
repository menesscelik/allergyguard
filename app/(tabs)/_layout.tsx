import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { PRIMARY } from '@/components/form';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette } from '@/constants/theme';
import { syncAllNotifications } from '@/lib/notifications';
import { useLocalization } from '@/lib/localization-context';

export default function TabLayout() {
  const { t } = useLocalization();
  // Uygulama açılınca zamanlanmış bildirimleri veritabanıyla eşitle
  useEffect(() => {
    syncAllNotifications().catch(() => {});
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: PRIMARY,
        tabBarInactiveTintColor: Palette.textMuted,
        tabBarStyle: {
          position: 'absolute',
          left: 14,
          right: 14,
          bottom: 10,
          backgroundColor: Palette.surfaceGlass,
          borderTopWidth: 0,
          height: 74,
          paddingTop: 8,
          paddingBottom: 10,
          borderRadius: 26,
          boxShadow: '0 -10px 32px rgba(23, 32, 51, 0.12)',
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '800' },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.allergies'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet" color={color} />,
        }}
      />
      <Tabs.Screen
        name="test"
        options={{
          title: t('tabs.test'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="pills.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t('tabs.history'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="clock.arrow.circlepath" color={color} />,
        }}
      />
      <Tabs.Screen
        name="reminders"
        options={{
          title: t('tabs.reminders'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="alarm.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
