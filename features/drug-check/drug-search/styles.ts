import { StyleSheet } from 'react-native';
import { Palette, Radius } from '@/constants/theme';
import { PRIMARY } from '@/components/form';

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  header: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 20,
    borderRadius: Radius.large,
    backgroundColor: Palette.primary,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    color: Palette.primaryBorder,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  labBadge: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: Palette.onPrimarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labEmoji: {
    fontSize: 27,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Palette.white,
    marginTop: 3,
  },
  subtitle: {
    fontSize: 14,
    color: Palette.primaryBorder,
    marginTop: 10,
  },
  quota: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.white,
    backgroundColor: Palette.onPrimarySurface,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 14,
    overflow: 'hidden',
  },
  searchCard: {
    margin: 16,
    padding: 14,
    borderRadius: Radius.large,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: '0 8px 24px rgba(19, 46, 50, 0.07)',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Palette.borderStrong,
    borderRadius: Radius.medium,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: Palette.text,
    backgroundColor: Palette.surface,
  },
  searchButton: {
    backgroundColor: PRIMARY,
    borderRadius: Radius.medium,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: Palette.white,
    fontWeight: '700',
    fontSize: 16,
  },
  scanButton: {
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: PRIMARY,
    borderRadius: Radius.medium,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: Palette.primarySoft,
  },
  scanButtonText: {
    color: PRIMARY,
    fontSize: 15,
    fontWeight: '700',
  },
  error: {
    color: Palette.danger,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  card: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.medium,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  drugName: {
    fontSize: 17,
    fontWeight: '700',
    color: Palette.text,
  },
  ingredients: {
    fontSize: 13,
    color: Palette.textSecondary,
    marginTop: 4,
  },
  testLink: {
    color: PRIMARY,
    fontWeight: '600',
    fontSize: 14,
    marginTop: 8,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});


