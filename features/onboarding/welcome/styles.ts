import { StyleSheet } from 'react-native';

import { Palette, Radius, Shadows } from '@/constants/theme';

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Palette.background,
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
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  logoText: {
    fontSize: 34,
  },
  eyebrow: {
    color: Palette.primary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginTop: 8,
  },
  title: {
    color: Palette.text,
    fontSize: 38,
    lineHeight: 43,
    fontWeight: '900',
  },
  subtitle: {
    color: Palette.textSecondary,
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
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: Shadows.soft,
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
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  noticeTitle: {
    color: Palette.text,
    fontSize: 14,
    fontWeight: '900',
  },
  noticeText: {
    color: Palette.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  button: {
    marginTop: 'auto',
    borderRadius: Radius.large,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: Palette.primary,
    boxShadow: Shadows.soft,
  },
  buttonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  buttonText: {
    color: Palette.white,
    fontSize: 16,
    fontWeight: '900',
  },
});
