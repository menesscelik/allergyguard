import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { Palette } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/lib/auth-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootNavigator() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen
        name="reset-password"
        options={{ title: 'Yeni Şifre', headerBackButtonDisplayMode: 'minimal' }}
      />
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="add-allergy"
          options={{ presentation: 'modal', title: 'Alerji Ekle' }}
        />
        <Stack.Screen name="drug-result" options={{ title: 'İlaç Analizi' }} />
        <Stack.Screen name="scan" options={{ title: 'Barkod Tara' }} />
        <Stack.Screen
          name="add-reminder"
          options={{ presentation: 'modal', title: 'Hatırlatıcı Ekle' }}
        />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
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
        <RootNavigator />
      </AuthProvider>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
