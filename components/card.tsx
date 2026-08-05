import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Palette, Radius, Shadows } from '@/constants/theme';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Tutarlı gruplu yüzey. Apple gibi tek vurgu: sınır yerine yumuşak gölge.
 */
export function Card({ children, style }: Props) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.xlarge,
    padding: 16,
    boxShadow: Shadows.card,
  },
});
