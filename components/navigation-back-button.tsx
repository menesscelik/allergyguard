import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { Pressable } from 'react-native';

import { Palette } from '@/constants/theme';

export function NavigationBackButton({ fallback }: { fallback: string }) {
  return (
    <Pressable
      accessibilityRole="button"
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
        borderRadius: 22,
        borderWidth: 1,
        borderColor: Palette.borderStrong,
        backgroundColor: Palette.surface,
        opacity: pressed ? 0.55 : 1,
        overflow: 'hidden',
      })}>
      <MaterialIcons name="chevron-left" size={31} color={Palette.primary} style={{ marginLeft: -1 }} />
    </Pressable>
  );
}
