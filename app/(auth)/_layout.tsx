import { Stack } from 'expo-router';

import { NavigationBackButton } from '@/components/navigation-back-button';
import { Palette } from '@/constants/theme';
import { useLocalization } from '@/lib/localization-context';

export default function AuthLayout() {
  const { t } = useLocalization();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen
        name="register"
        options={{
          headerShown: true,
          title: t('auth.register.title'),
          headerBackTitle: 'Geri',
          headerBackButtonDisplayMode: 'default',
          headerLeft: () => <NavigationBackButton fallback="/(auth)/login" />,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Palette.background },
          headerTintColor: Palette.primary,
          headerTitleStyle: { color: Palette.text, fontWeight: '700' },
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          headerShown: true,
          title: t('auth.forgot.title'),
          headerLeft: () => <NavigationBackButton fallback="/(auth)/login" />,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Palette.background },
          headerTintColor: Palette.primary,
          headerTitleStyle: { color: Palette.text, fontWeight: '700' },
        }}
      />
    </Stack>
  );
}
