import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { ErrorBoundary } from '@/components/error-boundary';
import { NavigationBackButton } from '@/components/navigation-back-button';
import { KeyboardDismissAccessory } from '@/components/keyboard-dismiss-accessory';
import { Palette } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { LocalizationProvider, useLocalization } from '@/lib/localization-context';
import { initMonitoring } from '@/lib/monitoring';
import { OnboardingProvider, useOnboarding } from '@/lib/onboarding-context';
import { ThemePreferenceProvider, useThemePreference } from '@/lib/theme-preferences';

initMonitoring();

export const unstable_settings = {
  anchor: '(auth)',
};

const PUBLIC_AUTH_PATHS = new Set(['/login', '/register', '/forgot-password', '/reset-password', '/auth/callback', '/callback']);
const AUTH_ENTRY_PATHS = new Set(['/login', '/register', '/forgot-password']);
const PASSWORD_RESET_PATHS = new Set(['/reset-password', '/auth/callback', '/callback']);

function normalizePath(pathname: string) {
  return pathname.replace(/\/$/, '') || '/';
}

function RootNavigator() {
  const { session, loading } = useAuth();
  const onboarding = useOnboarding();
  const { t } = useLocalization();
  const pathname = normalizePath(usePathname());
  const isAuthenticated = Boolean(session?.user?.id);

  useEffect(() => {
    if (loading || onboarding.loading) {
      return;
    }

    // Şifre sıfırlama derin bağlantıları her şeyin önünde geçer.
    if (PASSWORD_RESET_PATHS.has(pathname)) {
      return;
    }

    // İlk açılış: tanıtım henüz görülmediyse önce onu göster (giriş öncesi).
    if (!onboarding.seen) {
      if (pathname !== '/onboarding') {
        router.replace('/onboarding' as never);
      }
      return;
    }

    if (!isAuthenticated) {
      if (!PUBLIC_AUTH_PATHS.has(pathname)) {
        router.replace('/(auth)/login' as never);
      }
      return;
    }

    if (AUTH_ENTRY_PATHS.has(pathname) || pathname === '/onboarding') {
      router.replace('/(tabs)' as never);
    }
  }, [isAuthenticated, loading, onboarding.loading, onboarding.seen, pathname]);

  if (loading || onboarding.loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Tanıtım (onboarding) ilk açılışta, giriş ekranından ÖNCE gösterilir.
  // Şifre sıfırlama derin bağlantıları bu kapıdan muaftır.
  if (!onboarding.seen && !PASSWORD_RESET_PATHS.has(pathname)) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack>
    );
  }

  if (!isAuthenticated) {
    return (
      <Stack
        initialRouteName="(auth)"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          headerTintColor: Palette.primary,
          headerTitleStyle: { color: Palette.text, fontWeight: '900' },
          headerShadowVisible: false,
          headerBackVisible: false,
          headerStyle: { backgroundColor: Palette.background },
          headerLeft: () => <NavigationBackButton fallback="/(auth)/login" />,
        }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false, headerLeft: undefined, gestureEnabled: false }} />
        <Stack.Screen
          name="reset-password"
          options={{ headerShown: true, title: t('auth.reset.navTitle'), headerBackButtonDisplayMode: 'minimal' }}
        />
        <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
        <Stack.Screen name="callback" options={{ headerShown: false }} />
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
        headerBackVisible: false,
        headerStyle: { backgroundColor: Palette.background },
        headerLeft: () => <NavigationBackButton fallback="/(tabs)" />,
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false, headerLeft: undefined, gestureEnabled: false }} />
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
      <Stack.Screen name="history" options={{ headerShown: true, title: t('tabs.history') }} />
      <Stack.Screen name="family-member" options={{ headerShown: true, title: t('family.memberTitle') }} />
      <Stack.Screen name="admin" options={{ headerShown: true, title: t('admin.title') }} />
      <Stack.Screen name="scan" options={{ headerShown: true, title: t('scan.title') }} />
      <Stack.Screen
        name="add-reminder"
        options={{ headerShown: true, presentation: 'modal', title: t('reminders.addTitle') }}
      />
      <Stack.Screen
        name="reset-password"
        options={{ headerShown: true, title: t('auth.reset.navTitle'), headerBackButtonDisplayMode: 'minimal' }}
      />
      <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
      <Stack.Screen name="callback" options={{ headerShown: false }} />
    </Stack>
  );
}

function AppShell() {
  const { effectiveScheme } = useThemePreference();
  const baseTheme = effectiveScheme === 'dark' ? DarkTheme : DefaultTheme;
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
          <KeyboardDismissAccessory />
        </LocalizationProvider>
      </AuthProvider>
      <StatusBar style={effectiveScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemePreferenceProvider>
          <AppShell />
        </ThemePreferenceProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
