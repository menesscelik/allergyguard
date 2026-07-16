import { StyleSheet } from 'react-native';
import { Palette, Radius } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  drugHero: {
    flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18,
    borderRadius: Radius.large, backgroundColor: Palette.accentSoft,
    borderWidth: 1, borderColor: Palette.premiumBorder, marginBottom: 20,
  },
  drugBadge: {
    width: 50, height: 50, borderRadius: 17, alignItems: 'center',
    justifyContent: 'center', backgroundColor: Palette.surface,
  },
  drugEmoji: { fontSize: 27 },
  heroEyebrow: { color: Palette.accent, fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  drugName: {
    fontSize: 23,
    fontWeight: '800',
    color: Palette.text,
    marginTop: 3,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.textSecondary,
    marginBottom: 6,
  },
  ingredient: {
    fontSize: 15,
    color: Palette.textSecondary,
    lineHeight: 22,
  },
  error: {
    color: Palette.warning,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 16,
    textAlign: 'center',
  },
  resultCard: {
    borderWidth: 1,
    borderRadius: Radius.medium,
    padding: 18,
    marginTop: 8,
  },
  riskTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
  },
  matchedBox: {
    marginBottom: 10,
  },
  matchedTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  matchedItem: {
    fontSize: 15,
    lineHeight: 22,
  },
  explanation: {
    fontSize: 15,
    color: Palette.textSecondary,
    lineHeight: 22,
  },
  recommendation: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.text,
    marginTop: 10,
    lineHeight: 22,
  },
  evidenceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  evidenceChip: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  evidenceText: { color: Palette.textSecondary, fontSize: 10, fontWeight: '700' },
  fallbackNote: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 10,
  },
  saveButton: {
    borderWidth: 1.5,
    borderColor: Palette.danger,
    borderRadius: Radius.medium,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 14,
  },
  saveButtonDone: {
    borderColor: Palette.success,
    backgroundColor: Palette.successSoft,
  },
  saveButtonText: {
    color: Palette.danger,
    fontSize: 15,
    fontWeight: '700',
  },
  saveButtonTextDone: {
    color: Palette.success,
  },
  disclaimer: {
    fontSize: 13,
    color: Palette.textSecondary,
    marginTop: 24,
    lineHeight: 19,
    textAlign: 'center',
  },
});


