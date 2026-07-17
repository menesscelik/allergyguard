import { StyleSheet } from 'react-native';

import { Palette, Radius, Shadows } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  content: { paddingVertical: 18, paddingBottom: 44, gap: 14 },
  hero: {
    borderRadius: Radius.xlarge,
    padding: 20,
    backgroundColor: Palette.danger,
    boxShadow: Shadows.danger,
  },
  badge: { fontSize: 34, marginBottom: 8 },
  title: { color: Palette.white, fontWeight: '900', lineHeight: 34 },
  name: { color: Palette.white, fontSize: 18, fontWeight: '900', marginTop: 12 },
  email: { color: Palette.onPrimaryMuted, fontSize: 13, marginTop: 2 },
  alertCard: {
    borderRadius: Radius.xlarge,
    padding: 16,
    backgroundColor: Palette.dangerSoft,
    borderWidth: 1.5,
    borderColor: Palette.danger,
  },
  card: {
    borderRadius: Radius.xlarge,
    padding: 16,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: Shadows.soft,
  },
  sectionTitle: { color: Palette.text, fontSize: 16, fontWeight: '900', marginBottom: 10 },
  strongLine: { color: Palette.danger, fontSize: 16, fontWeight: '900', lineHeight: 24 },
  muted: { color: Palette.textSecondary, fontSize: 14, lineHeight: 20 },
  allergyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
  },
  allergyCopy: { flex: 1, minWidth: 0 },
  allergyName: { color: Palette.text, fontSize: 15, fontWeight: '900' },
  ingredients: { color: Palette.textSecondary, fontSize: 12, marginTop: 3 },
  severity: { color: Palette.textMuted, fontSize: 12, fontWeight: '900' },
  severityDanger: { color: Palette.danger },
  disclaimer: { color: Palette.textSecondary, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 4 },
});
