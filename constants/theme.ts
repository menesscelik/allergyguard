/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { DynamicColorIOS, Platform } from 'react-native';

function adaptive(light: string, dark: string) {
  if (Platform.OS === 'ios') {
    return DynamicColorIOS({ light, dark } as never) as unknown as string;
  }
  return light;
}

/**
 * AllergyGuard color system.
 * iOS-style grouped surfaces with a single clear blue accent.
 */
export const Palette = {
  primary: '#007AFF',
  primaryPressed: '#0057D9',
  primarySoft: adaptive('#EAF3FF', '#102A45'),
  primaryBorder: adaptive('#B9DAFF', '#255A91'),
  accent: '#5856D6',
  accentSoft: adaptive('#F0EFFF', '#23214A'),
  accentPressed: '#4745B8',
  coral: '#FF3B30',
  coralSoft: adaptive('#FFEDEC', '#461412'),
  sky: '#5AC8FA',
  skySoft: adaptive('#EAF8FF', '#123648'),
  onPrimaryMuted: 'rgba(255, 255, 255, 0.72)',
  onPrimarySurface: 'rgba(255, 255, 255, 0.14)',
  background: adaptive('#F2F2F7', '#000000'),
  surface: adaptive('#FFFFFF', '#1C1C1E'),
  surfaceGlass: adaptive('rgba(255, 255, 255, 0.92)', 'rgba(28, 28, 30, 0.90)'),
  surfaceMuted: adaptive('#F7F7FA', '#2C2C2E'),
  text: adaptive('#1C1C1E', '#F5F5F7'),
  textSecondary: adaptive('#6E6E73', '#C7C7CC'),
  textMuted: adaptive('#8E8E93', '#8E8E93'),
  border: adaptive('#DADAE0', '#38383A'),
  borderStrong: adaptive('#C6C6CC', '#48484A'),
  success: '#34C759',
  successSoft: adaptive('#EAF8EE', '#12351E'),
  successBright: '#30D158',
  warning: '#FF9500',
  warningSoft: adaptive('#FFF4E3', '#422909'),
  warningBorder: adaptive('#FFD9A3', '#A96500'),
  severityMild: '#D18800',
  severityModerate: '#FF9500',
  danger: '#E11D48',
  dangerSoft: adaptive('#FFF0F3', '#45101C'),
  premium: '#AF52DE',
  premiumSoft: adaptive('#F8EDFC', '#351542'),
  premiumBorder: adaptive('#E6C4F2', '#7D3DA0'),
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const Radius = {
  small: 10,
  medium: 12,
  large: 18,
  xlarge: 24,
  pill: 999,
} as const;

export const Shadows = {
  soft: '0 2px 8px rgba(0, 0, 0, 0.05)',
  card: '0 6px 18px rgba(0, 0, 0, 0.07)',
  hero: '0 8px 24px rgba(0, 122, 255, 0.12)',
  accent: '0 8px 24px rgba(88, 86, 214, 0.12)',
  danger: '0 8px 20px rgba(225, 29, 72, 0.10)',
} as const;

export const Colors = {
  light: {
    text: Palette.text,
    background: Palette.background,
    tint: Palette.primary,
    icon: Palette.textSecondary,
    tabIconDefault: Palette.textMuted,
    tabIconSelected: Palette.primary,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: Palette.primaryBorder,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: Palette.primaryBorder,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
