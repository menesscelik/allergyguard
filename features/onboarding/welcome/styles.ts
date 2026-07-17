import { StyleSheet } from 'react-native';

import { Palette, Radius, Shadows } from '@/constants/theme';

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Palette.primary,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 72,
    paddingBottom: 34,
    gap: 22,
  },
  hero: {
    gap: 10,
  },
  logo: {
    width: 66,
    height: 66,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.onPrimarySurface,
    borderWidth: 1,
    borderColor: Palette.primaryBorder,
  },
  logoText: {
    fontSize: 34,
  },
  eyebrow: {
    color: Palette.primaryBorder,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginTop: 8,
  },
  title: {
    color: Palette.white,
    fontSize: 38,
    lineHeight: 43,
    fontWeight: '900',
  },
  subtitle: {
    color: Palette.onPrimaryMuted,
    fontSize: 16,
    lineHeight: 23,
  },
  cardStack: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: Radius.xlarge,
    backgroundColor: Palette.surface,
    boxShadow: Shadows.card,
  },
  cardFeatured: {
    transform: [{ scale: 1.02 }],
    borderWidth: 1.5,
    borderColor: Palette.primaryBorder,
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.primarySoft,
  },
  cardEmoji: {
    fontSize: 26,
  },
  cardCopy: {
    flex: 1,
  },
  cardTitle: {
    color: Palette.text,
    fontSize: 16,
    fontWeight: '900',
  },
  cardText: {
    color: Palette.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },
  notice: {
    padding: 16,
    borderRadius: Radius.xlarge,
    backgroundColor: Palette.onPrimarySurface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  noticeTitle: {
    color: Palette.white,
    fontSize: 14,
    fontWeight: '900',
  },
  noticeText: {
    color: Palette.onPrimaryMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  button: {
    marginTop: 'auto',
    borderRadius: Radius.large,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: Palette.white,
    boxShadow: Shadows.card,
  },
  buttonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  buttonText: {
    color: Palette.primary,
    fontSize: 16,
    fontWeight: '900',
  },
});
