import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Palette } from '@/constants/theme';

type Props = {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Nabız gibi yanıp sönen yükleme placeholder'ı (RN Animated — worklet yok).
 */
export function Skeleton({ width = '100%', height = 16, radius = 8, style }: Props) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[{ width, height, borderRadius: radius, backgroundColor: Palette.surfaceMuted, opacity }, style]}
    />
  );
}

export function SkeletonCard() {
  return (
    <Animated.View style={styles.card}>
      <Skeleton width={46} height={46} radius={15} />
      <Animated.View style={styles.cardCopy}>
        <Skeleton width="60%" height={15} />
        <Skeleton width="40%" height={12} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    marginBottom: 12,
  },
  cardCopy: { flex: 1, gap: 8 },
});
