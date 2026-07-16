import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { Palette } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { LocalizationProvider, useLocalization } from '@/lib/localization-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootNavigator() {
  const { session, loading } = useAuth();
  const { t } = useLocalization();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="add-allergy"
          options={{ presentation: 'modal', title: t('allergies.addTitle') }}
        />
        <Stack.Screen name="drug-result" options={{ title: t('analysis.title') }} />
        <Stack.Screen name="scan" options={{ title: t('scan.title') }} />
        <Stack.Screen
          name="add-reminder"
          options={{ presentation: 'modal', title: t('reminders.addTitle') }}
        />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
      {/* Deklarasyon sırası önemli: bu ekran en sonda kalmalı, yoksa oturum yokken
          ilk erişilebilir ekran olarak login yerine bu açılır. Buraya normal akışta
          gidilmez; sadece şifre sıfırlama e-postasındaki bağlantı yönlendirir. */}
      <Stack.Screen
        name="reset-password"
        options={{ title: t('auth.reset.navTitle'), headerBackButtonDisplayMode: 'minimal' }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: Palette.primary,
      background: Palette.background,
      card: Palette.surface,
      text: Palette.text,
      border: Palette.border,
      notification: Palette.danger,
    },
  };

  return (
    <ThemeProvider value={navigationTheme}>
      <AuthProvider>
        <LocalizationProvider>
          <RootNavigator />
        </LocalizationProvider>
      </AuthProvider>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
