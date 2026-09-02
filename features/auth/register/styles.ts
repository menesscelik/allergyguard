import { StyleSheet } from 'react-native';
import { Fonts, Palette, Radius, Shadows } from '@/constants/theme';
import { PRIMARY } from '@/components/form';

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  iconBadge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
    boxShadow: '0 10px 26px rgba(0,122,255,0.30)',
    marginBottom: 18,
  },
  icon: { fontSize: 29 },
  title: {
    fontFamily: Fonts.rounded,
    fontSize: 29,
    fontWeight: '700',
    letterSpacing: -0.5,
    textAlign: 'center',
    color: Palette.text,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
    color: Palette.textSecondary,
    marginTop: 8,
    marginBottom: 26,
    alignSelf: 'center',
    maxWidth: 320,
  },
  formCard: {
    padding: 22,
    borderRadius: Radius.xlarge,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: Shadows.card,
  },
  link: {
    color: PRIMARY,
    fontWeight: '700',
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 4,
    marginBottom: 16,
  },
  consentBox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: Palette.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  consentBoxOn: {
    borderColor: PRIMARY,
    backgroundColor: PRIMARY,
  },
  consentText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: Palette.textSecondary,
  },
  consentLink: {
    color: PRIMARY,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: Palette.textSecondary,
  },
});
