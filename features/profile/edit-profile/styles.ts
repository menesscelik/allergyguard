import { StyleSheet } from 'react-native';

import { Palette, Radius, Shadows } from '@/constants/theme';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.background },
  content: { padding: 20, paddingTop: 12, paddingBottom: 40 },

  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.surface,
    borderRadius: Radius.xlarge,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: Shadows.soft,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: Palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Palette.primary, fontSize: 25, fontWeight: '700' },
  heroCopy: { flex: 1, marginLeft: 14 },
  eyebrow: { color: Palette.primary, fontSize: 10, fontWeight: '700', letterSpacing: 1.1 },
  name: { fontSize: 22, fontWeight: '700', color: Palette.text, marginTop: 2 },
  heroEmail: { color: Palette.textSecondary, fontSize: 12, marginTop: 2 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1,
    padding: 13,
    borderRadius: Radius.large,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: Shadows.soft,
    alignItems: 'center',
  },
  statCardDanger: {
    flex: 1,
    padding: 13,
    borderRadius: Radius.large,
    backgroundColor: Palette.dangerSoft,
    borderWidth: 1,
    borderColor: Palette.danger,
    alignItems: 'center',
  },
  statValue: { color: Palette.primary, fontSize: 22, fontWeight: '800', fontVariant: ['tabular-nums'] },
  statValueDanger: { color: Palette.danger, fontSize: 22, fontWeight: '800', fontVariant: ['tabular-nums'] },
  statLabel: { color: Palette.textSecondary, fontSize: 10, fontWeight: '700', marginTop: 3, textAlign: 'center' },

  emailLabel: { fontSize: 12, color: Palette.textSecondary },
  email: { fontSize: 16, fontWeight: '600', color: Palette.text, marginTop: 2 },
  card: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.large,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: Shadows.soft,
  },
});
