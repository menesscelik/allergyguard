import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, useColorScheme, View } from 'react-native';
import 'react-native-reanimated';

import { Palette } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { LocalizationProvider, useLocalization } from '@/lib/localization-context';
import { OnboardingProvider, useOnboarding } from '@/lib/onboarding-context';

export const unstable_settings = {
  anchor: '(auth)',
};

function RootNavigator() {
  const { session, loading } = useAuth();
  const onboarding = useOnboarding();
  const { t } = useLocalization();

  if (loading || onboarding.loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session) {
    return (
      <Stack
        initialRouteName="(auth)"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          headerTintColor: Palette.primary,
          headerTitleStyle: { color: Palette.text, fontWeight: '900' },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Palette.background },
        }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen
          name="reset-password"
          options={{ headerShown: true, title: t('auth.reset.navTitle'), headerBackButtonDisplayMode: 'minimal' }}
        />
      </Stack>
    );
  }

  if (!onboarding.seen) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        headerTintColor: Palette.primary,
        headerTitleStyle: { color: Palette.text, fontWeight: '900' },
        headerShadowVisible: false,
        headerStyle: { backgroundColor: Palette.background },
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="add-allergy"
        options={{ headerShown: true, presentation: 'modal', title: t('allergies.addTitle') }}
      />
      <Stack.Screen name="allergy-detail" options={{ headerShown: true, title: t('allergyDetail.title') }} />
      <Stack.Screen name="drug-result" options={{ headerShown: true, title: t('analysis.title') }} />
      <Stack.Screen name="analysis-detail" options={{ headerShown: true, title: t('analysis.detailTitle') }} />
      <Stack.Screen name="premium" options={{ headerShown: true, title: t('premium.title') }} />
      <Stack.Screen name="settings" options={{ headerShown: true, title: t('settings.title') }} />
      <Stack.Screen name="emergency-card" options={{ headerShown: true, title: t('emergency.title') }} />
      <Stack.Screen name="interaction-check" options={{ headerShown: true, title: t('interaction.title') }} />
      <Stack.Screen name="feedback" options={{ headerShown: true, title: t('feedback.title') }} />
      <Stack.Screen name="scan" options={{ headerShown: true, title: t('scan.title') }} />
      <Stack.Screen
        name="add-reminder"
        options={{ headerShown: true, presentation: 'modal', title: t('reminders.addTitle') }}
      />
      <Stack.Screen
        name="reset-password"
        options={{ headerShown: true, title: t('auth.reset.navTitle'), headerBackButtonDisplayMode: 'minimal' }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const baseTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
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
          <OnboardingProvider>
            <RootNavigator />
          </OnboardingProvider>
        </LocalizationProvider>
      </AuthProvider>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
