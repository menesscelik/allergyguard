import { StyleSheet } from 'react-native';

import { Palette, Radius, Shadows } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  content: { padding: 20, paddingBottom: 44, gap: 14 },
  hero: {
    alignItems: 'center',
    padding: 22,
    borderRadius: Radius.xlarge,
    borderWidth: 1.5,
  },
  heroEmoji: { fontSize: 40 },
  riskTitle: { fontSize: 22, fontWeight: '900', marginTop: 8 },
  drugName: { color: Palette.text, fontSize: 25, fontWeight: '900', textAlign: 'center', marginTop: 4 },
  date: { color: Palette.textSecondary, fontSize: 12, marginTop: 6 },
  section: {
    padding: 16,
    borderRadius: Radius.xlarge,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: Shadows.soft,
  },
  sectionTitle: { color: Palette.text, fontSize: 16, fontWeight: '900', marginBottom: 10 },
  ingredientRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  bullet: { color: Palette.primary, fontWeight: '900' },
  ingredientText: { flex: 1, color: Palette.textSecondary, fontSize: 14, lineHeight: 20 },
  muted: { color: Palette.textMuted, fontSize: 14, lineHeight: 20 },
  matchChip: {
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    paddingHorizontal: 11,
    paddingVertical: 7,
    marginBottom: 7,
  },
  matchText: { fontSize: 13, fontWeight: '900' },
  bodyText: { color: Palette.textSecondary, fontSize: 15, lineHeight: 22 },
  recommendation: {
    padding: 16,
    borderRadius: Radius.xlarge,
    backgroundColor: Palette.surface,
    borderWidth: 1.5,
  },
  recommendationTitle: { color: Palette.text, fontSize: 16, fontWeight: '900', marginBottom: 8 },
  timeline: {
    padding: 16,
    borderRadius: Radius.xlarge,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    gap: 8,
  },
  timelineTitle: { color: Palette.primary, fontSize: 15, fontWeight: '900' },
  timelineText: { color: Palette.textSecondary, fontSize: 13, lineHeight: 19 },
  disclaimer: { color: Palette.textSecondary, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 4 },
});
