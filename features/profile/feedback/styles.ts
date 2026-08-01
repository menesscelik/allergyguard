import { StyleSheet } from 'react-native';

import { Palette, Radius, Shadows } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  content: { paddingVertical: 18, paddingBottom: 44, gap: 14 },
  hero: {
    borderRadius: Radius.xlarge,
    padding: 20,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: Shadows.soft,
  },
  badge: { fontSize: 34, marginBottom: 8 },
  title: { color: Palette.text, fontWeight: '900' },
  subtitle: { color: Palette.textSecondary, fontSize: 14, lineHeight: 20, marginTop: 6 },
  card: {
    borderRadius: Radius.xlarge,
    padding: 16,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: Shadows.soft,
  },
  label: { color: Palette.textSecondary, fontSize: 12, fontWeight: '900', marginTop: 12, marginBottom: 7 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: {
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Palette.borderStrong,
    backgroundColor: Palette.surface,
  },
  typeChipSelected: { backgroundColor: Palette.primary, borderColor: Palette.primary },
  typeText: { color: Palette.textSecondary, fontSize: 12, fontWeight: '900' },
  typeTextSelected: { color: Palette.white },
  input: {
    borderRadius: Radius.large,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surfaceMuted,
    color: Palette.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  textArea: { minHeight: 118 },
});
