import { StyleSheet } from 'react-native';
import { Palette, Radius } from '@/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  content: {
    padding: 24,
  },
  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: Radius.large,
    backgroundColor: Palette.primarySoft,
    borderWidth: 1,
    borderColor: Palette.primaryBorder,
    marginBottom: 20,
  },
  introIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.surface,
  },
  introEmoji: { fontSize: 25 },
  introTitle: { color: Palette.text, fontSize: 17, fontWeight: '800' },
  introText: { color: Palette.textSecondary, fontSize: 11, lineHeight: 16, marginTop: 3 },
  scanButton: {
    borderWidth: 1.5,
    borderColor: Palette.primary,
    borderRadius: Radius.medium,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  scanButtonText: {
    color: Palette.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.textSecondary,
    marginBottom: 6,
  },
  suggestions: {
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: Radius.medium,
    backgroundColor: Palette.surface,
    marginTop: -8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  suggestionRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Palette.surfaceMuted,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.text,
  },
  suggestionIngredients: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 1,
  },
  selectedInfo: {
    fontSize: 13,
    color: Palette.success,
    marginTop: -8,
    marginBottom: 16,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    borderWidth: 1,
    borderColor: Palette.borderStrong,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Palette.surface,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.textSecondary,
  },
  chipTextSelected: {
    color: Palette.white,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});


