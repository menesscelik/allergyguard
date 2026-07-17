import { StyleSheet } from 'react-native';

import { Palette, Radius, Shadows } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  content: { paddingTop: 12, paddingBottom: 44, gap: 14 },
  card: {
    padding: 18,
    borderRadius: Radius.xlarge,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: Shadows.soft,
    gap: 12,
  },
  sectionTitle: { color: Palette.text, fontSize: 17, fontWeight: '900' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowCopy: { flex: 1 },
  rowTitle: { color: Palette.text, fontSize: 15, fontWeight: '800' },
  rowDesc: { color: Palette.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 2 },
  languageOption: {
    padding: 14,
    borderRadius: Radius.large,
    borderWidth: 1,
    borderColor: Palette.border,
    color: Palette.textSecondary,
    fontWeight: '800',
  },
  languageOptionSelected: {
    backgroundColor: Palette.primarySoft,
    borderColor: Palette.primary,
    color: Palette.primary,
  },
  systemText: { color: Palette.textSecondary, fontSize: 14, lineHeight: 20 },
});
