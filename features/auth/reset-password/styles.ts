import { StyleSheet } from 'react-native';
import { Palette, Radius } from '@/constants/theme';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.background },
  keyboard: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: Palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  icon: { fontSize: 31 },
  title: {
    color: Palette.text,
    fontSize: 27,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 18,
  },
  subtitle: {
    color: Palette.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
  },
  card: {
    padding: 20,
    borderRadius: Radius.large,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: '0 12px 32px rgba(23, 32, 51, 0.08)',
  },
  errorCard: {
    padding: 20,
    borderRadius: Radius.large,
    backgroundColor: Palette.dangerSoft,
    borderWidth: 1,
    borderColor: Palette.danger,
  },
  errorTitle: { color: Palette.danger, fontSize: 16, fontWeight: '800' },
  errorText: { color: Palette.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 6 },
});


