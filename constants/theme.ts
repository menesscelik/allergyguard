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
 * Vibrant teal communicates energy and trust; indigo and coral add personality.
 */
export const Palette = {
  primary: '#089A8F',
  primaryPressed: '#067C73',
  primarySoft: adaptive('#C9FFF7', '#073B38'),
  primaryBorder: adaptive('#67F6E7', '#20D8CB'),
  accent: '#5B4BFF',
  accentSoft: adaptive('#E8E7FF', '#211B56'),
  accentPressed: '#4637D8',
  coral: '#FF5C7A',
  coralSoft: adaptive('#FFE7ED', '#4E1421'),
  sky: '#0EA5E9',
  skySoft: adaptive('#E0F2FE', '#0B2F44'),
  onPrimaryMuted: 'rgba(255, 255, 255, 0.72)',
  onPrimarySurface: 'rgba(255, 255, 255, 0.14)',
  background: adaptive('#F4F7FF', '#0B1020'),
  surface: adaptive('#FFFFFF', '#151B2D'),
  surfaceGlass: adaptive('rgba(255, 255, 255, 0.86)', 'rgba(21, 27, 45, 0.88)'),
  surfaceMuted: adaptive('#EEF2FF', '#202942'),
  text: adaptive('#172033', '#F6F8FF'),
  textSecondary: adaptive('#5B6478', '#B8C1D8'),
  textMuted: adaptive('#8B93A7', '#7E8AA5'),
  border: adaptive('#E4E8F5', '#28324A'),
  borderStrong: adaptive('#CBD0DF', '#3A4663'),
  success: '#059669',
  successSoft: adaptive('#D1FAE5', '#063D2A'),
  successBright: '#6EE7B7',
  warning: '#B45309',
  warningSoft: adaptive('#FEF3C7', '#4A3106'),
  warningBorder: adaptive('#FCD34D', '#F59E0B'),
  severityMild: '#CA8A04',
  severityModerate: '#EA580C',
  danger: '#E11D48',
  dangerSoft: adaptive('#FFE4E6', '#4E0D1B'),
  premium: '#7C3AED',
  premiumSoft: adaptive('#EDE9FE', '#2B174E'),
  premiumBorder: adaptive('#C4B5FD', '#A78BFA'),
  white: '#FFFFFF',
  black: '#0A1719',
} as const;

export const Radius = {
  small: 10,
  medium: 16,
  large: 24,
  xlarge: 30,
  pill: 999,
} as const;

export const Shadows = {
  soft: '0 8px 22px rgba(23, 32, 51, 0.07)',
  card: '0 12px 30px rgba(23, 32, 51, 0.10)',
  hero: '0 18px 44px rgba(11, 129, 120, 0.22)',
  accent: '0 18px 44px rgba(79, 70, 229, 0.22)',
  danger: '0 14px 32px rgba(225, 29, 72, 0.16)',
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
