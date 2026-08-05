import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Palette } from '@/constants/theme';

// Load expo-glass-effect defensively: if the native module isn't linked into the
// current build, `require` (or the availability call) throws — we catch it and fall
// back to a translucent surface instead of crashing the app on launch.
let glass: typeof import('expo-glass-effect') | null = null;
let glassSupported = false;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  glass = require('expo-glass-effect');
  glassSupported = glass?.isLiquidGlassAvailable?.() ?? false;
} catch {
  glass = null;
  glassSupported = false;
}

type LiquidGlassProps = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** iOS 26 glass material: 'regular' (default, frosted) or 'clear' (more transparent). */
  glassEffectStyle?: 'regular' | 'clear';
  tintColor?: string;
  /** Reacts to touch with the fluid highlight. Good for buttons/FABs. */
  interactive?: boolean;
  radius?: number;
};

/**
 * Wraps Apple's iOS 26 Liquid Glass (`expo-glass-effect`).
 * Falls back to a translucent frosted surface on Android / older iOS / when the
 * native module isn't available, so the UI stays cohesive and never crashes.
 */
export function LiquidGlass({
  children,
  style,
  glassEffectStyle = 'regular',
  tintColor,
  interactive = false,
  radius,
}: LiquidGlassProps) {
  const radiusStyle = radius != null ? { borderRadius: radius } : null;

  if (glassSupported && glass?.GlassView) {
    const GlassView = glass.GlassView;
    return (
      <GlassView
        style={[radiusStyle, style]}
        glassEffectStyle={glassEffectStyle}
        tintColor={tintColor}
        isInteractive={interactive}>
        {children}
      </GlassView>
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        radiusStyle,
        tintColor ? { backgroundColor: tintColor } : null,
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: Palette.surfaceGlass,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.border,
  },
});
