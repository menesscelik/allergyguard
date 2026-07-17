import { StyleSheet } from 'react-native';
import { Palette, Radius, Shadows } from '@/constants/theme';
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
    width: 68, height: 68, borderRadius: 24, alignSelf: 'center',
    alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.primary,
    boxShadow: Shadows.hero,
  },
  icon: { fontSize: 29 },
  title: {
    fontSize: 31,
    fontWeight: '900',
    textAlign: 'center',
    color: Palette.text,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: Palette.textSecondary,
    marginTop: 4,
    marginBottom: 24,
  },
  formCard: {
    padding: 20, borderRadius: Radius.xlarge, backgroundColor: Palette.surface,
    borderWidth: 1, borderColor: Palette.border,
    boxShadow: Shadows.card,
  },
  link: {
    color: PRIMARY,
    fontWeight: '600',
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

