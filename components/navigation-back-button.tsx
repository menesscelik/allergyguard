import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { Platform, Pressable } from 'react-native';

import { Palette } from '@/constants/theme';
import { useThemePreference } from '@/lib/theme-preferences';

// iOS 26+ wraps header bar buttons in a native "Liquid Glass" circle automatically.
// On those versions we must NOT draw our own circle, otherwise it nests inside the
// glass ("iç içe iki daire"). On older iOS / Android we draw the circle ourselves.
const iosMajor = Platform.OS === 'ios' ? parseInt(String(Platform.Version), 10) || 0 : 0;
const hasNativeGlass = Platform.OS === 'ios' && iosMajor >= 26;

export function NavigationBackButton({ fallback }: { fallback: string }) {
  const { effectiveScheme } = useThemePreference();
  const isDark = effectiveScheme === 'dark';

  const chevronColor = isDark ? Palette.white : Palette.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      hitSlop={12}
      onPress={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace(fallback as never);
        }
      }}
      style={({ pressed }) => ({
        alignItems: 'center',
        justifyContent: 'center',
        width: 44,
        height: 44,
        opacity: pressed ? 0.72 : 1,
        // On iOS 26+ leave it transparent so only the native glass circle shows.
        ...(hasNativeGlass
          ? null
          : {
              borderRadius: 22,
              borderWidth: 1,
              backgroundColor: isDark ? 'rgba(22,26,31,0.92)' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.08)',
              shadowColor: '#000000',
              shadowOpacity: isDark ? 0.4 : 0.12,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 3 },
              elevation: 4,
            }),
      })}>
      <MaterialIcons
        name="chevron-left"
        size={30}
        color={chevronColor}
        style={{ marginLeft: 2 }}
      />
    </Pressable>
  );
}
