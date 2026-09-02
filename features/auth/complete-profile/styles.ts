import { StyleSheet } from 'react-native';

import { Fonts, Palette, Radius, Shadows } from '@/constants/theme';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.background },
  content: { flexGrow: 1, justifyContent: 'center', paddingVertical: 28 },

  heroIcon: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: Palette.primary,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 26px rgba(0,122,255,0.30)',
  },
  title: {
    fontFamily: Fonts.rounded,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.4,
    color: Palette.text,
    textAlign: 'center',
    marginTop: 18,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 21,
    color: Palette.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    alignSelf: 'center',
    maxWidth: 320,
  },
  card: {
    padding: 20,
    borderRadius: Radius.xlarge,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: Shadows.soft,
  },
});
