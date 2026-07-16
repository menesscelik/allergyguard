import { StyleSheet } from 'react-native';
import { Palette, Radius } from '@/constants/theme';
import { PRIMARY } from '@/components/form';

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 16,
    padding: 20,
    borderRadius: Radius.large,
    backgroundColor: Palette.accentSoft,
  },
  eyebrow: {
    color: Palette.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Palette.text,
    marginTop: 3,
  },
  subtitle: {
    color: Palette.textSecondary,
    fontSize: 13,
    marginTop: 3,
  },
  clockBadge: {
    width: 56,
    height: 56,
    borderRadius: 19,
    backgroundColor: Palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 20px rgba(79, 70, 229, 0.18)',
  },
  clockEmoji: {
    fontSize: 29,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.surface,
    borderRadius: Radius.medium,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: '0 4px 14px rgba(19, 46, 50, 0.05)',
  },
  time: {
    fontSize: 24,
    fontWeight: '800',
    color: Palette.text,
  },
  drugName: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.textSecondary,
    marginTop: 2,
  },
  days: {
    fontSize: 13,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  notes: {
    fontSize: 12,
    color: Palette.textMuted,
    marginTop: 2,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 10,
    marginLeft: 12,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 44,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.text,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: Palette.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 5px 16px rgba(11, 129, 120, 0.34)',
  },
});


