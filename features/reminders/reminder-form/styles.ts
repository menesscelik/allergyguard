import { StyleSheet } from 'react-native';
import { Palette, Radius } from '@/constants/theme';
import { PRIMARY } from '@/components/form';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  content: {
    padding: 24,
  },
  introCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16,
    borderRadius: Radius.large, backgroundColor: Palette.accentSoft,
    borderWidth: 1, borderColor: Palette.premiumBorder, marginBottom: 20,
  },
  introIcon: {
    width: 48, height: 48, borderRadius: 16, alignItems: 'center',
    justifyContent: 'center', backgroundColor: Palette.surface,
  },
  introEmoji: { fontSize: 25 },
  introTitle: { color: Palette.text, fontSize: 17, fontWeight: '800' },
  introText: { color: Palette.textSecondary, fontSize: 12, marginTop: 3 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.textSecondary,
    marginBottom: 6,
  },
  timePicker: {
    alignItems: 'center',
    marginBottom: 16,
  },
  dayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  dayChip: {
    borderWidth: 1,
    borderColor: Palette.borderStrong,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dayChipSelected: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.textSecondary,
  },
  dayTextSelected: {
    color: Palette.white,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  quickLink: {
    color: PRIMARY,
    fontWeight: '600',
    fontSize: 13,
  },
});


