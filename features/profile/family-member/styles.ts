import { StyleSheet } from 'react-native';

import { Palette, Radius, Shadows } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  content: { paddingTop: 12, paddingBottom: 44, gap: 12 },

  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.surface,
    borderRadius: Radius.xlarge,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: Shadows.soft,
    paddingVertical: 16,
    marginBottom: 4,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValueRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statValue: { color: Palette.text, fontSize: 22, fontWeight: '700' },
  statLabel: { color: Palette.textSecondary, fontSize: 11, fontWeight: '600' },
  statDivider: { width: 1, height: 34, backgroundColor: Palette.border },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: Palette.text, marginLeft: 4, marginTop: 4 },
  empty: { fontSize: 13, color: Palette.textMuted, marginLeft: 4 },

  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: Radius.large,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: Shadows.soft,
  },
  cardOff: { opacity: 0.55 },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: Palette.warningSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: { fontSize: 17, fontWeight: '700', color: Palette.text },
  drugName: { fontSize: 15, fontWeight: '700', color: Palette.text, marginTop: 2 },
  days: { fontSize: 12, color: Palette.textSecondary, marginTop: 2 },
  notes: { fontSize: 12, color: Palette.textMuted, marginTop: 4 },
});
