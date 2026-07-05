import { Stack } from 'expo-router';

import { Palette } from '@/constants/theme';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen
        name="register"
        options={{
          headerShown: true,
          title: 'Kayıt Ol',
          headerBackTitle: 'Geri',
          headerBackButtonDisplayMode: 'default',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Palette.background },
          headerTintColor: Palette.primary,
          headerTitleStyle: { color: Palette.text, fontWeight: '700' },
        }}
      />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
