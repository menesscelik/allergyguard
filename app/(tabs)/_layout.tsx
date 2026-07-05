import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { PRIMARY } from '@/components/form';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette } from '@/constants/theme';
import { syncAllNotifications } from '@/lib/notifications';

export default function TabLayout() {
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
          backgroundColor: Palette.surface,
          borderTopWidth: 0,
          height: 76,
          paddingTop: 8,
          paddingBottom: 8,
          boxShadow: '0 -6px 24px rgba(19, 46, 50, 0.08)',
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Alerjilerim',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet" color={color} />,
        }}
      />
      <Tabs.Screen
        name="test"
        options={{
          title: 'İlaç Testi',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="pills.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="reminders"
        options={{
          title: 'Hatırlatıcı',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="alarm.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
