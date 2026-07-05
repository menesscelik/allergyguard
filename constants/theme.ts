/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

/**
 * AllergyGuard color system.
 * Vibrant teal communicates energy and trust; indigo and coral add personality.
 */
export const Palette = {
  primary: '#0B8178',
  primaryPressed: '#08665F',
  primarySoft: '#CCFBF1',
  primaryBorder: '#5EEAD4',
  accent: '#4F46E5',
  accentSoft: '#E0E7FF',
  onPrimaryMuted: 'rgba(255, 255, 255, 0.72)',
  onPrimarySurface: 'rgba(255, 255, 255, 0.14)',
  background: '#F7F8FC',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF2FF',
  text: '#172033',
  textSecondary: '#5B6478',
  textMuted: '#8B93A7',
  border: '#E2E5F0',
  borderStrong: '#CBD0DF',
  success: '#059669',
  successSoft: '#D1FAE5',
  successBright: '#6EE7B7',
  warning: '#B45309',
  warningSoft: '#FEF3C7',
  warningBorder: '#FCD34D',
  severityMild: '#CA8A04',
  severityModerate: '#EA580C',
  danger: '#E11D48',
  dangerSoft: '#FFE4E6',
  premium: '#7C3AED',
  premiumSoft: '#EDE9FE',
  premiumBorder: '#C4B5FD',
  white: '#FFFFFF',
  black: '#0A1719',
} as const;

export const Radius = {
  small: 10,
  medium: 14,
  large: 20,
  pill: 999,
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
