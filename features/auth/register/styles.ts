import { StyleSheet } from 'react-native';
import { Palette } from '@/constants/theme';
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
    width: 60, height: 60, borderRadius: 20, alignSelf: 'center',
    alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.primarySoft,
  },
  icon: { fontSize: 29 },
  title: {
    fontSize: 28,
    fontWeight: '800',
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
    padding: 20, borderRadius: 22, backgroundColor: Palette.surface,
    borderWidth: 1, borderColor: Palette.border,
    boxShadow: '0 12px 32px rgba(23, 32, 51, 0.08)',
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


