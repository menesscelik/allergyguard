import { StyleSheet } from 'react-native';
import { Palette, Radius } from '@/constants/theme';
import { PRIMARY } from '@/components/form';

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  content: {
    padding: 20,
  },
  profileHero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.primary,
    borderRadius: Radius.large,
    padding: 20,
    marginBottom: 20,
    boxShadow: '0 10px 26px rgba(11, 129, 120, 0.22)',
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: Palette.onPrimarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Palette.white,
    fontSize: 25,
    fontWeight: '800',
  },
  profileCopy: {
    flex: 1,
    marginLeft: 14,
  },
  eyebrow: {
    color: Palette.primaryBorder,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Palette.white,
    marginTop: 2,
  },
  heroEmail: {
    color: Palette.onPrimaryMuted,
    fontSize: 12,
    marginTop: 2,
  },
  card: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.medium,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Palette.border,
    boxShadow: '0 4px 14px rgba(19, 46, 50, 0.05)',
  },
  emailLabel: {
    fontSize: 12,
    color: Palette.textSecondary,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: Palette.text,
    marginTop: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.textSecondary,
    marginBottom: 6,
  },
  langRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  langChip: {
    borderWidth: 1,
    borderColor: Palette.borderStrong,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Palette.surface,
  },
  langChipSelected: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  langText: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.textSecondary,
  },
  langTextSelected: {
    color: Palette.white,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.surface,
    borderRadius: Radius.medium,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.text,
  },
  settingDesc: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  premiumCard: {
    backgroundColor: Palette.premiumSoft,
    borderColor: Palette.premiumBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.premium,
  },
  premiumText: {
    fontSize: 13,
    color: Palette.premium,
    marginTop: 4,
  },
  signOut: {
    marginTop: 32,
    alignItems: 'center',
    paddingVertical: 12,
  },
  signOutText: {
    color: Palette.danger,
    fontSize: 16,
    fontWeight: '600',
  },
  deleteAccount: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 2,
    marginBottom: 24,
  },
  deleteAccountText: {
    color: Palette.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});


